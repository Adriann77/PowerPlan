import { FlatList, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { mockWorkoutState } from '../data/mockData';
import type { MainTabParamList } from '../navigation';
import { useTheme } from '../theme';

type PlansScreenProps = BottomTabScreenProps<MainTabParamList, 'Plans'>;

export function PlansScreen(_props: PlansScreenProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.palette.background,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl,
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
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        renderItem={({ item }) => (
          <View
            style={{
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              backgroundColor: item.isActive ? theme.palette.surfaceElevated : theme.palette.surface,
              borderWidth: 1,
              borderColor: item.isActive ? theme.palette.primary : theme.palette.border,
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
              {item.trainingDays.length} training days • {item.weekDuration}-week block
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export default PlansScreen;


