import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { apiClient, TrainingDay } from '../services/api';

type ExerciseProgress = {
  exerciseId: string;
  completedSets: number;
  weight: string;
};

export function WorkoutSessionScreen() {
  const { trainingDayId } = useLocalSearchParams<{ trainingDayId: string }>();
  const [trainingDay, setTrainingDay] = useState<TrainingDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch training day data
  useEffect(() => {
    const fetchTrainingDay = async () => {
      if (!trainingDayId) {
        setError('Brak ID dnia treningowego');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get all plans to find the one containing this training day
        const plans = await apiClient.getWorkoutPlans();
        let foundDay: TrainingDay | null = null;

        for (const plan of plans) {
          const days = await apiClient.getTrainingDays(plan.id);
          const day = days.find((d) => d.id === trainingDayId);
          if (day) {
            // Fetch exercises for this training day
            const exercises = await apiClient.getExercises(day.id);
            foundDay = { ...day, exercises };
            break;
          }
        }

        if (foundDay) {
          setTrainingDay(foundDay);
        } else {
          setError('Nie znaleziono dnia treningowego');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Nie udało się załadować dnia treningowego',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingDay();
  }, [trainingDayId]);

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

  if (isLoading) {
    return (
      <SafeAreaView className='flex-1 bg-slate-900'>
        <View className='items-center justify-center flex-1 px-6'>
          <ActivityIndicator
            size='large'
            color='#AB8BFF'
          />
          <Text className='mt-4 text-gray-400'>Ładowanie treningu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !trainingDay) {
    return (
      <SafeAreaView className='flex-1 bg-slate-900'>
        <View className='items-center justify-center flex-1 px-6'>
          <Text className='mb-4 text-2xl font-bold text-white'>
            {error || 'Nie znaleziono treningu'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className='px-6 py-3 bg-purple-500 rounded-lg'
          >
            <Text className='font-semibold text-center text-white'>
              Powrót do ekranu głównego
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentExercise || trainingDay.exercises.length === 0) {
    return (
      <SafeAreaView className='flex-1 bg-slate-900'>
        <View className='items-center justify-center flex-1 px-6'>
          <Text className='mb-4 text-2xl font-bold text-white'>
            Brak ćwiczeń w tym dniu treningowym
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className='px-6 py-3 bg-purple-500 rounded-lg'
          >
            <Text className='font-semibold text-center text-white'>
              Powrót do ekranu głównego
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
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
          style={{
            alignSelf: 'flex-start',
            marginBottom: themeColors.spacing.md,
          }}
        >
          <Text
            style={{
              color: themeColors.palette.primary,
            }}
          >
            ← Wróć
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: themeColors.palette.text.primary,
            marginBottom: themeColors.spacing.xs,
          }}
        >
          {trainingDay.name}
        </Text>
        <Text
          style={{
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
                    themeColors.typography.button as any,
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
              <View
                style={{ width: '50%', marginBottom: themeColors.spacing.sm }}
              >
                <Text
                  style={{
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
              <View
                style={{ width: '50%', marginBottom: themeColors.spacing.sm }}
              >
                <Text
                  style={{
                    color: themeColors.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Powtórzenia
                </Text>
                <Text
                  style={{
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
                    color: themeColors.palette.text.muted,
                    marginBottom: 4,
                  }}
                >
                  Notatki
                </Text>
                <Text
                  style={{
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
                  color: themeColors.palette.text.primary,
                }}
              >
                Postęp serii
              </Text>
              <Text
                style={{
                  color: themeColors.palette.primary,
                }}
              >
                {progress?.completedSets || 0} / {currentExercise.sets}
              </Text>
            </View>

            {/* Series indicators */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: themeColors.spacing.lg,
              }}
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
                      index < currentExercise.sets - 1
                        ? themeColors.spacing.xs
                        : 0,
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
                color: themeColors.palette.text.primary,
                marginBottom: themeColors.spacing.md,
              }}
            >
              Timer odpoczynku
            </Text>

            <View
              style={{
                alignItems: 'center',
                marginBottom: themeColors.spacing.md,
              }}
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
                  <Text className='font-semibold text-white'>Rozpocznij</Text>
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
                <Text className='font-semibold text-white'>Zresetuj</Text>
              </TouchableOpacity>
            </View>
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
