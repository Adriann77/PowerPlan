import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import type { AuthStackParamList } from '../navigation';
import { useTheme } from '../theme';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
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
        Create account
      </Text>
      <Text
        style={{
          ...theme.typography.body,
          color: theme.palette.text.secondary,
        }}
        onPress={() => navigation.goBack()}
      >
        Already lifting with us? Go back to login.
      </Text>
    </View>
  );
}

export default RegisterScreen;


