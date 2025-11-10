import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthStackParamList } from '../navigation';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../theme';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { theme } = useTheme();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await register(username, password);
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
        Create account
      </Text>
      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        placeholder='Choose a username'
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
        placeholder='Choose a password'
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
      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        placeholder='Confirm password'
        placeholderTextColor={theme.palette.text.muted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
          {submitting ? 'Creating account…' : 'Create account'}
        </Text>
      </TouchableOpacity>
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
