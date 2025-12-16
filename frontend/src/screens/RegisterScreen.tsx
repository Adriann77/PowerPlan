import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';

type RegisterFormData = {
  username: string;
  password: string;
  confirmPassword: string;
};

export function RegisterScreen() {
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
    <View className='flex-1 justify-center px-6 bg-slate-900'>
      <Text className='text-3xl font-bold text-white mb-4'>
        Utwórz konto
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
              placeholder='Wybierz nazwę użytkownika (min 5 znaków)'
              placeholderTextColor='#9ca4ab'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              className={`border rounded-lg px-4 py-3 text-white mb-1 bg-slate-800 ${
                errors.username ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.username && (
              <Text className='text-red-400 mb-4 text-sm'>
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
              placeholder='Wybierz hasło (min 5 znaków, 1 cyfra)'
              placeholderTextColor='#9ca4ab'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              className={`border rounded-lg px-4 py-3 text-white mb-1 bg-slate-800 ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.password && (
              <Text className='text-red-400 mb-4 text-sm'>
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
              placeholder='Potwierdź hasło'
              placeholderTextColor='#9ca4ab'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              className={`border rounded-lg px-4 py-3 text-white mb-1 bg-slate-800 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.confirmPassword && (
              <Text className='text-red-400 mb-4 text-sm'>
                {errors.confirmPassword.message}
              </Text>
            )}
          </>
        )}
      />

      {apiError && (
        <Text className='text-red-400 mb-4 text-sm'>
          {apiError}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
        className={`py-3 rounded-lg mb-6 ${submitting ? 'bg-gray-600 opacity-70' : 'bg-purple-600'}`}
      >
        <Text className={`text-center font-semibold ${submitting ? 'text-gray-300' : 'text-white'}`}>
          {submitting ? 'Tworzenie konta…' : 'Utwórz konto'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text className='text-gray-400 text-center'>
          Już trenujesz z nami? Wróć do logowania.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default RegisterScreen;
