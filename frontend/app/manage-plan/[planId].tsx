import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { apiClient, TrainingDay } from '../../src/services/api';

export default function ManagePlanScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const insets = useSafeAreaInsets();
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [newDayName, setNewDayName] = useState('');
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 1,
    reps: '',
    tempo: '3-1-1-0',
    restSeconds: 90,
    notes: '',
  });

  const formatTempo = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Take only first 4 digits
    const digits = numbers.slice(0, 4);
    
    // Format with dashes
    if (digits.length === 0) return '';
    if (digits.length === 1) return digits;
    if (digits.length === 2) return `${digits[0]}-${digits[1]}`;
    if (digits.length === 3) return `${digits[0]}-${digits[1]}-${digits[2]}`;
    return `${digits[0]}-${digits[1]}-${digits[2]}-${digits[3]}`;
  };

  useEffect(() => {
    if (planId) {
      fetchTrainingDays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const fetchTrainingDays = async () => {
    try {
      setIsLoading(true);
      const days = await apiClient.getTrainingDays(planId);
      setTrainingDays(days);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać dni treningowych');
      console.error('Fetch training days error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTrainingDay = async () => {
    if (!newDayName.trim()) {
      Alert.alert('Błąd', 'Nazwa dnia treningowego jest wymagana');
      return;
    }

    try {
      setIsSaving(true);
      const newDay = await apiClient.createTrainingDay(planId, {
        name: newDayName,
      });
      setTrainingDays((prev) => [...prev, { ...newDay, exercises: [] }]);
      setNewDayName('');
      setShowAddDayModal(false);
      Alert.alert('Sukces', 'Dzień treningowy został dodany');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać dnia treningowego');
      console.error('Create training day error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addExercise = async () => {
    if (!newExercise.name.trim() || !newExercise.reps.trim()) {
      Alert.alert('Błąd', 'Nazwa ćwiczenia i liczba powtórzeń są wymagane');
      return;
    }

    if (!selectedDayId) return;

    try {
      setIsSaving(true);
      const orderNumber =
        trainingDays.find((d) => d.id === selectedDayId)?.exercises.length || 0;

      const exercise = await apiClient.createExercise(selectedDayId, {
        name: newExercise.name,
        sets: newExercise.sets,
        reps: parseInt(newExercise.reps, 10) || 1,
        tempo: newExercise.tempo,
        restSeconds: newExercise.restSeconds,
        notes: newExercise.notes || undefined,
        orderNumber: orderNumber + 1,
      });

      setTrainingDays((prev) =>
        prev.map((day) =>
          day.id === selectedDayId
            ? { ...day, exercises: [...day.exercises, exercise] }
            : day,
        ),
      );

      setNewExercise({
        name: '',
        sets: 1,
        reps: '',
        tempo: '3-1-1-0',
        restSeconds: 90,
        notes: '',
      });
      setShowAddExerciseModal(false);
      setSelectedDayId(null);
      Alert.alert('Sukces', 'Ćwiczenie zostało dodane');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać ćwiczenia');
      console.error('Create exercise error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddExerciseModal = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowAddExerciseModal(true);
  };

  const goBackToPlans = () => {
    router.push('/plans');
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-900 '>
      <View className='flex-1'>
        {/* Header */}
        <View className='px-6 pt-4 pb-6 border-b border-gray-600'>
          <TouchableOpacity
            onPress={goBackToPlans}
            className='self-start mb-4'
          >
            <Text className='text-base text-purple-400'>← Wróć do Planów</Text>
          </TouchableOpacity>
          <Text className='mb-2 text-3xl font-bold text-white'>
            Zarządzaj Planem
          </Text>
        </View>

        {/* Content */}
        <View className='flex-1 px-6 pt-4'>
          {isLoading ? (
            <View className='items-center justify-center flex-1'>
              <ActivityIndicator
                size='large'
                color='#AB8BFF'
              />
            </View>
          ) : trainingDays.length === 0 ? (
            <View className='items-center justify-center flex-1'>
              <Text className='mb-6 text-lg text-center text-gray-400'>
                Brak dni treningowych
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddDayModal(true)}
                className='px-6 py-3 bg-purple-600 rounded-lg'
              >
                <Text className='font-semibold text-white'>
                  Dodaj Pierwszy Dzień Treningowy
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={trainingDays}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              ItemSeparatorComponent={() => <View className='h-4' />}
              renderItem={({ item }) => (
                <View className='p-6 mb-4 border border-gray-600 bg-slate-800 rounded-xl'>
                  <View className='flex-row items-center justify-between mb-4'>
                    <Text className='text-xl font-bold text-white'>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openAddExerciseModal(item.id)}
                      className='px-3 py-1 bg-green-600 rounded-lg'
                    >
                      <Text className='text-sm font-semibold text-white'>
                        + Ćwiczenie
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {item.exercises.length === 0 ? (
                    <Text className='py-4 text-center text-gray-400'>
                      Brak ćwiczeń w tym dniu
                    </Text>
                  ) : (
                    <View>
                      {item.exercises.map((exercise) => (
                        <View
                          key={exercise.id}
                          className='p-4 mb-2 rounded-lg bg-slate-700'
                        >
                          <View className='flex-row items-center mb-2'>
                            <View className='items-center justify-center w-6 h-6 mr-3 bg-purple-600 rounded-full'>
                              <Text className='text-xs font-semibold text-slate-900'>
                                {exercise.orderNumber}
                              </Text>
                            </View>
                            <Text className='flex-1 font-semibold text-white'>
                              {exercise.name}
                            </Text>
                          </View>
                          <View className='flex-row flex-wrap'>
                            <Text className='mr-4 text-sm text-gray-300'>
                              Serie: {exercise.sets}
                            </Text>
                            <Text className='mr-4 text-sm text-gray-300'>
                              Powtórzenia: {exercise.reps}
                            </Text>
                            <Text className='text-sm text-gray-300'>
                              Tempo: {exercise.tempo}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
              ListFooterComponent={() => (
                <TouchableOpacity
                  onPress={() => setShowAddDayModal(true)}
                  className='items-center p-6 border-2 border-gray-600 border-dashed bg-slate-700 rounded-xl'
                >
                  <Text className='text-lg font-semibold text-gray-400'>
                    + Dodaj Dzień Treningowy
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>

      {/* Add Training Day Modal */}
      <Modal
        visible={showAddDayModal}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setShowAddDayModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className='flex-1'
        >
          <View className='justify-start flex-1 bg-black bg-opacity-50'>
            <View
              className='p-6 bg-slate-800 rounded-b-3xl'
              style={{ marginTop: insets.top + 10 }}
            >
              <Text className='mb-4 text-xl font-bold text-white'>
                Dodaj Dzień Treningowy
              </Text>
              <TextInput
                value={newDayName}
                onChangeText={setNewDayName}
                placeholder='Nazwa dnia (np. Dzień 1 - Klatka)'
                placeholderTextColor='#9CA3AF'
                className='px-4 py-3 mb-6 text-lg text-white border border-gray-600 rounded-lg bg-slate-700'
                autoFocus
              />
              <View className='flex-row space-x-4'>
                <TouchableOpacity
                  onPress={() => setShowAddDayModal(false)}
                  className='items-center flex-1 py-3 mr-2 bg-gray-600 rounded-lg'
                  disabled={isSaving}
                >
                  <Text className='font-semibold text-white'>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={addTrainingDay}
                  className='items-center flex-1 py-3 ml-2 bg-purple-600 rounded-lg'
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator
                      size='small'
                      color='#FFF'
                    />
                  ) : (
                    <Text className='font-semibold text-white'>Dodaj</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setShowAddExerciseModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className='flex-1'
        >
          <View className='justify-start flex-1 bg-black bg-opacity-50'>
            <View
              className='h-screen p-6 bg-slate-800 rounded-b-3xl max-h-4/5'
              style={{ marginTop: insets.top + 10 }}
            >
              <Text className='mb-4 text-xl font-bold text-white'>
                Dodaj Ćwiczenie
              </Text>
              <View className='flex flex-col gap-4'>
                <View>
                  <Text className='mb-1 text-sm text-gray-400'>
                    Nazwa ćwiczenia
                  </Text>
                  <TextInput
                    value={newExercise.name}
                    onChangeText={(value) =>
                      setNewExercise((prev) => ({ ...prev, name: value }))
                    }
                    placeholder='np. Wyciskanie sztangi na ławce poziomej'
                    placeholderTextColor='#9CA3AF'
                    className='px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700'
                  />
                </View>

                <View className='flex-row gap-5 space-x-4'>
                  <View className='flex-1'>
                    <Text className='mb-1 text-sm text-gray-400'>Serie</Text>
                    <TextInput
                      value={newExercise.sets === 0 ? '' : newExercise.sets.toString()}
                      onChangeText={(value) => {
                        if (value === '') {
                          setNewExercise((prev) => ({
                            ...prev,
                            sets: 0,
                          }));
                        } else {
                          const numValue = parseInt(value);
                          setNewExercise((prev) => ({
                            ...prev,
                            sets: isNaN(numValue) ? 0 : numValue,
                          }));
                        }
                      }}
                      keyboardType='numeric'
                      className='px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700'
                    />
                  </View>
                  <View className='flex-1 '>
                    <Text className='mb-1 text-sm text-gray-400'>
                      Powtórzenia
                    </Text>
                    <TextInput
                      value={newExercise.reps}
                      onChangeText={(value) =>
                        setNewExercise((prev) => ({ ...prev, reps: value }))
                      }
                      placeholder='np. 8-12'
                      placeholderTextColor='#9CA3AF'
                      keyboardType="decimal-pad"
                      className='px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700'
                    />
                  </View>
                </View>

                <View className='flex-row gap-5 space-x-4'>
                  <View className='flex-1'>
                    <View className='flex-row items-center mb-1'>
                      <Text className='text-sm text-gray-400'>Tempo</Text>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Metodologia Tempo",
                            "Tempo ćwiczenia określa czas trwania każdej fazy ruchu:\n\n• Pierwsza cyfra: FAZA KONCENTRYCZNA (opuszczanie ciężaru)\n• Druga cyfra: PAUZA NA DOLE (przerwa w pozycji końcowej)\n• Trzecia cyfra: FAZA EKSCENTRYCZNA (podnoszenie ciężaru)\n• Czwarta cyfra: PAUZA NA GÓRZE (przerwa w pozycji wyjściowej)\n\nPrzykład: 3-1-1-0 oznacza 3s w dół, 1s pauza na dole, 1s w górę, brak pauzy na górze.",
                            [{ text: "Rozumiem" }]
                          );
                        }}
                        className='ml-2 p-1 rounded-full bg-blue-500 bg-opacity-20'
                      >
                        <Text className='text-sm text-blue-400 font-bold'>?</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      value={newExercise.tempo}
                      onChangeText={(value) => {
                        const formatted = formatTempo(value);
                        setNewExercise((prev) => ({ ...prev, tempo: formatted }));
                      }}
                      placeholder='3-1-1-0'
                      placeholderTextColor='#9CA3AF'
                      keyboardType='numeric'
                      maxLength={7} // 4 digits + 3 dashes
                      className='px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700'
                    />
                  </View>
                  <View className='flex-1'>
                    <Text className='mb-1 text-sm text-gray-400'>
                      Odpoczynek (s)
                    </Text>
                    <TextInput
                      value={newExercise.restSeconds === 0 ? '' : newExercise.restSeconds.toString()}
                      onChangeText={(value) => {
                        if (value === '') {
                          setNewExercise((prev) => ({
                            ...prev,
                            restSeconds: 0,
                          }));
                        } else {
                          const numValue = parseInt(value);
                          setNewExercise((prev) => ({
                            ...prev,
                            restSeconds: isNaN(numValue) ? 0 : numValue,
                          }));
                        }
                      }}
                      keyboardType='decimal-pad'
                      className='px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700'
                    />
                  </View>
                </View>

                <View>
                  <Text className='mb-1 text-sm text-gray-400'>
                    Notatki (opcjonalne)
                  </Text>
                  <TextInput
                    value={newExercise.notes}
                    onChangeText={(value) =>
                      setNewExercise((prev) => ({ ...prev, notes: value }))
                    }
                    placeholder='Dodatkowe uwagi...'
                    placeholderTextColor='#9CA3AF'
                    multiline
                    numberOfLines={2}
                    className='px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700'
                    textAlignVertical='top'
                  />
                </View>
              </View>

              <View className='flex-row mt-6 space-x-4'>
                <TouchableOpacity
                  onPress={() => setShowAddExerciseModal(false)}
                  className='items-center flex-1 py-3 mr-2 bg-gray-600 rounded-lg'
                  disabled={isSaving}
                >
                  <Text className='font-semibold text-white'>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={addExercise}
                  className='items-center flex-1 py-3 ml-2 bg-purple-600 rounded-lg'
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator
                      size='small'
                      color='#FFF'
                    />
                  ) : (
                    <Text className='font-semibold text-white'>Dodaj</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
