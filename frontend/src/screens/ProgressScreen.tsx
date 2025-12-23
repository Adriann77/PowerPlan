import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, WorkoutPlan, WorkoutSession } from '../services/api';

export function ProgressScreen() {
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
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
      setError(e instanceof Error ? e.message : 'Nie udało się załadować postępu');
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

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProgress();
  };

  type ExerciseWeekPoint = {
    week: number;
    weight: number | null;
  };

  type ExerciseSeries = {
    exerciseId: string;
    exerciseName: string;
    points: ExerciseWeekPoint[];
    maxWeight: number;
  };

  const exerciseSeries = useMemo<ExerciseSeries[]>(() => {
    if (!activePlan) return [];

    // For each exerciseId+week, take the latest completed session weight.
    const byKey = new Map<
      string,
      { weight: number | null; completedAt: number; exerciseName: string }
    >();

    for (const session of sessions) {
      const completedAtMs = session.completedAt
        ? new Date(session.completedAt).getTime()
        : 0;

      for (const log of session.exerciseLogs) {
        const w =
          log.startingWeight === null || log.startingWeight === undefined
            ? null
            : Number(log.startingWeight);
        const key = `${log.exerciseId}::${session.weekNumber}`;

        const prev = byKey.get(key);
        if (!prev || completedAtMs >= prev.completedAt) {
          byKey.set(key, {
            weight: Number.isFinite(w as number) ? (w as number) : null,
            completedAt: completedAtMs,
            exerciseName: log.exerciseName || log.exerciseId,
          });
        }
      }
    }

    // Build per-exercise series across all weeks of the plan.
    const perExercise = new Map<string, ExerciseSeries>();
    const weeks = Array.from({ length: activePlan.weekDuration }, (_, i) => i + 1);

    for (const [key, value] of byKey.entries()) {
      const [exerciseId, weekStr] = key.split('::');
      const week = Number(weekStr);

      if (!perExercise.has(exerciseId)) {
        perExercise.set(exerciseId, {
          exerciseId,
          exerciseName: value.exerciseName,
          points: weeks.map((w) => ({ week: w, weight: null })),
          maxWeight: 0,
        });
      }

      const series = perExercise.get(exerciseId)!;
      const point = series.points.find((p) => p.week === week);
      if (point) point.weight = value.weight;
    }

    // Compute maxWeight for scaling bars.
    for (const s of perExercise.values()) {
      const max = s.points.reduce((acc, p) => {
        if (p.weight === null) return acc;
        return Math.max(acc, p.weight);
      }, 0);
      s.maxWeight = max;
    }

    // Sort by name for stable UI.
    return Array.from(perExercise.values()).sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName, 'pl'),
    );
  }, [activePlan, sessions]);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-3xl font-bold text-white mb-2">Postęp</Text>
        <Text className="text-gray-400 text-base mb-6">
          Porównanie obciążeń dla każdego ćwiczenia w kolejnych tygodniach.
        </Text>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#AB8BFF" />
            <Text className="mt-4 text-gray-400">Ładowanie postępu...</Text>
          </View>
        ) : error ? (
          <View className="bg-red-900/20 border border-red-500 rounded-xl p-6">
            <Text className="text-red-400 text-base">{error}</Text>
          </View>
        ) : !activePlan ? (
          <View className="bg-slate-800 rounded-xl p-6">
            <Text className="text-white text-lg font-bold mb-2">
              Brak aktywnego planu
            </Text>
            <Text className="text-gray-400 text-base">
              Aktywuj plan w zakładce „Plany”, aby zobaczyć postęp.
            </Text>
          </View>
        ) : (
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#AB8BFF"
              />
            }
            data={exerciseSeries}
            keyExtractor={(item) => item.exerciseId}
            ItemSeparatorComponent={() => <View className="h-4" />}
            renderItem={({ item }) => (
              <View className="bg-slate-800 rounded-xl p-6">
                <Text className="text-white text-lg font-bold mb-4">
                  {item.exerciseName}
                </Text>

                <View className="gap-3">
                  {item.points.map((p) => {
                    const w = p.weight;
                    const ratio =
                      w === null || item.maxWeight === 0
                        ? 0
                        : Math.max(0, Math.min(1, w / item.maxWeight));

                    return (
                      <View
                        key={p.week}
                        className="flex-row items-center"
                      >
                        <Text className="text-gray-300 w-20">
                          Tydzień {p.week}
                        </Text>
                        <View className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                          <View
                            style={{ width: `${Math.round(ratio * 100)}%` }}
                            className="h-3 bg-purple-600"
                          />
                        </View>
                        <Text className="text-gray-200 w-20 text-right">
                          {w === null ? '—' : `${w} kg`}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="bg-slate-800 rounded-xl p-6">
                <Text className="text-gray-400 text-base">
                  Brak zapisanych treningów w tym planie.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default ProgressScreen;
