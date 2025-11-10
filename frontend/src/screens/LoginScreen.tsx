import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthStackParamList } from '../navigation';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../theme';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme } = useTheme();
  const { login, listUsers } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setError(null);
  };

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
          ...theme.typography.caption,
          color: theme.palette.text.muted,
          marginBottom: theme.spacing.lg,
        }}
      >
        Demo accounts:{' '}
        {listUsers()
          .map((user) => `${user.username}/${user.username}`)
          .join(', ')}
      </Text>
      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        placeholder='Username'
        placeholderTextColor={theme.palette.text.muted}
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          borderColor: theme.palette.border,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          color: theme.palette.text.primary,
          marginBottom: theme.spacing.md,
        }}
      />
      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        placeholder='Password'
        placeholderTextColor={theme.palette.text.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: theme.palette.border,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          color: theme.palette.text.primary,
          marginBottom: theme.spacing.md,
        }}
      />
      {error ? (
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.palette.danger,
            marginBottom: theme.spacing.md,
          }}
        >
          {error}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={{
          backgroundColor: submitting
            ? theme.palette.surfaceMuted
            : theme.palette.primary,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radii.md,
          marginBottom: theme.spacing.lg,
          opacity: submitting ? 0.7 : 1,
        }}
      >
        <Text
          style={{
            ...theme.typography.heading3,
            color: submitting
              ? theme.palette.text.secondary
              : theme.palette.text.inverse,
            textAlign: 'center',
          }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Text>
      </TouchableOpacity>
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
