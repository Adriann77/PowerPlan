import { FlatList, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { mockWorkoutState } from '../data/mockData';
import type { MainTabParamList } from '../navigation';
import { useTheme } from '../theme';

type WorkoutHistoryScreenProps = BottomTabScreenProps<MainTabParamList, 'WorkoutHistory'>;

export function WorkoutHistoryScreen(_props: WorkoutHistoryScreenProps) {
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
        Workout History
      </Text>
      <FlatList
        data={mockWorkoutState.sessions}
        keyExtractor={(session) => session.id}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme.palette.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.heading3,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            >
              Training day: {item.trainingDayId}
            </Text>
            <Text
              style={{
                ...theme.typography.body,
                color: theme.palette.text.secondary,
              }}
            >
              Week {item.weekNumber} • {item.isCompleted ? 'Completed' : 'In progress'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export default WorkoutHistoryScreen;


