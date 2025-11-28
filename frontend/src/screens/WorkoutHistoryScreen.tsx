import { FlatList, SafeAreaView, Text, View } from 'react-native';
import { mockWorkoutState } from '../data/mockData';

export function WorkoutHistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-3xl font-bold text-white mb-6">
          Historia Treningów
        </Text>
        <FlatList
          data={mockWorkoutState.sessions}
          keyExtractor={(session) => session.id}
          ItemSeparatorComponent={() => (
            <View className="h-4" />
          )}
          renderItem={({ item }) => (
            <View className="bg-slate-800 rounded-xl p-6">
              <Text className="text-xl font-bold text-white mb-1">
                Dzień treningowy: {item.trainingDayId}
              </Text>
              <Text className="text-gray-400 text-base">
                Tydzień {item.weekNumber} •{' '}
                {item.isCompleted ? 'Ukończony' : 'W trakcie'}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default WorkoutHistoryScreen;
