import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, WorkoutPlan, WorkoutSession } from '../services/api';
import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
  createRefreshControl,
  Select,
  StatCard,
} from '../components';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 150;
const CHART_PADDING = 40;

export function ProgressScreen() {
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTrainingDayId, setSelectedTrainingDayId] = useState<
    string | null
  >(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );

  const fetchProgress = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const plans = await apiClient.getWorkoutPlans();
      const active = plans.find((p) => p.isActive) ?? null;
      setActivePlan(active);

      if (!active) {
        setSessions([]);
        return;
      }

      const history = await apiClient.getWorkoutSessionHistory(active.id);
      setSessions(history.filter((s) => s.isCompleted));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Nie udało się załadować postępu',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [fetchProgress]),
  );

  const onRefresh = () => fetchProgress(true);

  // Get unique training days from sessions
  const trainingDays = useMemo(() => {
    const daysMap = new Map<string, string>();
    for (const session of sessions) {
      if (!daysMap.has(session.trainingDayId)) {
        daysMap.set(
          session.trainingDayId,
          session.trainingDayName || `Dzień ${session.trainingDayId}`,
        );
      }
    }
    return Array.from(daysMap.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  // Get exercises for selected training day
  const availableExercises = useMemo(() => {
    if (!selectedTrainingDayId) return [];

    const exercisesMap = new Map<string, string>();
    for (const session of sessions) {
      if (session.trainingDayId === selectedTrainingDayId) {
        for (const log of session.exerciseLogs) {
          if (!exercisesMap.has(log.exerciseId)) {
            exercisesMap.set(
              log.exerciseId,
              log.exerciseName || log.exerciseId,
            );
          }
        }
      }
    }
    return Array.from(exercisesMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [sessions, selectedTrainingDayId]);

  // Calculate progress data for selected exercise
  const exerciseProgressData = useMemo(() => {
    if (!activePlan || !selectedExerciseId) return null;

    const dataPoints: {
      week: number;
      weight: number | null;
      date: string | null;
    }[] = [];

    // Initialize all weeks
    for (let i = 1; i <= activePlan.weekDuration; i++) {
      dataPoints.push({ week: i, weight: null, date: null });
    }

    // Fill in data from sessions
    for (const session of sessions) {
      if (
        selectedTrainingDayId &&
        session.trainingDayId !== selectedTrainingDayId
      )
        continue;

      const log = session.exerciseLogs.find(
        (l) => l.exerciseId === selectedExerciseId,
      );
      if (
        log &&
        log.startingWeight !== null &&
        log.startingWeight !== undefined
      ) {
        const point = dataPoints.find((p) => p.week === session.weekNumber);
        if (
          point &&
          (point.weight === null ||
            (session.completedAt &&
              (!point.date ||
                new Date(session.completedAt) > new Date(point.date))))
        ) {
          point.weight = log.startingWeight;
          point.date = session.completedAt ?? null;
        }
      }
    }

    const weights = dataPoints
      .filter((p) => p.weight !== null)
      .map((p) => p.weight as number);
    const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
    const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
    const latestWeight =
      weights.length > 0 ? weights[weights.length - 1] : null;
    const firstWeight = weights.length > 0 ? weights[0] : null;

    let progressPercentage: number | null = null;
    if (firstWeight && latestWeight && firstWeight > 0) {
      progressPercentage = ((latestWeight - firstWeight) / firstWeight) * 100;
    }

    const exerciseName =
      availableExercises.find((e) => e.id === selectedExerciseId)?.name ??
      selectedExerciseId;

    return {
      exerciseName,
      dataPoints,
      maxWeight,
      minWeight,
      latestWeight,
      firstWeight,
      progressPercentage,
    };
  }, [
    activePlan,
    sessions,
    selectedTrainingDayId,
    selectedExerciseId,
    availableExercises,
  ]);

  // Simple line chart component
  const renderChart = () => {
    if (!exerciseProgressData) return null;

    const { dataPoints, maxWeight, minWeight } = exerciseProgressData;
    const points = dataPoints.filter((p) => p.weight !== null);

    if (points.length === 0) {
      return (
        <View className='bg-slate-800 rounded-xl p-6 items-center'>
          <Text className='text-gray-400'>
            Brak danych do wyświetlenia wykresu
          </Text>
        </View>
      );
    }

    const chartWidth = SCREEN_WIDTH - 48 - CHART_PADDING * 2;
    const chartHeight = CHART_HEIGHT;
    const range = maxWeight - minWeight || 1;

    return (
      <View className='bg-slate-800 rounded-xl p-4 mb-4'>
        <Text className='text-white font-bold text-lg mb-4'>
          Wykres postępu - {exerciseProgressData.exerciseName}
        </Text>

        {/* Chart */}
        <View style={{ height: chartHeight + 40, position: 'relative' }}>
          {/* Y-axis labels */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: chartHeight,
              justifyContent: 'space-between',
            }}
          >
            <Text className='text-gray-400 text-xs'>{maxWeight}kg</Text>
            <Text className='text-gray-400 text-xs'>
              {Math.round((maxWeight + minWeight) / 2)}kg
            </Text>
            <Text className='text-gray-400 text-xs'>{minWeight}kg</Text>
          </View>

          {/* Chart area */}
          <View
            style={{
              marginLeft: CHART_PADDING,
              marginRight: 8,
              height: chartHeight,
              position: 'relative',
            }}
          >
            {/* Grid lines */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {[0, 0.5, 1].map((ratio, i) => (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    top: ratio * chartHeight,
                    left: 0,
                    right: 0,
                    height: 1,
                    backgroundColor: '#374151',
                  }}
                />
              ))}
            </View>

            {/* Data points and lines */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {points.map((point, index) => {
                const x =
                  ((point.week - 1) / (dataPoints.length - 1)) * chartWidth;
                const y =
                  chartHeight -
                  ((point.weight! - minWeight) / range) * chartHeight;

                return (
                  <View key={point.week}>
                    {/* Line to next point */}
                    {index < points.length - 1 &&
                      (() => {
                        const nextPoint = points[index + 1];
                        const nextX =
                          ((nextPoint.week - 1) / (dataPoints.length - 1)) *
                          chartWidth;
                        const nextY =
                          chartHeight -
                          ((nextPoint.weight! - minWeight) / range) *
                            chartHeight;
                        const length = Math.sqrt(
                          Math.pow(nextX - x, 2) + Math.pow(nextY - y, 2),
                        );
                        const angle =
                          (Math.atan2(nextY - y, nextX - x) * 180) / Math.PI;

                        return (
                          <View
                            style={{
                              position: 'absolute',
                              left: x,
                              top: y,
                              width: length,
                              height: 2,
                              backgroundColor: '#AB8BFF',
                              transformOrigin: 'left center',
                              transform: [{ rotate: `${angle}deg` }],
                            }}
                          />
                        );
                      })()}

                    {/* Point */}
                    <View
                      style={{
                        position: 'absolute',
                        left: x - 6,
                        top: y - 6,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#AB8BFF',
                        borderWidth: 2,
                        borderColor: '#1e1e2e',
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          {/* X-axis labels */}
          <View
            style={{
              marginLeft: CHART_PADDING,
              marginRight: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            {dataPoints.map((point) => (
              <Text
                key={point.week}
                className='text-gray-400 text-xs'
              >
                T{point.week}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <ScrollView
        className='flex-1 px-6 pt-4'
        refreshControl={createRefreshControl(isRefreshing, onRefresh)}
      >
        <Text className='text-3xl font-bold text-white mb-2'>Postęp</Text>
        <Text className='text-gray-400 text-base mb-6'>
          Śledź swoje postępy w ćwiczeniach
        </Text>

        {isLoading ? (
          <LoadingSpinner message='Ładowanie postępu...' />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={onRefresh}
          />
        ) : !activePlan ? (
          <EmptyState
            title='Brak aktywnego planu'
            message='Aktywuj plan w zakładce "Plany", aby zobaczyć swój postęp.'
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            title='Brak zapisanych treningów'
            message='Ukończ przynajmniej jeden trening, aby zobaczyć postęp.'
          />
        ) : (
          <View className='pb-8'>
            {/* Training Day Filter */}
            <View className='mb-4'>
              <Select
                label='Dzień treningowy'
                placeholder='Wybierz dzień treningowy...'
                options={[
                  { value: null, label: 'Wszystkie dni' },
                  ...trainingDays.map((day) => ({
                    value: day.id,
                    label: day.name,
                  })),
                ]}
                value={selectedTrainingDayId}
                onChange={(value: string | null) => {
                  setSelectedTrainingDayId(value);
                  setSelectedExerciseId(null);
                }}
              />
            </View>

            {/* Exercise Filter (only show if training day is selected) */}
            {selectedTrainingDayId && availableExercises.length > 0 && (
              <View className='mb-6'>
                <Select
                  label='Ćwiczenie'
                  placeholder='Wybierz ćwiczenie...'
                  options={availableExercises.map((exercise) => ({
                    value: exercise.id,
                    label: exercise.name,
                  }))}
                  value={selectedExerciseId}
                  onChange={(value: string | null) =>
                    setSelectedExerciseId(value)
                  }
                />
              </View>
            )}

            {/* Stats Cards */}
            {exerciseProgressData && (
              <View className='flex-row gap-3 mb-4'>
                <StatCard
                  label='Aktualny ciężar'
                  value={
                    exerciseProgressData.latestWeight !== null
                      ? `${exerciseProgressData.latestWeight} kg`
                      : '—'
                  }
                />
                <StatCard
                  label='Postęp'
                  value={
                    exerciseProgressData.progressPercentage !== null
                      ? `${exerciseProgressData.progressPercentage > 0 ? '+' : ''}${exerciseProgressData.progressPercentage.toFixed(1)}%`
                      : '—'
                  }
                  trend={
                    exerciseProgressData.progressPercentage !== null
                      ? exerciseProgressData.progressPercentage > 0
                        ? 'up'
                        : exerciseProgressData.progressPercentage < 0
                          ? 'down'
                          : 'neutral'
                      : undefined
                  }
                />
              </View>
            )}

            {/* Chart */}
            {selectedExerciseId && renderChart()}

            {/* Week by Week Progress */}
            {exerciseProgressData && (
              <View className='mt-4'>
                <Text className='text-white font-bold text-lg mb-4'>
                  Szczegóły tygodniowe
                </Text>
                {exerciseProgressData.dataPoints.map((point) => (
                  <View
                    key={point.week}
                    className='bg-slate-800 rounded-xl p-4 mb-2 flex-row items-center justify-between'
                  >
                    <View className='flex-row items-center'>
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                          point.weight !== null
                            ? 'bg-purple-600'
                            : 'bg-slate-700'
                        }`}
                      >
                        <Text className='text-white font-bold'>
                          {point.week}
                        </Text>
                      </View>
                      <Text className='text-gray-300'>
                        Tydzień {point.week}
                      </Text>
                    </View>
                    <View className='items-end'>
                      <Text
                        className={`font-bold ${point.weight !== null ? 'text-white text-lg' : 'text-gray-500'}`}
                      >
                        {point.weight !== null ? `${point.weight} kg` : '—'}
                      </Text>
                      {point.date && (
                        <Text className='text-gray-500 text-xs'>
                          {new Date(point.date).toLocaleDateString('pl-PL')}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Hint when no exercise selected */}
            {!selectedExerciseId && selectedTrainingDayId && (
              <EmptyState message='Wybierz ćwiczenie powyżej, aby zobaczyć szczegółowy wykres postępu.' />
            )}

            {!selectedTrainingDayId && (
              <EmptyState message='Wybierz dzień treningowy powyżej, aby zobaczyć dostępne ćwiczenia i postępy.' />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProgressScreen;
