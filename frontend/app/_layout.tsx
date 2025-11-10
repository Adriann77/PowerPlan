import { Stack } from 'expo-router';
import '../src/theme/global.css';
import { AppProvider } from '../src/providers/AppProvider';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
      </Stack>
    </AppProvider>
  );
}
