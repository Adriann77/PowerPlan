import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { mockWorkoutState } from '../data/mockData';
import { SafeAreaView } from 'react-native-safe-area-context';

export function PlansScreen() {
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
        <FlatList
          data={mockWorkoutState.plans}
          keyExtractor={(plan) => plan.id}
          ItemSeparatorComponent={() => <View className='h-4' />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                // Navigate to manage workout plan view
                router.push(`/manage-plan/${item.id}`);
              }}
              className={`rounded-xl p-6 border-2 ${
                item.isActive
                  ? 'bg-slate-700 border-purple-500'
                  : 'bg-slate-800 border-gray-600'
              }`}
            >
              <Text className='text-xl font-bold text-white mb-2'>
                {item.name}
              </Text>
              {item.description ? (
                <Text className='text-gray-400 mb-2 text-base'>
                  {item.description}
                </Text>
              ) : null}
              <Text className='text-gray-200 text-sm'>
                {item.trainingDays.length} dni treningowych •{' '}
                {item.weekDuration}
                -tygodniowy blok
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default PlansScreen;
