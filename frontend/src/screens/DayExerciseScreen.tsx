import { useMemo } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { mockWorkoutState } from '../data/mockData';
import type { TrainingDay } from '../types/workout';
import { SafeAreaView } from 'react-native-safe-area-context';

export function DayExerciseScreen() {
  const { trainingDayId } = useLocalSearchParams<{ trainingDayId: string }>();

  const trainingDay = useMemo<TrainingDay | undefined>(() => {
    for (const plan of mockWorkoutState.plans) {
      const day = plan.trainingDays.find((td) => td.id === trainingDayId);
      if (day) return day;
    }
    return undefined;
  }, [trainingDayId]);

  if (!trainingDay) {
    return (
      <SafeAreaView className='flex-1 bg-slate-900 h-screen'>
        <View className='flex-1 justify-center items-center px-6'>
          <Text className='text-2xl font-bold text-white mb-4'>
            Dzień Treningowy Nie Został Znaleziony
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className='bg-purple-600 rounded-lg px-6 py-3'
          >
            <Text className='text-white font-semibold'>Wróć</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <View className='flex-1'>
        {/* Header */}
        <View className='px-6 pt-4 pb-6 border-b border-gray-600'>
          <TouchableOpacity
            onPress={() => router.back()}
            className='self-start mb-4'
          >
            <Text className='text-purple-400 text-base'>← Wróć</Text>
          </TouchableOpacity>
          <Text className='text-3xl font-bold text-white mb-2'>
            {trainingDay.name}
          </Text>
          {trainingDay.description ? (
            <Text className='text-gray-400 text-base'>
              {trainingDay.description}
            </Text>
          ) : null}
        </View>

        {/* Exercise List */}
        <FlatList
          data={trainingDay.exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          ItemSeparatorComponent={() => <View className='h-4' />}
          renderItem={({ item, index }) => (
            <View className='bg-slate-800 rounded-xl p-6 border border-gray-600'>
              {/* Exercise Header */}
              <View className='flex-row items-start mb-4'>
                <View className='bg-purple-600 w-8 h-8 rounded-full justify-center items-center mr-4'>
                  <Text className='text-slate-900 font-semibold text-sm'>
                    {item.orderNumber}
                  </Text>
                </View>
                <View className='flex-1'>
                  <Text className='text-xl font-bold text-white mb-1'>
                    {item.name}
                  </Text>
                </View>
              </View>

              {/* Exercise Details Grid */}
              <View
                className={`flex-row flex-wrap ${item.notes ? 'mb-4' : ''}`}
              >
                <View className='w-1/2 mb-2'>
                  <Text className='text-gray-400 text-sm mb-1'>Serie</Text>
                  <Text className='text-white font-semibold text-base'>
                    {item.sets}
                  </Text>
                </View>
                <View className='w-1/2 mb-2'>
                  <Text className='text-gray-400 text-sm mb-1'>
                    Powtórzenia
                  </Text>
                  <Text className='text-white font-semibold text-base'>
                    {item.reps}
                  </Text>
                </View>
                <View className='w-1/2 mb-2'>
                  <Text className='text-gray-400 text-sm mb-1'>Tempo</Text>
                  <Text className='text-white font-semibold text-base'>
                    {item.tempo}
                  </Text>
                </View>
                <View className='w-1/2 mb-2'>
                  <Text className='text-gray-400 text-sm mb-1'>Odpoczynek</Text>
                  <Text className='text-white font-semibold text-base'>
                    {item.restSeconds}s
                  </Text>
                </View>
              </View>

              {/* Notes */}
              {item.notes ? (
                <View className='bg-slate-700 rounded-lg p-4'>
                  <Text className='text-gray-400 text-sm mb-1'>Notatki</Text>
                  <Text className='text-gray-300 text-base'>{item.notes}</Text>
                </View>
              ) : null}
            </View>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity
              onPress={() => router.push(`/workout-session/${trainingDayId}`)}
              className='bg-purple-600 rounded-xl p-6 mt-4 items-center'
            >
              <Text className='text-white font-semibold text-lg'>
                Rozpocznij Trening
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default DayExerciseScreen;
