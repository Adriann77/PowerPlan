import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { mockWorkoutState } from '../data/mockData';

export function PlansScreen() {

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-3xl font-bold text-white mb-6">
          Plany Treningowe
        </Text>
        <FlatList
          data={mockWorkoutState.plans}
          keyExtractor={(plan) => plan.id}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                // Navigate to first training day of the plan
                if (item.trainingDays.length > 0) {
                  router.push(`/day-exercise/${item.trainingDays[0].id}`);
                }
              }}
              className={`rounded-xl p-6 border ${
                item.isActive
                  ? 'bg-slate-700 border-purple-500'
                  : 'bg-slate-800 border-gray-600'
              }`}
            >
              <Text className="text-xl font-bold text-white mb-2">
                {item.name}
              </Text>
              {item.description ? (
                <Text className="text-gray-400 mb-2 text-base">
                  {item.description}
                </Text>
              ) : null}
              <Text className="text-gray-500 text-sm">
                {item.trainingDays.length} dni treningowych • {item.weekDuration}
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
