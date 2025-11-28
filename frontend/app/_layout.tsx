import { Slot } from 'expo-router';
import './global.css';
import { AppProvider } from '../src/providers/AppProvider';

export default function RootLayout() {
  return (
    <AppProvider>
      <Slot />
    </AppProvider>
  );
}
