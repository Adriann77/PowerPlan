import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { mockWorkoutState } from '../data/mockData';

type ExerciseProgress = {
  exerciseId: string;
  completedSets: number;
  weight: string;
};

export function WorkoutSessionScreen() {
  const { trainingDayId } = useLocalSearchParams<{ trainingDayId: string }>();
  const trainingDay = mockWorkoutState.plans
    .flatMap((plan) => plan.trainingDays)
    .find((day) => day.id === trainingDayId);

  // Theme colors for WorkoutSessionScreen (keeping for now)
  const themeColors = {
    background: '#0f0d24',
    surface: '#1a1a2e',
    surfaceMuted: '#2a2a3e',
    primary: '#AB8BFF',
    success: '#10b981',
    warning: '#f59e0b',
    text: {
      primary: '#ffffff',
      secondary: '#9ca4ab',
      muted: '#6b7280',
    },
    border: '#374151',
    palette: {
      background: '#0f0d24',
      surface: '#1a1a2e',
      surfaceMuted: '#2a2a3e',
      primary: '#AB8BFF',
      success: '#10b981',
      warning: '#f59e0b',
      text: {
        primary: '#ffffff',
        secondary: '#9ca4ab',
        muted: '#6b7280',
      },
      border: '#374151',
    },
    typography: {
      heading1: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      heading2: {
        fontSize: 20,
        fontWeight: '600',
      },
      heading3: {
        fontSize: 18,
        fontWeight: '600',
      },
      body: {
        fontSize: 16,
        fontWeight: 'normal',
      },
      button: {
        fontSize: 16,
        fontWeight: '600',
      },
      caption: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    radii: {
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
  };

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
        onPress: () => router.back(),
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
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-2xl font-bold text-white">
            Nie znaleziono treningu
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
        style={{ flex: 1, backgroundColor: themeColors.background }}
    >
      {/* Fixed Header */}
      <View
        style={{
          paddingHorizontal: themeColors.spacing.lg,
          paddingTop: themeColors.spacing.md,
          paddingBottom: themeColors.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.palette.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: themeColors.spacing.md }}
        >
          <Text
            style={{ ...themeColors.typography.body, color: themeColors.palette.primary }}
          >
            ← Wróć
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            ...themeColors.typography.heading1,
            color: themeColors.palette.text.primary,
            marginBottom: themeColors.spacing.xs,
          }}
        >
          {trainingDay.name}
        </Text>
        <Text
          style={{
            ...themeColors.typography.caption,
            color: themeColors.palette.text.muted,
          }}
        >
          Ćwiczenie {currentExerciseIndex + 1} z {totalExercises}
        </Text>
      </View>

      {/* Scrollable Exercise Content */}
      <ScrollView style={{ flex: 1 }}>

        {/* Exercise Info */}
        <View style={{ padding: themeColors.spacing.lg }}>
          <View
            style={{
              backgroundColor: themeColors.palette.surface,
              borderRadius: themeColors.radii.lg,
              padding: themeColors.spacing.lg,
              marginBottom: themeColors.spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: themeColors.spacing.md,
              }}
            >
              <View
                style={{
                  backgroundColor: themeColors.palette.primary,
                  width: 40,
                  height: 40,
                  borderRadius: themeColors.radii.full,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: themeColors.spacing.md,
                }}
              >
                <Text
                  style={[
                    (themeColors.typography.button as any),
                    {
                      color: themeColors.palette.background,
                      fontSize: 18,
                    },
                  ]}
                >
                  {currentExercise.orderNumber}
                </Text>
              </View>
              <Text
                style={{
                  ...themeColors.typography.heading2,
                  color: themeColors.palette.text.primary,
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
                marginBottom: themeColors.spacing.md,
              }}
            >
              <View style={{ width: '50%', marginBottom: themeColors.spacing.sm }}>
                <Text
                  style={{
                    ...themeColors.typography.caption,
                    color: themeColors.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Serie
                </Text>
                <Text
                  style={{
                    ...themeColors.typography.body,
                    color: themeColors.palette.text.primary,
                    fontWeight: '600' as const,
                  }}
                >
                  {currentExercise.sets}
                </Text>
              </View>
              <View style={{ width: '50%', marginBottom: themeColors.spacing.sm }}>
                <Text
                  style={{
                    ...themeColors.typography.caption,
                    color: themeColors.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Powtórzenia
                </Text>
                <Text
                  style={{
                    ...themeColors.typography.body,
                    color: themeColors.palette.text.primary,
                    fontWeight: '600' as const,
                  }}
                >
                  {currentExercise.reps}
                </Text>
              </View>
              <View style={{ width: '50%' }}>
                <Text
                  style={{
                    ...themeColors.typography.caption,
                    color: themeColors.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Tempo
                </Text>
                <Text
                  style={{
                    ...themeColors.typography.body,
                    color: themeColors.palette.text.primary,
                    fontWeight: '600' as const,
                  }}
                >
                  {currentExercise.tempo}
                </Text>
              </View>
              <View style={{ width: '50%' }}>
                <Text
                  style={{
                    ...themeColors.typography.caption,
                    color: themeColors.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Odpoczynek
                </Text>
                <Text
                  style={{
                    ...themeColors.typography.body,
                    color: themeColors.palette.text.primary,
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
                  backgroundColor: themeColors.palette.background,
                  borderRadius: themeColors.radii.md,
                  padding: themeColors.spacing.md,
                }}
              >
                <Text
                  style={{
                    ...themeColors.typography.caption,
                    color: themeColors.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Notatki
                </Text>
                <Text
                  style={{
                    ...themeColors.typography.body,
                    color: themeColors.palette.text.secondary,
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
              backgroundColor: themeColors.palette.surface,
              borderRadius: themeColors.radii.lg,
              padding: themeColors.spacing.lg,
              marginBottom: themeColors.spacing.lg,
            }}
          >
            <Text
              style={{
                ...themeColors.typography.heading3,
                color: themeColors.palette.text.primary,
                marginBottom: themeColors.spacing.md,
              }}
            >
              Obciążenie
            </Text>
            <TextInput
              style={{
                backgroundColor: themeColors.palette.background,
                borderRadius: themeColors.radii.md,
                padding: themeColors.spacing.md,
                color: themeColors.palette.text.primary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: themeColors.palette.border,
              }}
              placeholder='Wpisz ciężar (kg)'
              placeholderTextColor={themeColors.palette.text.muted}
              keyboardType='decimal-pad'
              value={progress?.weight || ''}
              onChangeText={updateWeight}
            />
          </View>

          {/* Series Progress */}
          <View
            style={{
              backgroundColor: themeColors.palette.surface,
              borderRadius: themeColors.radii.lg,
              padding: themeColors.spacing.lg,
              marginBottom: themeColors.spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: themeColors.spacing.md,
              }}
            >
              <Text
                style={{
                  ...themeColors.typography.heading3,
                  color: themeColors.palette.text.primary,
                }}
              >
                Postęp serii
              </Text>
              <Text
                style={{
                  ...themeColors.typography.heading3,
                  color: themeColors.palette.primary,
                }}
              >
                {progress?.completedSets || 0} / {currentExercise.sets}
              </Text>
            </View>

            {/* Series indicators */}
            <View
              style={{ flexDirection: 'row', marginBottom: themeColors.spacing.lg }}
            >
              {Array.from({ length: currentExercise.sets }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor:
                      index < (progress?.completedSets || 0)
                        ? themeColors.palette.success
                        : themeColors.palette.surfaceMuted,
                    marginRight:
                      index < currentExercise.sets - 1 ? themeColors.spacing.xs : 0,
                    borderRadius: themeColors.radii.sm,
                  }}
                />
              ))}
            </View>

            {progress && progress.completedSets < currentExercise.sets ? (
              <TouchableOpacity
                onPress={completeSet}
                style={{
                  backgroundColor: themeColors.palette.primary,
                  borderRadius: themeColors.radii.md,
                  padding: themeColors.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    ...themeColors.typography.button,
                    color: themeColors.palette.background,
                  }}
                >
                  Zakończ serię {(progress?.completedSets || 0) + 1}
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  backgroundColor: themeColors.palette.success,
                  borderRadius: themeColors.radii.md,
                  padding: themeColors.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    ...themeColors.typography.button,
                    color: themeColors.palette.background,
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
              backgroundColor: themeColors.palette.surface,
              borderRadius: themeColors.radii.lg,
              padding: themeColors.spacing.lg,
              marginBottom: themeColors.spacing.lg,
            }}
          >
            <Text
              style={{
                ...themeColors.typography.heading3,
                color: themeColors.palette.text.primary,
                marginBottom: themeColors.spacing.md,
              }}
            >
              Timer odpoczynku
            </Text>

            <View
              style={{ alignItems: 'center', marginBottom: themeColors.spacing.md }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: '700' as const,
                  color:
                    timerSeconds > 0
                      ? themeColors.palette.primary
                      : themeColors.palette.text.muted,
                  marginBottom: themeColors.spacing.sm,
                }}
              >
                {formatTime(timerSeconds)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: themeColors.spacing.sm }}>
              {!isTimerRunning ? (
                <TouchableOpacity
                  onPress={startTimer}
                  style={{
                    flex: 1,
                    backgroundColor: themeColors.palette.primary,
                    borderRadius: themeColors.radii.md,
                    padding: themeColors.spacing.md,
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-white font-semibold">
                    Rozpocznij
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={stopTimer}
                  style={{
                    flex: 1,
                    backgroundColor: themeColors.palette.warning,
                    borderRadius: themeColors.radii.md,
                    padding: themeColors.spacing.md,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      ...themeColors.typography.button,
                      color: themeColors.palette.background,
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
                  backgroundColor: themeColors.palette.surfaceMuted,
                  borderRadius: themeColors.radii.md,
                  padding: themeColors.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-semibold">
                  Zresetuj
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: themeColors.spacing.md,
              marginBottom: themeColors.spacing.lg,
            }}
          >
            <TouchableOpacity
              onPress={goToPreviousExercise}
              disabled={currentExerciseIndex === 0}
              style={{
                flex: 1,
                backgroundColor:
                  currentExerciseIndex === 0
                    ? themeColors.palette.surfaceMuted
                    : themeColors.palette.surface,
                borderRadius: themeColors.radii.md,
                padding: themeColors.spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: themeColors.palette.border,
              }}
            >
              <Text
                style={{
                  ...themeColors.typography.button,
                  color:
                    currentExerciseIndex === 0
                      ? themeColors.palette.text.muted
                      : themeColors.palette.text.primary,
                }}
              >
                ← Poprzednie
              </Text>
            </TouchableOpacity>
            {currentExerciseIndex === totalExercises - 1 ? (
              <TouchableOpacity
                onPress={saveWorkout}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.palette.success,
                  borderRadius: themeColors.radii.md,
                  padding: themeColors.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    ...themeColors.typography.button,
                    color: themeColors.palette.background,
                    fontSize: 16,
                  }}
                >
                  Zapisz trening
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={goToNextExercise}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.palette.surface,
                  borderRadius: themeColors.radii.md,
                  padding: themeColors.spacing.md,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.palette.border,
                }}
              >
                <Text
                  style={{
                    ...themeColors.typography.button,
                    color: themeColors.palette.text.primary,
                  }}
                >
                  Następne →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Navigation Buttons */}
      <View
        style={{
          padding: themeColors.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: themeColors.palette.border,
          backgroundColor: themeColors.background,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: themeColors.spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={goToPreviousExercise}
            disabled={currentExerciseIndex === 0}
            style={{
              flex: 1,
              backgroundColor:
                currentExerciseIndex === 0
                  ? themeColors.palette.surfaceMuted
                  : themeColors.palette.surface,
              borderRadius: themeColors.radii.md,
              padding: themeColors.spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: themeColors.palette.border,
            }}
          >
            <Text
              style={{
                ...themeColors.typography.button,
                color:
                  currentExerciseIndex === 0
                    ? themeColors.palette.text.muted
                    : themeColors.palette.text.primary,
              }}
            >
              ← Poprzednie
            </Text>
          </TouchableOpacity>
          {currentExerciseIndex === totalExercises - 1 ? (
            <TouchableOpacity
              onPress={saveWorkout}
              style={{
                flex: 1,
                backgroundColor: themeColors.palette.success,
                borderRadius: themeColors.radii.md,
                padding: themeColors.spacing.md,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...themeColors.typography.button,
                  color: themeColors.palette.background,
                  fontSize: 16,
                }}
              >
                Zapisz trening
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={goToNextExercise}
              style={{
                flex: 1,
                backgroundColor: themeColors.palette.surface,
                borderRadius: themeColors.radii.md,
                padding: themeColors.spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: themeColors.palette.border,
              }}
            >
              <Text
                style={{
                  ...themeColors.typography.button,
                  color: themeColors.palette.text.primary,
                }}
              >
                Następne →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default WorkoutSessionScreen;
