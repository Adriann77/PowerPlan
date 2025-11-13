import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mockWorkoutState } from '../data/mockData';
import type { MainTabParamList, RootStackParamList } from '../navigation';
import { useTheme } from '../theme';

type PlansScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Plans'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function PlansScreen({ navigation }: PlansScreenProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.palette.background,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
        }}
      >
        <Text
          style={{
            ...theme.typography.heading1,
            color: theme.palette.text.primary,
            marginBottom: theme.spacing.lg,
          }}
        >
          Workout Plans
        </Text>
        <FlatList
          data={mockWorkoutState.plans}
          keyExtractor={(plan) => plan.id}
          ItemSeparatorComponent={() => (
            <View style={{ height: theme.spacing.md }} />
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                // Navigate to first training day of the plan
                if (item.trainingDays.length > 0) {
                  navigation.navigate('DayExercise', {
                    trainingDayId: item.trainingDays[0].id,
                  });
                }
              }}
              style={{
                borderRadius: theme.radii.lg,
                padding: theme.spacing.lg,
                backgroundColor: item.isActive
                  ? theme.palette.surfaceElevated
                  : theme.palette.surface,
                borderWidth: 1,
                borderColor: item.isActive
                  ? theme.palette.primary
                  : theme.palette.border,
              }}
            >
              <Text
                style={{
                  ...theme.typography.heading2,
                  color: theme.palette.text.primary,
                  marginBottom: theme.spacing.sm,
                }}
              >
                {item.name}
              </Text>
              {item.description ? (
                <Text
                  style={{
                    ...theme.typography.body,
                    color: theme.palette.text.secondary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {item.description}
                </Text>
              ) : null}
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.palette.text.muted,
                }}
              >
                {item.trainingDays.length} training days • {item.weekDuration}
                -week block
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default PlansScreen;
