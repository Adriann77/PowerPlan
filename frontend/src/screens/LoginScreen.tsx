import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';

export function LoginScreen() {
  const { login } = useAuth();
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
    <View className='flex-1 justify-center px-6 bg-slate-900'>
      <Text className='text-3xl font-bold text-white mb-4'>Logowanie</Text>
      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        placeholder='Nazwa użytkownika'
        placeholderTextColor='#9ca4ab'
        value={username}
        onChangeText={setUsername}
        className='border border-gray-600 rounded-lg px-4 py-3 text-white mb-4 bg-slate-800'
      />
      <TextInput
        autoCapitalize='none'
        autoCorrect={false}
        placeholder='Hasło'
        placeholderTextColor='#9ca4ab'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className='border border-gray-600 rounded-lg px-4 py-3 text-white mb-4 bg-slate-800'
      />
      {error ? (
        <Text className='text-red-400 mb-4 text-sm'>{error}</Text>
      ) : null}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className={`py-3 rounded-lg mb-6 ${submitting ? 'bg-gray-600 opacity-70' : 'bg-purple-600'}`}
      >
        <Text
          className={`text-center font-semibold ${submitting ? 'text-gray-300' : 'text-white'}`}
        >
          {submitting ? 'Logowanie…' : 'Zaloguj się'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className='text-purple-400 text-center'>
          Nowy sportowiec? Kliknij tutaj, aby się zarejestrować.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default LoginScreen;
