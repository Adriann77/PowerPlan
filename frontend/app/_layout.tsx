import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import './global.css';
import { AppProvider } from '../src/providers/AppProvider';
import { RootNavigator } from '../src/navigation';
import { useTheme } from '../src/theme';
import { Text } from 'react-native';

function AppNavigation() {
  const { navigationTheme } = useTheme();

  return (
    <NavigationIndependentTree>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppNavigation />
    </AppProvider>
  );
}
