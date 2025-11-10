import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../src/navigation';
import { useTheme } from '../src/theme';

export default function Index() {
  const { navigationTheme } = useTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
