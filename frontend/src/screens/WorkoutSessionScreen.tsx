import { useState, useEffect } from 'react';
import type { RouteProp } from '@react-navigation/native';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { mockWorkoutState } from '../data/mockData';
import type { RootStackParamList } from '../navigation';
import { useTheme } from '../theme';

type WorkoutSessionScreenProps = {
  route: RouteProp<RootStackParamList, 'WorkoutSession'>;
  navigation: any;
};

type ExerciseProgress = {
  exerciseId: string;
  completedSets: number;
  weight: string;
};

export function WorkoutSessionScreen({
  route,
  navigation,
}: WorkoutSessionScreenProps) {
  const { theme } = useTheme();
  const trainingDay = mockWorkoutState.plans
    .flatMap((plan) => plan.trainingDays)
    .find((day) => day.id === route.params.trainingDayId);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<
    Record<string, ExerciseProgress>
  >({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentExercise = trainingDay?.exercises[currentExerciseIndex];
  const totalExercises = trainingDay?.exercises.length ?? 0;

  const progress = currentExercise
    ? exerciseProgress[currentExercise.id] || {
        exerciseId: currentExercise.id,
        completedSets: 0,
        weight: '',
      }
    : null;

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const startTimer = () => {
    if (currentExercise) {
      setTimerSeconds(currentExercise.restSeconds);
      setIsTimerRunning(true);
    }
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const completeSet = () => {
    if (!currentExercise || !progress) return;

    const newCompletedSets = progress.completedSets + 1;

    setExerciseProgress({
      ...exerciseProgress,
      [currentExercise.id]: {
        ...progress,
        completedSets: newCompletedSets,
      },
    });

    // Auto-start timer if not all sets completed
    if (newCompletedSets < currentExercise.sets) {
      startTimer();
    }
  };

  const updateWeight = (weight: string) => {
    if (!currentExercise) return;

    setExerciseProgress({
      ...exerciseProgress,
      [currentExercise.id]: {
        ...progress!,
        weight,
      },
    });
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetTimer();
    }
  };

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      resetTimer();
    }
  };

  const saveWorkout = () => {
    Alert.alert('Trening zapisany', 'Twój trening został pomyślnie zapisany!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!trainingDay || !currentExercise) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.palette.background }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
          }}
        >
          <Text
            style={{
              ...theme.typography.heading2,
              color: theme.palette.text.primary,
            }}
          >
            Nie znaleziono treningu
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.background }}
    >
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: theme.palette.border,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ alignSelf: 'flex-start', marginBottom: theme.spacing.md }}
          >
            <Text
              style={{ ...theme.typography.body, color: theme.palette.primary }}
            >
              ← Wróć
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              ...theme.typography.heading1,
              color: theme.palette.text.primary,
              marginBottom: theme.spacing.xs,
            }}
          >
            {trainingDay.name}
          </Text>
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.palette.text.muted,
            }}
          >
            Ćwiczenie {currentExerciseIndex + 1} z {totalExercises}
          </Text>
        </View>

        {/* Exercise Info */}
        <View style={{ padding: theme.spacing.lg }}>
          <View
            style={{
              backgroundColor: theme.palette.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.palette.primary,
                  width: 40,
                  height: 40,
                  borderRadius: theme.radii.full,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing.md,
                }}
              >
                <Text
                  style={[
                    (theme.typography.button as any),
                    {
                      color: theme.palette.background,
                      fontSize: 18,
                    },
                  ]}
                >
                  {currentExercise.orderNumber}
                </Text>
              </View>
              <Text
                style={{
                  ...theme.typography.heading2,
                  color: theme.palette.text.primary,
                  flex: 1,
                }}
              >
                {currentExercise.name}
              </Text>
            </View>

            {/* Exercise Details */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: theme.spacing.md,
              }}
            >
              <View style={{ width: '50%', marginBottom: theme.spacing.sm }}>
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Serie
                </Text>
                <Text
                  style={{
                    ...theme.typography.body,
                    color: theme.palette.text.primary,
                    fontWeight: '600' as const,
                  }}
                >
                  {currentExercise.sets}
                </Text>
              </View>
              <View style={{ width: '50%', marginBottom: theme.spacing.sm }}>
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Powtórzenia
                </Text>
                <Text
                  style={{
                    ...theme.typography.body,
                    color: theme.palette.text.primary,
                    fontWeight: '600' as const,
                  }}
                >
                  {currentExercise.reps}
                </Text>
              </View>
              <View style={{ width: '50%' }}>
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Tempo
                </Text>
                <Text
                  style={{
                    ...theme.typography.body,
                    color: theme.palette.text.primary,
                    fontWeight: '600' as const,
                  }}
                >
                  {currentExercise.tempo}
                </Text>
              </View>
              <View style={{ width: '50%' }}>
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Odpoczynek
                </Text>
                <Text
                  style={{
                    ...theme.typography.body,
                    color: theme.palette.text.primary,
                    fontWeight: '600' as const,
                  }}
                >
                  {currentExercise.restSeconds}s
                </Text>
              </View>
            </View>

            {currentExercise.notes && (
              <View
                style={{
                  backgroundColor: theme.palette.background,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.md,
                }}
              >
                <Text
                  style={{
                    ...theme.typography.caption,
                    color: theme.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Notatki
                </Text>
                <Text
                  style={{
                    ...theme.typography.body,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {currentExercise.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Weight Input */}
          <View
            style={{
              backgroundColor: theme.palette.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.heading3,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing.md,
              }}
            >
              Obciążenie
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.palette.background,
                borderRadius: theme.radii.md,
                padding: theme.spacing.md,
                color: theme.palette.text.primary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: theme.palette.border,
              }}
              placeholder='Wpisz ciężar (kg)'
              placeholderTextColor={theme.palette.text.muted}
              keyboardType='decimal-pad'
              value={progress?.weight || ''}
              onChangeText={updateWeight}
            />
          </View>

          {/* Series Progress */}
          <View
            style={{
              backgroundColor: theme.palette.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              <Text
                style={{
                  ...theme.typography.heading3,
                  color: theme.palette.text.primary,
                }}
              >
                Postęp serii
              </Text>
              <Text
                style={{
                  ...theme.typography.heading3,
                  color: theme.palette.primary,
                }}
              >
                {progress?.completedSets || 0} / {currentExercise.sets}
              </Text>
            </View>

            {/* Series indicators */}
            <View
              style={{ flexDirection: 'row', marginBottom: theme.spacing.lg }}
            >
              {Array.from({ length: currentExercise.sets }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor:
                      index < (progress?.completedSets || 0)
                        ? theme.palette.success
                        : theme.palette.surfaceMuted,
                    marginRight:
                      index < currentExercise.sets - 1 ? theme.spacing.xs : 0,
                    borderRadius: theme.radii.sm,
                  }}
                />
              ))}
            </View>

            {progress && progress.completedSets < currentExercise.sets ? (
              <TouchableOpacity
                onPress={completeSet}
                style={{
                  backgroundColor: theme.palette.primary,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    ...theme.typography.button,
                    color: theme.palette.background,
                  }}
                >
                  Zakończ serię {(progress?.completedSets || 0) + 1}
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  backgroundColor: theme.palette.success,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    ...theme.typography.button,
                    color: theme.palette.background,
                  }}
                >
                  ✓ Wszystkie serie ukończone
                </Text>
              </View>
            )}
          </View>

          {/* Timer */}
          <View
            style={{
              backgroundColor: theme.palette.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.heading3,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing.md,
              }}
            >
              Timer odpoczynku
            </Text>

            <View
              style={{ alignItems: 'center', marginBottom: theme.spacing.md }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: '700' as const,
                  color:
                    timerSeconds > 0
                      ? theme.palette.primary
                      : theme.palette.text.muted,
                  marginBottom: theme.spacing.sm,
                }}
              >
                {formatTime(timerSeconds)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {!isTimerRunning ? (
                <TouchableOpacity
                  onPress={startTimer}
                  style={{
                    flex: 1,
                    backgroundColor: theme.palette.primary,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.md,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      ...theme.typography.button,
                      color: theme.palette.background,
                    }}
                  >
                    Start
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={stopTimer}
                  style={{
                    flex: 1,
                    backgroundColor: theme.palette.warning,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.md,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      ...theme.typography.button,
                      color: theme.palette.background,
                    }}
                  >
                    Pauza
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={resetTimer}
                style={{
                  flex: 1,
                  backgroundColor: theme.palette.surfaceMuted,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    ...theme.typography.button,
                    color: theme.palette.text.primary,
                  }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            }}
          >
            <TouchableOpacity
              onPress={goToPreviousExercise}
              disabled={currentExerciseIndex === 0}
              style={{
                flex: 1,
                backgroundColor:
                  currentExerciseIndex === 0
                    ? theme.palette.surfaceMuted
                    : theme.palette.surface,
                borderRadius: theme.radii.md,
                padding: theme.spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.palette.border,
              }}
            >
              <Text
                style={{
                  ...theme.typography.button,
                  color:
                    currentExerciseIndex === 0
                      ? theme.palette.text.muted
                      : theme.palette.text.primary,
                }}
              >
                ← Poprzednie
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToNextExercise}
              disabled={currentExerciseIndex === totalExercises - 1}
              style={{
                flex: 1,
                backgroundColor:
                  currentExerciseIndex === totalExercises - 1
                    ? theme.palette.surfaceMuted
                    : theme.palette.surface,
                borderRadius: theme.radii.md,
                padding: theme.spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.palette.border,
              }}
            >
              <Text
                style={{
                  ...theme.typography.button,
                  color:
                    currentExerciseIndex === totalExercises - 1
                      ? theme.palette.text.muted
                      : theme.palette.text.primary,
                }}
              >
                Następne →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save Workout Button */}
          <TouchableOpacity
            onPress={saveWorkout}
            style={{
              backgroundColor: theme.palette.success,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                ...theme.typography.button,
                color: theme.palette.background,
                fontSize: 18,
              }}
            >
              Zapisz trening
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default WorkoutSessionScreen;
