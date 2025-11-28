import { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { getActivePlan } from '../data/mockData';
import { useAuth } from '../providers/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  const activePlan = useMemo(() => getActivePlan(), []);
  const { currentUser, logout } = useAuth();

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <View className='flex-1 px-6 pt-4'>
        {currentUser ? (
          <TouchableOpacity
            onPress={logout}
            className='self-start bg-slate-800 rounded-lg px-4 py-2 mb-6'
          >
            <Text className='text-purple-400 text-sm font-medium'>
              Wyloguj się
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text className='text-gray-200 mb-4 text-base text-center'>
          Aktywny plan •{' '}
          {activePlan?.name ?? 'Brak przypisanego aktywnego planu'}
        </Text>

        <FlatList
          ItemSeparatorComponent={() => <View className='h-4' />}
          data={activePlan?.trainingDays ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/day-exercise/${item.id}`)}
              className='bg-slate-800 rounded-xl p-6'
            >
              <Text className='text-xl font-bold text-white mb-2'>
                {item.name}
              </Text>
              {item.description ? (
                <Text className='text-gray-400 mb-4 text-base'>
                  {item.description}
                </Text>
              ) : null}
              <Text className='text-gray-500 text-sm'>
                {item.exercises.length} ćwiczeń • pierwsze ćwiczenie:{' '}
                {item.exercises[0]?.name ?? 'TBD'}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className='bg-slate-800 rounded-xl p-6'>
              <Text className='text-gray-400 text-base'>
                Dni treningowe pojawią się tutaj po skonfigurowaniu planów.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

export default HomeScreen;
