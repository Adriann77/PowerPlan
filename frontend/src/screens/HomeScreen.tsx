import { useCallback, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient, WorkoutPlan, TrainingDay } from '../services/api';
import { calculateCurrentWeek } from '../utils/week';

export function HomeScreen() {
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePlanAndDays = useCallback(async () => {
    try {
      setError(null);
      // Pobierz wszystkie plany i znajdź aktywny
      const plans = await apiClient.getWorkoutPlans();
      const active = plans.find((p) => p.isActive);

      if (active) {
        setActivePlan(active);
        // Pobierz dni treningowe dla aktywnego planu
        const days = await apiClient.getTrainingDays(active.id);
        setTrainingDays(days);
      } else {
        setActivePlan(null);
        setTrainingDays([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Nie udało się załadować planu',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActivePlanAndDays();
    }, [fetchActivePlanAndDays]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchActivePlanAndDays();
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <ScrollView
        className='flex-1 px-6 pt-4'
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor='#AB8BFF'
          />
        }
      >
        {isLoading ? (
          <View className='items-center justify-center flex-1 py-20'>
            <ActivityIndicator
              size='large'
              color='#AB8BFF'
            />
          </View>
        ) : error ? (
          <View className='p-6 border border-red-500 bg-red-900/20 rounded-xl'>
            <Text className='text-base text-red-400'>{error}</Text>
            <TouchableOpacity
              onPress={fetchActivePlanAndDays}
              className='self-start px-4 py-2 mt-4 bg-red-500 rounded-lg'
            >
              <Text className='font-semibold text-white'>Spróbuj ponownie</Text>
            </TouchableOpacity>
          </View>
        ) : !activePlan ? (
          <View className='p-6 border border-gray-700 bg-slate-800 rounded-xl'>
            <Text className='mb-2 text-lg font-bold text-white'>
              Brak aktywnego planu treningowego
            </Text>
            <Text className='mb-4 text-base text-gray-400'>
              Wybierz plan treningowy w zakładce &ldquo;Plany&rdquo;, aby
              rozpocząć treningi.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/plans')}
              className='self-start px-4 py-3 bg-purple-600 rounded-lg'
            >
              <Text className='font-semibold text-white'>
                Przejdź do planów
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Aktywny plan */}
            <View className='p-6 mb-6 border-2 border-purple-500 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl'>
              <View className='flex-row items-center justify-between mb-2'>
                <Text className='flex-1 text-xl font-bold text-white'>
                  {activePlan.name}
                </Text>
                <View className='px-3 py-1 rounded-full bg-white/20'>
                  <Text className='text-xs font-semibold text-white'>
                    AKTYWNY
                  </Text>
                </View>
              </View>
              {activePlan.description ? (
                <Text className='mb-3 text-base text-purple-100'>
                  {activePlan.description}
                </Text>
              ) : null}
              <View className='flex-row gap-4'>
                <Text className='text-sm text-purple-100'>
                   {activePlan.weekDuration} tygodni
                </Text>
                <Text className='text-sm text-purple-100'>
                  📍 Tydzień {calculateCurrentWeek(activePlan.createdAt, activePlan.weekDuration)}
                </Text>
                <Text className='text-sm text-purple-100'>
                   {activePlan.trainingDaysCount} dni
                </Text>
              </View>
            </View>

            {/* Dni treningowe */}
            <Text className='mb-4 text-xl font-bold text-white'>
              Dni Treningowe
            </Text>

            {trainingDays.length === 0 ? (
              <View className='p-6 border border-gray-700 bg-slate-800 rounded-xl'>
                <Text className='mb-4 text-base text-gray-400'>
                  Brak dni treningowych w tym planie.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/manage-plan/${activePlan.id}`)}
                  className='self-start px-4 py-3 bg-purple-600 rounded-lg'
                >
                  <Text className='font-semibold text-white'>
                    Dodaj dni treningowe
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              trainingDays.map((day) => (
                <View
                  key={day.id}
                  className='p-5 mb-4 border border-gray-700 bg-slate-800 rounded-xl'
                >
                  <Text className='mb-2 text-lg font-bold text-white'>
                    {day.name}
                  </Text>
                  {day.description ? (
                    <Text className='mb-3 text-sm text-gray-400'>
                      {day.description}
                    </Text>
                  ) : null}
                  <Text className='mb-4 text-sm text-gray-500'>
                    🏋️ {day.exercises?.length || 0} ćwiczeń
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/workout-session/${day.id}`)}
                    className='px-4 py-3 bg-purple-600 rounded-lg'
                  >
                    <Text className='font-semibold text-center text-white'>
                      Rozpocznij Trening
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
