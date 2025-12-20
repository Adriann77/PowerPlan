import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient, WorkoutPlan, TrainingDay } from '../services/api';

export function HomeScreen() {
  const { currentUser } = useAuth();
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePlanAndDays = async () => {
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
      setError(err instanceof Error ? err.message : 'Nie udało się załadować planu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivePlanAndDays();
  }, []);

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
        <Text className='text-2xl font-bold text-white mb-6'>
          Witaj, {currentUser?.username || 'Użytkowniku'}! 👋
        </Text>

        {isLoading ? (
          <View className='flex-1 justify-center items-center py-20'>
            <ActivityIndicator size='large' color='#AB8BFF' />
          </View>
        ) : error ? (
          <View className='bg-red-900/20 border border-red-500 rounded-xl p-6'>
            <Text className='text-red-400 text-base'>{error}</Text>
            <TouchableOpacity
              onPress={fetchActivePlanAndDays}
              className='mt-4 bg-red-500 rounded-lg py-2 px-4 self-start'
            >
              <Text className='text-white font-semibold'>Spróbuj ponownie</Text>
            </TouchableOpacity>
          </View>
        ) : !activePlan ? (
          <View className='bg-slate-800 rounded-xl p-6 border border-gray-700'>
            <Text className='text-white text-lg font-bold mb-2'>
              Brak aktywnego planu treningowego
            </Text>
            <Text className='text-gray-400 text-base mb-4'>
              Wybierz plan treningowy w zakładce &ldquo;Plany&rdquo;, aby rozpocząć treningi.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/plans')}
              className='bg-purple-600 rounded-lg py-3 px-4 self-start'
            >
              <Text className='text-white font-semibold'>
                Przejdź do planów
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Aktywny plan */}
            <View className='bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 mb-6 border-2 border-purple-500'>
              <View className='flex-row justify-between items-center mb-2'>
                <Text className='text-white text-xl font-bold flex-1'>
                  {activePlan.name}
                </Text>
                <View className='bg-white/20 rounded-full px-3 py-1'>
                  <Text className='text-white text-xs font-semibold'>
                    AKTYWNY
                  </Text>
                </View>
              </View>
              {activePlan.description ? (
                <Text className='text-purple-100 mb-3 text-base'>
                  {activePlan.description}
                </Text>
              ) : null}
              <View className='flex-row gap-4'>
                <Text className='text-purple-100 text-sm'>
                  🗓️ {activePlan.weekDuration} tygodni
                </Text>
                <Text className='text-purple-100 text-sm'>
                  💪 {activePlan.trainingDaysCount} dni
                </Text>
              </View>
            </View>

            {/* Dni treningowe */}
            <Text className='text-xl font-bold text-white mb-4'>
              Dni Treningowe
            </Text>

            {trainingDays.length === 0 ? (
              <View className='bg-slate-800 rounded-xl p-6 border border-gray-700'>
                <Text className='text-gray-400 text-base mb-4'>
                  Brak dni treningowych w tym planie.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/manage-plan/${activePlan.id}`)}
                  className='bg-purple-600 rounded-lg py-3 px-4 self-start'
                >
                  <Text className='text-white font-semibold'>
                    Dodaj dni treningowe
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              trainingDays.map((day) => (
                <View key={day.id} className='bg-slate-800 rounded-xl p-5 mb-4 border border-gray-700'>
                  <Text className='text-white text-lg font-bold mb-2'>
                    {day.name}
                  </Text>
                  {day.description ? (
                    <Text className='text-gray-400 text-sm mb-3'>
                      {day.description}
                    </Text>
                  ) : null}
                  <Text className='text-gray-500 text-sm mb-4'>
                    🏋️ {day.exercises?.length || 0} ćwiczeń
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/workout-session/${day.id}`)}
                    className='bg-purple-600 rounded-lg py-3 px-4'
                  >
                    <Text className='text-white font-semibold text-center'>
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
