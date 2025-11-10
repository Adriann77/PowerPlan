import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { mockWorkoutState } from '../data/mockData';
import type { RootStackParamList } from '../navigation';
import { useTheme } from '../theme';

type WorkoutSessionScreenProps = NativeStackScreenProps<RootStackParamList, 'WorkoutSession'>;

export function WorkoutSessionScreen({ route }: WorkoutSessionScreenProps) {
  const { theme } = useTheme();
  const trainingDay = mockWorkoutState.plans
    .flatMap((plan) => plan.trainingDays)
    .find((day) => day.id === route.params.trainingDayId);

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
          marginBottom: theme.spacing.sm,
        }}
      >
        {trainingDay?.name ?? 'Workout Session'}
      </Text>
      <Text style={{ ...theme.typography.body, color: theme.palette.text.secondary }}>
        Session detail and logging UI will be implemented in the next prompt.
      </Text>
    </View>
  );
}

export default WorkoutSessionScreen;


