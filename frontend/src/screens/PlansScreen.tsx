import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlans } from '../hooks';
import { apiClient, WorkoutPlan } from '../services/api';
import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
  createRefreshControl,
  Card,
  Badge,
  Button,
  LoadingOverlay,
} from '../components';

export function PlansScreen() {
  const { plans, isLoading, isRefreshing, error, refresh, setPlans } = usePlans();
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);

  const toggleActivePlan = async (plan: WorkoutPlan) => {
    try {
      setActivatingPlanId(plan.id);
      
      const newActiveState = !plan.isActive;

      // First deactivate all other plans if activating a new one
      if (newActiveState) {
        const activePlan = plans.find(p => p.isActive && p.id !== plan.id);
        if (activePlan) {
          await apiClient.updateWorkoutPlan(activePlan.id, {
            name: activePlan.name,
            description: activePlan.description,
            weekDuration: activePlan.weekDuration,
            isActive: false,
          });
        }
      }

      // Update current plan
      await apiClient.updateWorkoutPlan(plan.id, {
        name: plan.name,
        description: plan.description,
        weekDuration: plan.weekDuration,
        isActive: newActiveState,
      });

      // Optimistically update UI
      setPlans(prev => prev.map(p => ({
        ...p,
        isActive: p.id === plan.id ? newActiveState : (newActiveState ? false : p.isActive),
      })));
      
      Alert.alert(
        'Sukces',
        newActiveState 
          ? `Plan "${plan.name}" został aktywowany!` 
          : `Plan "${plan.name}" został deaktywowany.`
      );
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się zmienić statusu planu');
      console.error('Toggle active plan error:', err);
      // Refresh to get the actual state
      refresh();
    } finally {
      setActivatingPlanId(null);
    }
  };

  const renderPlanItem = ({ item }: { item: WorkoutPlan }) => (
    <Card variant={item.isActive ? 'active' : 'default'}>
      <TouchableOpacity
        onPress={() => router.push(`/manage-plan/${item.id}`)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-xl font-bold text-white flex-1 mr-2">
            {item.name}
          </Text>
          {item.isActive && <Badge label="AKTYWNY" variant="info" />}
        </View>
        
        {item.description ? (
          <Text className="text-gray-400 mb-3 text-base" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        
        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className="bg-slate-700 px-3 py-1 rounded-full">
            <Text className="text-gray-300 text-sm">
              📅 {item.trainingDaysCount} dni
            </Text>
          </View>
          <View className="bg-slate-700 px-3 py-1 rounded-full">
            <Text className="text-gray-300 text-sm">
              ⏱️ {item.weekDuration} tygodni
            </Text>
          </View>
          <View className="bg-slate-700 px-3 py-1 rounded-full">
            <Text className="text-gray-300 text-sm">
              🏋️ {item.workoutSessionsCount} sesji
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <Button
        label={item.isActive ? '✓ Plan Aktywny' : 'Aktywuj Plan'}
        onPress={() => toggleActivePlan(item)}
        variant={item.isActive ? 'secondary' : 'primary'}
        loading={activatingPlanId === item.id}
        fullWidth
      />
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <LoadingOverlay 
        visible={activatingPlanId !== null} 
        message="Aktualizowanie planu..." 
      />
      
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-white">
              Plany Treningowe
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {plans.length} {plans.length === 1 ? 'plan' : 'planów'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/create-plan')}
            className="bg-purple-600 rounded-lg px-4 py-3"
          >
            <Text className="text-white font-semibold">+ Nowy Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner message="Ładowanie planów..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <FlatList
            refreshControl={createRefreshControl(isRefreshing, refresh)}
            data={plans}
            keyExtractor={(plan) => plan.id}
            ItemSeparatorComponent={() => <View className="h-4" />}
            renderItem={renderPlanItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <EmptyState
                icon="📋"
                title="Brak planów treningowych"
                message='Kliknij "+ Nowy Plan" aby stworzyć swój pierwszy plan treningowy.'
                actionLabel="Utwórz Plan"
                onAction={() => router.push('/create-plan')}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default PlansScreen;
