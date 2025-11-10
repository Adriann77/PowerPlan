import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import type { AuthStackParamList } from '../navigation';
import { useTheme } from '../theme';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
        backgroundColor: theme.palette.background,
      }}
    >
      <Text
        style={{
          ...theme.typography.heading1,
          color: theme.palette.text.primary,
          marginBottom: theme.spacing.md,
        }}
      >
        Login
      </Text>
      <Text
        style={{
          ...theme.typography.body,
          color: theme.palette.text.secondary,
        }}
        onPress={() => navigation.navigate('Register')}
      >
        New athlete? Tap here to register.
      </Text>
    </View>
  );
}

export default LoginScreen;


