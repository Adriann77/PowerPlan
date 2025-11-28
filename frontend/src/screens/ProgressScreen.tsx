import { SafeAreaView, Text, View } from 'react-native';

export function ProgressScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-3xl font-bold text-white mb-4">
          Postęp
        </Text>
        <Text className="text-gray-400 text-base">
          Wizualizacje objętości, intensywności i gotowości będą znajdować się tutaj.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default ProgressScreen;
