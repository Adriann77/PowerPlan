import { useState, useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient, WorkoutPlan } from '../services/api';

export function PlansScreen() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);

  const fetchWorkoutPlans = async () => {
    try {
      setError(null);
      const plans = await apiClient.getWorkoutPlans();
      setWorkoutPlans(plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchWorkoutPlans();
  };

  const toggleActivePlan = async (plan: WorkoutPlan) => {
    try {
      setActivatingPlanId(plan.id);
      
      // Jeśli plan jest już aktywny, deaktywuj go
      // Jeśli plan nie jest aktywny, aktywuj go (i deaktywuj inne)
      const newActiveState = !plan.isActive;

      // Najpierw deaktywuj wszystkie plany jeśli aktywujemy nowy
      if (newActiveState) {
        const activePlan = workoutPlans.find(p => p.isActive && p.id !== plan.id);
        if (activePlan) {
          await apiClient.updateWorkoutPlan(activePlan.id, {
            name: activePlan.name,
            description: activePlan.description,
            weekDuration: activePlan.weekDuration,
            isActive: false,
          });
        }
      }

      // Zaktualizuj aktualny plan
      await apiClient.updateWorkoutPlan(plan.id, {
        name: plan.name,
        description: plan.description,
        weekDuration: plan.weekDuration,
        isActive: newActiveState,
      });

      // Odśwież listę planów
      await fetchWorkoutPlans();
      
      Alert.alert(
        'Sukces',
        newActiveState 
          ? `Plan "${plan.name}" został aktywowany!` 
          : `Plan "${plan.name}" został deaktywowany.`
      );
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się zmienić statusu planu');
      console.error('Toggle active plan error:', err);
    } finally {
      setActivatingPlanId(null);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <View className='flex-1 px-6 pt-4'>
        <View className='flex-row justify-between items-center mb-6'>
          <Text className='text-2xl font-bold text-white'>
            Plany Treningowe
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/create-plan')}
            className='bg-purple-600 rounded-lg px-4 py-2'
          >
            <Text className='text-white font-semibold'>+ Nowy Plan</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size='large' color='#AB8BFF' />
          </View>
        ) : error ? (
          <View className='bg-red-900/20 border border-red-500 rounded-xl p-6'>
            <Text className='text-red-400 text-base'>{error}</Text>
            <TouchableOpacity
              onPress={fetchWorkoutPlans}
              className='mt-4 bg-red-500 rounded-lg py-2 px-4 self-start'
            >
              <Text className='text-white font-semibold'>Spróbuj ponownie</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor='#AB8BFF'
              />
            }
            data={workoutPlans}
            keyExtractor={(plan) => plan.id}
            ItemSeparatorComponent={() => <View className='h-4' />}
            renderItem={({ item }) => (
              <View
                className={`rounded-xl p-6 border-2 ${
                  item.isActive
                    ? 'bg-slate-700 border-purple-500'
                    : 'bg-slate-800 border-gray-600'
                }`}
              >
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/manage-plan/${item.id}`);
                  }}
                >
                  <Text className='text-xl font-bold text-white mb-2'>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text className='text-gray-400 mb-2 text-base'>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text className='text-gray-200 text-sm mb-3'>
                    {item.trainingDaysCount} dni treningowych •{' '}
                    {item.weekDuration}-tygodniowy blok
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleActivePlan(item);
                  }}
                  disabled={activatingPlanId === item.id}
                  className={`rounded-lg py-3 px-4 ${
                    item.isActive
                      ? 'bg-slate-600 border border-gray-500'
                      : 'bg-purple-600'
                  }`}
                >
                  {activatingPlanId === item.id ? (
                    <ActivityIndicator size='small' color='#FFFFFF' />
                  ) : (
                    <Text className='text-white font-semibold text-center'>
                      {item.isActive ? '✓ Plan Aktywny' : 'Aktywuj Plan'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View className='bg-slate-800 rounded-xl p-6 items-center'>
                <Text className='text-gray-400 text-base text-center'>
                  Brak planów treningowych.{' '}
                  Kliknij &ldquo;+ Nowy Plan&rdquo; aby stworzyć swój pierwszy plan.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default PlansScreen;
