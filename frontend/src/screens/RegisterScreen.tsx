import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { AuthStackParamList } from '../navigation';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../theme';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

type RegisterFormData = {
  username: string;
  password: string;
  confirmPassword: string;
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { theme } = useTheme();
  const { register: registerUser } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (submitting) {
      return;
    }

    setApiError(null);
    setSubmitting(true);

    const result = await registerUser(data.username, data.password);
    setSubmitting(false);

    if (!result.success) {
      setApiError(result.message);
      return;
    }
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
      <Controller
        control={control}
        name='username'
        rules={{
          required: 'Username is required',
          minLength: {
            value: 5,
            message: 'Username must be at least 5 characters',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              autoCapitalize='none'
              autoCorrect={false}
              placeholder='Choose a username (min 5 characters)'
              placeholderTextColor={theme.palette.text.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={{
                borderWidth: 1,
                borderColor: errors.username
                  ? theme.palette.danger
                  : theme.palette.border,
                borderRadius: theme.radii.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            />
            {errors.username && (
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.palette.danger,
                  marginBottom: theme.spacing.md,
                }}
              >
                {errors.username.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name='password'
        rules={{
          required: 'Password is required',
          minLength: {
            value: 5,
            message: 'Password must be at least 5 characters',
          },
          validate: (value) => {
            if (!/\d/.test(value)) {
              return 'Password must contain at least one number';
            }
            return true;
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              autoCapitalize='none'
              autoCorrect={false}
              placeholder='Choose a password (min 5 chars, 1 number)'
              placeholderTextColor={theme.palette.text.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: errors.password
                  ? theme.palette.danger
                  : theme.palette.border,
                borderRadius: theme.radii.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            />
            {errors.password && (
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.palette.danger,
                  marginBottom: theme.spacing.md,
                }}
              >
                {errors.password.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name='confirmPassword'
        rules={{
          required: 'Please confirm your password',
          validate: (value) => {
            if (value !== password) {
              return 'Passwords do not match';
            }
            return true;
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              autoCapitalize='none'
              autoCorrect={false}
              placeholder='Confirm password'
              placeholderTextColor={theme.palette.text.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: errors.confirmPassword
                  ? theme.palette.danger
                  : theme.palette.border,
                borderRadius: theme.radii.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            />
            {errors.confirmPassword && (
              <Text
                style={{
                  ...theme.typography.caption,
                  color: theme.palette.danger,
                  marginBottom: theme.spacing.md,
                }}
              >
                {errors.confirmPassword.message}
              </Text>
            )}
          </>
        )}
      />

      {apiError && (
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.palette.danger,
            marginBottom: theme.spacing.md,
          }}
        >
          {apiError}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
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
