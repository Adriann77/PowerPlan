import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { apiClient, WorkoutSession } from '../services/api';

export function WorkoutHistoryScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setError(null);
      // Show history across all plans by default.
      const history = await apiClient.getWorkoutSessionHistory();
      setSessions(history);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się załadować historii');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchHistory();
  };

  const data = useMemo(
    () => sessions.filter((s) => s.isCompleted),
    [sessions],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-3xl font-bold text-white mb-6">
          Historia Treningów
        </Text>
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#AB8BFF" />
            <Text className="mt-4 text-gray-400">Ładowanie historii...</Text>
          </View>
        ) : error ? (
          <View className="bg-red-900/20 border border-red-500 rounded-xl p-6">
            <Text className="text-red-400 text-base">{error}</Text>
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
            data={data}
            keyExtractor={(session) => session.id}
            ItemSeparatorComponent={() => <View className="h-4" />}
            renderItem={({ item }) => {
              const dateLabel = item.completedAt
                ? new Date(item.completedAt).toLocaleString('pl-PL')
                : '—';

              const weightsLabel = item.exerciseLogs
                .map((l) => {
                  const w = l.startingWeight ?? null;
                  const wLabel = w === null ? '—' : `${w}kg`;
                  return `${l.exerciseName}: ${wLabel}`;
                })
                .join(' • ');

              return (
                <View className="bg-slate-800 rounded-xl p-6">
                  <Text className="text-xl font-bold text-white mb-1">
                    {item.trainingDayName || `Dzień: ${item.trainingDayId}`}
                  </Text>
                  <Text className="text-gray-400 text-base">
                    {dateLabel} • Tydzień {item.weekNumber}
                  </Text>
                  {weightsLabel ? (
                    <Text className="text-gray-300 text-sm mt-3">
                      {weightsLabel}
                    </Text>
                  ) : null}
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="bg-slate-800 rounded-xl p-6">
                <Text className="text-gray-400 text-base">
                  Brak zapisanych treningów.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default WorkoutHistoryScreen;
