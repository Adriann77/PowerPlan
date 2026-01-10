import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, WorkoutSession } from '../services/api';
import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
  createRefreshControl,
  Divider,
} from '../components';

export function WorkoutHistoryScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      
      const history = await apiClient.getWorkoutSessionHistory();
      setSessions(history.filter(s => s.isCompleted));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Nie udało się załadować historii',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = () => fetchHistory(true);

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: { date: string; sessions: WorkoutSession[] }[] = [];
    
    for (const session of sessions) {
      const dateStr = session.completedAt 
        ? new Date(session.completedAt).toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Nieznana data';
      
      const existingGroup = groups.find(g => g.date === dateStr);
      if (existingGroup) {
        existingGroup.sessions.push(session);
      } else {
        groups.push({ date: dateStr, sessions: [session] });
      }
    }
    
    return groups;
  }, [sessions]);

  const toggleSession = (sessionId: string) => {
    setExpandedSessionId(prev => prev === sessionId ? null : sessionId);
  };

  const renderSession = (session: WorkoutSession) => {
    const isExpanded = expandedSessionId === session.id;
    const timeStr = session.completedAt
      ? new Date(session.completedAt).toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <TouchableOpacity 
        key={session.id} 
        onPress={() => toggleSession(session.id)}
        activeOpacity={0.7}
      >
        <View className={`bg-slate-800 rounded-xl overflow-hidden mb-3 ${isExpanded ? 'border border-purple-500' : ''}`}>
          {/* Header */}
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  {session.trainingDayName || `Dzień treningowy`}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {session.workoutPlanName}
                </Text>
              </View>
              <View className="items-end">
                <View className="bg-purple-600/20 px-3 py-1 rounded-full">
                  <Text className="text-purple-400 text-sm font-medium">
                    Tydzień {session.weekNumber}
                  </Text>
                </View>
                {timeStr && (
                  <Text className="text-gray-500 text-xs mt-1">{timeStr}</Text>
                )}
              </View>
            </View>

            {/* Summary Row */}
            <View className="flex-row items-center mt-2">
              <View className="bg-slate-700 px-3 py-1 rounded-full mr-2">
                <Text className="text-gray-300 text-xs">
                  🏋️ {session.exerciseLogs.length} ćwiczeń
                </Text>
              </View>
              <View className="bg-slate-700 px-3 py-1 rounded-full">
                <Text className="text-gray-300 text-xs">
                  ⚡ {session.exerciseLogs.filter(l => l.isCompleted).length} ukończonych
                </Text>
              </View>
              <View className="flex-1" />
              <Text className="text-purple-400 text-sm">
                {isExpanded ? '▼' : '▶'}
              </Text>
            </View>
          </View>

          {/* Expanded Details */}
          {isExpanded && (
            <View className="px-4 pb-4">
              <Divider className="mb-4" />
              
              {session.exerciseLogs.length === 0 ? (
                <Text className="text-gray-500 text-center py-2">
                  Brak zapisanych ćwiczeń
                </Text>
              ) : (
                session.exerciseLogs.map((log, index) => (
                  <View 
                    key={log.id} 
                    className={`flex-row items-center justify-between py-3 ${
                      index < session.exerciseLogs.length - 1 ? 'border-b border-slate-700' : ''
                    }`}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-2 ${
                          log.isCompleted ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <Text className="text-white font-medium" numberOfLines={1}>
                          {log.exerciseName}
                        </Text>
                      </View>
                      {log.notes && (
                        <Text className="text-gray-500 text-xs mt-1 ml-4">
                          {log.notes}
                        </Text>
                      )}
                    </View>
                    <View className="ml-4">
                      <Text className={`font-bold text-lg ${
                        log.startingWeight != null ? 'text-purple-400' : 'text-gray-500'
                      }`}>
                        {log.startingWeight != null ? `${log.startingWeight} kg` : '—'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <View className='flex-1 px-6 pt-4'>
        {/* Header */}
        <View className="mb-6">
          <Text className='text-3xl font-bold text-white'>Historia</Text>
          <Text className='text-gray-400 text-base mt-1'>
            Przeglądaj swoje ukończone treningi
          </Text>
          {sessions.length > 0 && (
            <View className="flex-row items-center mt-3">
              <View className="bg-purple-600/20 px-3 py-1 rounded-full">
                <Text className="text-purple-400 text-sm">
                  {sessions.length} {sessions.length === 1 ? 'trening' : 'treningów'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner message="Ładowanie historii..." />
        ) : error ? (
          <ErrorState message={error} onRetry={onRefresh} />
        ) : sessions.length === 0 ? (
          <EmptyState
            title="Brak zapisanych treningów"
            message="Ukończ swój pierwszy trening, aby zobaczyć go tutaj."
          />
        ) : (
          <FlatList
            data={groupedSessions}
            keyExtractor={(item) => item.date}
            refreshControl={createRefreshControl(isRefreshing, onRefresh)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View className="mb-6">
                {/* Date Header */}
                <View className="flex-row items-center mb-3">
                  <View className="w-3 h-3 bg-purple-600 rounded-full mr-3" />
                  <Text className="text-white font-semibold capitalize">
                    {item.date}
                  </Text>
                </View>
                
                {/* Sessions for this date */}
                {item.sessions.map(renderSession)}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default WorkoutHistoryScreen;
