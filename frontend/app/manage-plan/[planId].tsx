import React, { useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  tempo: string;
  restSeconds: number;
  notes?: string;
  orderNumber: number;
}

interface TrainingDay {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
}

export default function ManagePlanScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const insets = useSafeAreaInsets();
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
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

  const addTrainingDay = () => {
    if (!newDayName.trim()) {
      Alert.alert('Błąd', 'Nazwa dnia treningowego jest wymagana');
      return;
    }

    const newDay: TrainingDay = {
      id: Date.now().toString(),
      name: newDayName,
      exercises: [],
    };

    setTrainingDays((prev) => [...prev, newDay]);
    setNewDayName('');
    setShowAddDayModal(false);
  };

  const addExercise = () => {
    if (!newExercise.name.trim() || !newExercise.reps.trim()) {
      Alert.alert('Błąd', 'Nazwa ćwiczenia i liczba powtórzeń są wymagane');
      return;
    }

    if (!selectedDayId) return;

    const exercise: Exercise = {
      id: Date.now().toString(),
      ...newExercise,
      orderNumber:
        trainingDays.find((d) => d.id === selectedDayId)?.exercises.length ||
        0 + 1,
    };

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
  };

  const openAddExerciseModal = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowAddExerciseModal(true);
  };

  const goBackToPlans = () => {
    Alert.alert('Zapisać plan?', 'Czy chcesz zapisać ten plan treningowy?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Nie zapisuj',
        style: 'destructive',
        onPress: () => router.push('/plans'),
      },
      {
        text: 'Zapisz',
        onPress: () => {
          // Here we would save to backend, for now just navigate back
          Alert.alert('Sukces', 'Plan został zapisany!', [
            { text: 'OK', onPress: () => router.push('/plans') },
          ]);
        },
      },
    ]);
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
            <Text className='text-purple-400 text-base'>← Wróć do Planów</Text>
          </TouchableOpacity>
          <Text className='text-3xl font-bold text-white mb-2'>
            Zarządzaj Planem
          </Text>
          <Text className='text-gray-400'>Plan ID: {planId}</Text>
        </View>

        {/* Content */}
        <View className='flex-1 px-6 pt-4'>
          {trainingDays.length === 0 ? (
            <View className='flex-1 justify-center items-center'>
              <Text className='text-gray-400 text-lg mb-6 text-center'>
                Brak dni treningowych
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddDayModal(true)}
                className='bg-purple-600 rounded-lg px-6 py-3'
              >
                <Text className='text-white font-semibold'>
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
                <View className='bg-slate-800 rounded-xl p-6 border border-gray-600 mb-4'>
                  <View className='flex-row justify-between items-center mb-4'>
                    <Text className='text-xl font-bold text-white'>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openAddExerciseModal(item.id)}
                      className='bg-green-600 rounded-lg px-3 py-1'
                    >
                      <Text className='text-white font-semibold text-sm'>
                        + Ćwiczenie
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {item.exercises.length === 0 ? (
                    <Text className='text-gray-400 text-center py-4'>
                      Brak ćwiczeń w tym dniu
                    </Text>
                  ) : (
                    <View>
                      {item.exercises.map((exercise) => (
                        <View
                          key={exercise.id}
                          className='bg-slate-700 rounded-lg p-4 mb-2'
                        >
                          <View className='flex-row items-center mb-2'>
                            <View className='bg-purple-600 w-6 h-6 rounded-full justify-center items-center mr-3'>
                              <Text className='text-slate-900 font-semibold text-xs'>
                                {exercise.orderNumber}
                              </Text>
                            </View>
                            <Text className='text-white font-semibold flex-1'>
                              {exercise.name}
                            </Text>
                          </View>
                          <View className='flex-row flex-wrap'>
                            <Text className='text-gray-300 text-sm mr-4'>
                              Serie: {exercise.sets}
                            </Text>
                            <Text className='text-gray-300 text-sm mr-4'>
                              Powtórzenia: {exercise.reps}
                            </Text>
                            <Text className='text-gray-300 text-sm'>
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
                  className='bg-slate-700 rounded-xl p-6 items-center border-2 border-dashed border-gray-600'
                >
                  <Text className='text-gray-400 font-semibold text-lg'>
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
          <View className='flex-1 justify-start bg-black bg-opacity-50'>
            <View
              className='bg-slate-800 rounded-b-3xl p-6'
              style={{ marginTop: insets.top + 10 }}
            >
              <Text className='text-xl font-bold text-white mb-4'>
                Dodaj Dzień Treningowy
              </Text>
              <TextInput
                value={newDayName}
                onChangeText={setNewDayName}
                placeholder='Nazwa dnia (np. Dzień 1 - Klatka)'
                placeholderTextColor='#9CA3AF'
                className='bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg mb-6'
                autoFocus
              />
              <View className='flex-row space-x-4'>
                <TouchableOpacity
                  onPress={() => setShowAddDayModal(false)}
                  className='flex-1 bg-gray-600 rounded-lg py-3 items-center mr-2'
                >
                  <Text className='text-white font-semibold'>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={addTrainingDay}
                  className='flex-1 bg-purple-600 rounded-lg py-3 items-center ml-2'
                >
                  <Text className='text-white font-semibold'>Dodaj</Text>
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
          <View className='flex-1 justify-start bg-black bg-opacity-50'>
            <View
              className='bg-slate-800 rounded-b-3xl p-6 max-h-4/5 h-screen'
              style={{ marginTop: insets.top + 10 }}
            >
              <Text className='text-xl font-bold text-white mb-4'>
                Dodaj Ćwiczenie
              </Text>
              <View className='flex flex-col gap-4'>
                <View>
                  <Text className='text-gray-400 text-sm mb-1'>
                    Nazwa ćwiczenia
                  </Text>
                  <TextInput
                    value={newExercise.name}
                    onChangeText={(value) =>
                      setNewExercise((prev) => ({ ...prev, name: value }))
                    }
                    placeholder='np. Wyciskanie sztangi na ławce poziomej'
                    placeholderTextColor='#9CA3AF'
                    className='bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white'
                  />
                </View>

                <View className='flex-row space-x-4 gap-5'>
                  <View className='flex-1'>
                    <Text className='text-gray-400 text-sm mb-1'>Serie</Text>
                    <TextInput
                      value={newExercise.sets.toString()}
                      onChangeText={(value) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          sets: parseInt(value) || 1,
                        }))
                      }
                      keyboardType='numeric'
                      className='bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white'
                    />
                  </View>
                  <View className='flex-1 '>
                    <Text className='text-gray-400 text-sm mb-1'>
                      Powtórzenia
                    </Text>
                    <TextInput
                      value={newExercise.reps}
                      onChangeText={(value) =>
                        setNewExercise((prev) => ({ ...prev, reps: value }))
                      }
                      placeholder='np. 8-12'
                      placeholderTextColor='#9CA3AF'
                      className='bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white'
                    />
                  </View>
                </View>

                <View className='flex-row space-x-4 gap-5'>
                  <View className='flex-1'>
                    <Text className='text-gray-400 text-sm mb-1'>Tempo</Text>
                    <TextInput
                      value={newExercise.tempo}
                      onChangeText={(value) =>
                        setNewExercise((prev) => ({ ...prev, tempo: value }))
                      }
                      placeholder='3-1-1-0'
                      placeholderTextColor='#9CA3AF'
                      className='bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white'
                    />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-gray-400 text-sm mb-1'>
                      Odpoczynek (s)
                    </Text>
                    <TextInput
                      value={newExercise.restSeconds.toString()}
                      onChangeText={(value) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          restSeconds: parseInt(value) || 90,
                        }))
                      }
                      keyboardType='numeric'
                      className='bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white'
                    />
                  </View>
                </View>

                <View>
                  <Text className='text-gray-400 text-sm mb-1'>
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
                    className='bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white'
                    textAlignVertical='top'
                  />
                </View>
              </View>

              <View className='flex-row space-x-4 mt-6'>
                <TouchableOpacity
                  onPress={() => setShowAddExerciseModal(false)}
                  className='flex-1 bg-gray-600 rounded-lg py-3 items-center mr-2'
                >
                  <Text className='text-white font-semibold'>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={addExercise}
                  className='flex-1 bg-purple-600 rounded-lg py-3 items-center ml-2'
                >
                  <Text className='text-white font-semibold'>Dodaj</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
