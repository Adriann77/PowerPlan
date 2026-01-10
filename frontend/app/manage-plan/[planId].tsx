import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { apiClient, TrainingDay, Exercise } from '../../src/services/api';
import { 
  EXERCISE_TEMPLATES, 
  getExerciseCategories, 
  ExerciseTemplate 
} from '../../src/hooks/usePlans';
import { LoadingOverlay, ConfirmDialog } from '../../src/components/ui';

type ModalMode = 'custom' | 'template';

export default function ManagePlanScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const insets = useSafeAreaInsets();
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditDayModal, setShowEditDayModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newDayName, setNewDayName] = useState('');
  const [editDayName, setEditDayName] = useState('');
  
  // Exercise modal state
  const [modalMode, setModalMode] = useState<ModalMode>('template');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '10',
    tempo: '3-1-1-0',
    restSeconds: 90,
    notes: '',
  });
  const [editExercise, setEditExercise] = useState({
    name: '',
    sets: 3,
    reps: '10',
    tempo: '3-1-1-0',
    restSeconds: 90,
    notes: '',
    orderNumber: 1,
  });

  // Delete confirmation state
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<{ dayId: string; exerciseId: string; name: string } | null>(null);
  const [showTempoInfo, setShowTempoInfo] = useState(false);

  const categories = useMemo(() => getExerciseCategories(), []);

  const filteredTemplates = useMemo(() => {
    let templates = EXERCISE_TEMPLATES;
    
    if (selectedCategory) {
      templates = templates.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return templates;
  }, [selectedCategory, searchQuery]);

  const formatTempo = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const digits = numbers.slice(0, 4);
    
    if (digits.length === 0) return '';
    if (digits.length === 1) return digits;
    if (digits.length === 2) return `${digits[0]}-${digits[1]}`;
    if (digits.length === 3) return `${digits[0]}-${digits[1]}-${digits[2]}`;
    return `${digits[0]}-${digits[1]}-${digits[2]}-${digits[3]}`;
  };

  const fetchTrainingDays = async () => {
    try {
      setIsLoading(true);
      const days = await apiClient.getTrainingDays(planId);
      setTrainingDays(days);
    } catch (error) {
      console.error('Fetch training days error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchTrainingDays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const addTrainingDay = async () => {
    if (!newDayName.trim()) {
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
    } catch (error) {
      console.error('Create training day error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addExerciseToDay = async (exerciseData: {
    name: string;
    sets: number;
    reps: number;
    tempo: string;
    restSeconds: number;
    notes?: string;
  }) => {
    if (!selectedDayId) return;

    try {
      setIsSaving(true);
      const orderNumber =
        trainingDays.find((d) => d.id === selectedDayId)?.exercises.length || 0;

      const exercise = await apiClient.createExercise(selectedDayId, {
        ...exerciseData,
        orderNumber: orderNumber + 1,
      });

      setTrainingDays((prev) =>
        prev.map((day) =>
          day.id === selectedDayId
            ? { ...day, exercises: [...day.exercises, exercise] }
            : day,
        ),
      );

      resetExerciseModal();
    } catch (error) {
      console.error('Create exercise error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomExercise = async () => {
    if (!newExercise.name.trim() || !newExercise.reps.trim()) {
      return;
    }

    await addExerciseToDay({
      name: newExercise.name,
      sets: newExercise.sets,
      reps: parseInt(newExercise.reps, 10) || 1,
      tempo: newExercise.tempo,
      restSeconds: newExercise.restSeconds,
      notes: newExercise.notes || undefined,
    });
  };

  const addTemplateExercise = async (template: ExerciseTemplate) => {
    await addExerciseToDay({
      name: template.name,
      sets: template.sets,
      reps: template.reps,
      tempo: template.tempo,
      restSeconds: template.restSeconds,
    });
  };

  // Delete Training Day
  const confirmDeleteTrainingDay = async () => {
    if (!dayToDelete) return;
    
    try {
      setIsSaving(true);
      const dayId = dayToDelete;
      setDayToDelete(null);
      await apiClient.deleteTrainingDay(planId, dayId);
      setTrainingDays((prev) => prev.filter((day) => day.id !== dayId));
    } catch (error) {
      console.error('Delete training day error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Training Day
  const openEditDayModal = (day: TrainingDay) => {
    setSelectedDayId(day.id);
    setEditDayName(day.name);
    setShowEditDayModal(true);
  };

  const updateTrainingDay = async () => {
    if (!selectedDayId || !editDayName.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updateTrainingDay(planId, selectedDayId, {
        name: editDayName,
      });
      setTrainingDays((prev) =>
        prev.map((day) =>
          day.id === selectedDayId ? { ...day, name: editDayName } : day
        )
      );
      setShowEditDayModal(false);
      setSelectedDayId(null);
      setEditDayName('');
    } catch (error) {
      console.error('Update training day error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Exercise
  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    
    try {
      setIsSaving(true);
      const { dayId, exerciseId } = exerciseToDelete;
      setExerciseToDelete(null);
      await apiClient.deleteExercise(dayId, exerciseId);
      setTrainingDays((prev) =>
        prev.map((day) =>
          day.id === dayId
            ? { ...day, exercises: day.exercises.filter((e) => e.id !== exerciseId) }
            : day
        )
      );
    } catch (error) {
      console.error('Delete exercise error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Exercise
  const openEditExerciseModal = (dayId: string, exercise: Exercise) => {
    setSelectedDayId(dayId);
    setSelectedExercise(exercise);
    setEditExercise({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps.toString(),
      tempo: exercise.tempo,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes || '',
      orderNumber: parseInt(exercise.orderNumber) || 1,
    });
    setShowEditExerciseModal(true);
  };

  const updateExercise = async () => {
    if (!selectedDayId || !selectedExercise || !editExercise.name.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      const updatedExercise = await apiClient.updateExercise(
        selectedDayId,
        selectedExercise.id,
        {
          name: editExercise.name,
          sets: editExercise.sets,
          reps: parseInt(editExercise.reps, 10) || 1,
          tempo: editExercise.tempo,
          restSeconds: editExercise.restSeconds,
          notes: editExercise.notes || undefined,
          orderNumber: editExercise.orderNumber,
        }
      );
      setTrainingDays((prev) =>
        prev.map((day) =>
          day.id === selectedDayId
            ? {
                ...day,
                exercises: day.exercises.map((e) =>
                  e.id === selectedExercise.id ? updatedExercise : e
                ),
              }
            : day
        )
      );
      setShowEditExerciseModal(false);
      setSelectedDayId(null);
      setSelectedExercise(null);
    } catch (error) {
      console.error('Update exercise error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddExerciseModal = (dayId: string) => {
    setSelectedDayId(dayId);
    setModalMode('template');
    setSelectedCategory(null);
    setSearchQuery('');
    setShowAddExerciseModal(true);
  };

  const resetExerciseModal = () => {
    setShowAddExerciseModal(false);
    setSelectedDayId(null);
    setModalMode('template');
    setSelectedCategory(null);
    setSearchQuery('');
    setNewExercise({
      name: '',
      sets: 3,
      reps: '10',
      tempo: '3-1-1-0',
      restSeconds: 90,
      notes: '',
    });
  };

  const goBackToPlans = () => {
    router.push('/plans');
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Klatka piersiowa': 'bg-red-600',
      'Plecy': 'bg-blue-600',
      'Nogi': 'bg-green-600',
      'Barki': 'bg-yellow-600',
      'Biceps': 'bg-purple-600',
      'Triceps': 'bg-pink-600',
      'Brzuch': 'bg-orange-600',
    };
    return colors[category] || 'bg-gray-600';
  };

  const handleAddTemplate = (template: ExerciseTemplate) => {
    if (isSaving) return;
    addTemplateExercise(template);
  };

  const TemplateItem = ({ item }: { item: ExerciseTemplate }) => (
    <View className="p-4 mb-3 border border-gray-600 bg-slate-700 rounded-xl">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="font-semibold text-white">{item.name}</Text>
          <View className={`self-start px-2 py-1 mt-1 rounded-full ${getCategoryColor(item.category)}`}>
            <Text className="text-xs font-medium text-white">{item.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleAddTemplate(item)}
          disabled={isSaving}
          className="items-center justify-center w-10 h-10 bg-green-600 rounded-full"
        >
          <Text className="text-xl font-bold text-white">+</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row flex-wrap gap-2 mt-2">
        <View className="px-2 py-1 rounded bg-slate-600">
          <Text className="text-xs text-gray-300">Serie: {item.sets}</Text>
        </View>
        <View className="px-2 py-1 rounded bg-slate-600">
          <Text className="text-xs text-gray-300">Powt: {item.reps}</Text>
        </View>
        <View className="px-2 py-1 rounded bg-slate-600">
          <Text className="text-xs text-gray-300">Tempo: {item.tempo}</Text>
        </View>
        <View className="px-2 py-1 rounded bg-slate-600">
          <Text className="text-xs text-gray-300">Odp: {item.restSeconds}s</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <LoadingOverlay visible={isSaving} message="Zapisywanie..." />
      
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 border-b border-gray-600">
          <TouchableOpacity onPress={goBackToPlans} className="self-start mb-4">
            <Text className="text-base text-purple-400">← Wróć do Planów</Text>
          </TouchableOpacity>
          <Text className="mb-2 text-3xl font-bold text-white">
            Zarządzaj Planem
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-4">
          {isLoading ? (
            <View className="items-center justify-center flex-1">
              <ActivityIndicator size="large" color="#AB8BFF" />
            </View>
          ) : trainingDays.length === 0 ? (
            <View className="items-center justify-center flex-1">
              <Text className="mb-6 text-lg text-center text-gray-400">
                Brak dni treningowych
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddDayModal(true)}
                className="px-6 py-3 bg-purple-600 rounded-lg"
              >
                <Text className="font-semibold text-white">
                  Dodaj Pierwszy Dzień Treningowy
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={trainingDays}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item }) => (
                <View className="p-6 mb-4 border border-gray-600 bg-slate-800 rounded-xl">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="flex-1 text-xl font-bold text-white">{item.name}</Text>
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => {
                          console.log('Edit day pressed:', item.name);
                          openEditDayModal(item);
                        }}
                        className="items-center justify-center mr-2 rounded-lg w-9 h-9 bg-slate-700"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="pencil" size={18} color="#AB8BFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          console.log('Delete day pressed:', item.name);
                          setDayToDelete(item.id);
                        }}
                        className="items-center justify-center mr-2 rounded-lg w-9 h-9 bg-slate-700"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash" size={18} color="#EF4444" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openAddExerciseModal(item.id)}
                        className="px-3 py-1 bg-green-600 rounded-lg"
                      >
                        <Text className="text-sm font-semibold text-white">+ Ćwiczenie</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {item.exercises.length === 0 ? (
                    <Text className="py-4 text-center text-gray-400">
                      Brak ćwiczeń w tym dniu
                    </Text>
                  ) : (
                    <View>
                      {item.exercises.map((exercise) => (
                        <View
                          key={exercise.id}
                          className="p-4 mb-2 rounded-lg bg-slate-700"
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center flex-1">
                              <View className="items-center justify-center w-6 h-6 mr-3 bg-purple-600 rounded-full">
                                <Text className="text-xs font-semibold text-slate-900">
                                  {exercise.orderNumber}
                                </Text>
                              </View>
                              <Text className="flex-1 font-semibold text-white">
                                {exercise.name}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <TouchableOpacity
                                onPress={() => {
                                  console.log('Edit exercise pressed:', exercise.name);
                                  openEditExerciseModal(item.id, exercise);
                                }}
                                className="p-2 mr-1"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              >
                                <Ionicons name="pencil" size={16} color="#AB8BFF" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  console.log('Delete exercise pressed:', exercise.name);
                                  setExerciseToDelete({ dayId: item.id, exerciseId: exercise.id, name: exercise.name });
                                }}
                                className="p-2"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              >
                                <Ionicons name="trash" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View className="flex-row flex-wrap">
                            <Text className="mr-4 text-sm text-gray-300">
                              Serie: {exercise.sets}
                            </Text>
                            <Text className="mr-4 text-sm text-gray-300">
                              Powtórzenia: {exercise.reps}
                            </Text>
                            <Text className="mr-4 text-sm text-gray-300">
                              Tempo: {exercise.tempo}
                            </Text>
                            <Text className="text-sm text-gray-300">
                              Odpoczynek: {exercise.restSeconds}s
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
                  className="items-center p-6 bg-purple-600 rounded-xl"
                >
                  <Text className="text-lg font-semibold text-white">
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
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddDayModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="justify-start flex-1 bg-black bg-opacity-50">
            <View
              className="p-6 bg-slate-800 rounded-b-3xl"
              style={{ marginTop: insets.top + 10 }}
            >
              <Text className="mb-4 text-xl font-bold text-white">
                Dodaj Dzień Treningowy
              </Text>
              <TextInput
                value={newDayName}
                onChangeText={setNewDayName}
                placeholder="Nazwa dnia (np. Dzień 1 - Klatka)"
                placeholderTextColor="#9CA3AF"
                className="px-4 py-3 mb-6 text-lg text-white border border-gray-600 rounded-lg bg-slate-700"
                autoFocus
              />
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={() => setShowAddDayModal(false)}
                  className="items-center flex-1 py-3 mr-2 bg-gray-600 rounded-lg"
                  disabled={isSaving}
                >
                  <Text className="font-semibold text-white">Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={addTrainingDay}
                  className="items-center flex-1 py-3 ml-2 bg-purple-600 rounded-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="font-semibold text-white">Dodaj</Text>
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
        animationType="slide"
        transparent={true}
        onRequestClose={resetExerciseModal}
      >
        <View 
          className="flex-1 bg-slate-900"
          style={{ paddingTop: insets.top }}
        >
          {/* Modal Header */}
          <View className="px-6 py-4 border-b border-gray-700">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Dodaj Ćwiczenie</Text>
              <TouchableOpacity onPress={resetExerciseModal}>
                <Text className="text-lg text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Mode Toggle */}
            <View className="flex-row p-1 rounded-lg bg-slate-800">
              <TouchableOpacity
                onPress={() => setModalMode('template')}
                className={`flex-1 py-2 rounded-md ${modalMode === 'template' ? 'bg-purple-600' : ''}`}
              >
                <Text className={`text-center font-medium ${modalMode === 'template' ? 'text-white' : 'text-gray-400'}`}>
                  📋 Z Biblioteki
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalMode('custom')}
                className={`flex-1 py-2 rounded-md ${modalMode === 'custom' ? 'bg-purple-600' : ''}`}
              >
                <Text className={`text-center font-medium ${modalMode === 'custom' ? 'text-white' : 'text-gray-400'}`}>
                  ✏️ Własne
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {modalMode === 'template' ? (
            /* Template Selection View */
            <View className="flex-1">
              {/* Search Bar */}
              <View className="px-6 py-3">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="🔍 Szukaj ćwiczenia..."
                  placeholderTextColor="#9CA3AF"
                  className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-800"
                />
              </View>

              {/* Category Filter */}
              <View className="px-6 pb-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    className={`px-4 py-2 mr-2 rounded-full ${!selectedCategory ? 'bg-purple-600' : 'bg-slate-700'}`}
                  >
                    <Text className={`font-medium ${!selectedCategory ? 'text-white' : 'text-gray-300'}`}>
                      Wszystkie
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      className={`px-4 py-2 mr-2 rounded-full ${selectedCategory === category ? getCategoryColor(category) : 'bg-slate-700'}`}
                    >
                      <Text className={`font-medium ${selectedCategory === category ? 'text-white' : 'text-gray-300'}`}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Templates List */}
              <FlatList
                data={filteredTemplates}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => <TemplateItem item={item} />}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                ListEmptyComponent={() => (
                  <View className="items-center py-8">
                    <Text className="text-gray-400">Nie znaleziono ćwiczeń</Text>
                  </View>
                )}
                ListHeaderComponent={() => (
                  <Text className="mb-3 text-sm text-gray-400">
                    Kliknij + aby dodać ćwiczenie ({filteredTemplates.length} dostępnych)
                  </Text>
                )}
              />
            </View>
          ) : (
            /* Custom Exercise Form */
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
            >
              <ScrollView className="flex-1 px-6 pt-4">
                <View className="flex flex-col gap-4">
                  <View>
                    <Text className="mb-1 text-sm text-gray-400">Nazwa ćwiczenia</Text>
                    <TextInput
                      value={newExercise.name}
                      onChangeText={(value) =>
                        setNewExercise((prev) => ({ ...prev, name: value }))
                      }
                      placeholder="np. Wyciskanie sztangi na ławce poziomej"
                      placeholderTextColor="#9CA3AF"
                      className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                    />
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="mb-1 text-sm text-gray-400">Serie</Text>
                      <TextInput
                        value={newExercise.sets === 0 ? '' : newExercise.sets.toString()}
                        onChangeText={(value) => {
                          if (value === '') {
                            setNewExercise((prev) => ({ ...prev, sets: 0 }));
                          } else {
                            const numValue = parseInt(value.replace(/[^0-9]/g, ''));
                            setNewExercise((prev) => ({
                              ...prev,
                              sets: isNaN(numValue) ? 0 : numValue,
                            }));
                          }
                        }}
                        keyboardType="numeric"
                        className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm text-gray-400">Powtórzenia</Text>
                      <TextInput
                        value={newExercise.reps}
                        onChangeText={(value) =>
                          setNewExercise((prev) => ({ ...prev, reps: value.replace(/[^0-9]/g, '') }))
                        }
                        placeholder="np. 10"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-sm text-gray-400">Tempo</Text>
                        <TouchableOpacity
                          onPress={() => setShowTempoInfo(true)}
                          className="p-1 ml-2 rounded-full bg-blue-500/20"
                        >
                          <Text className="text-sm font-bold text-blue-400">?</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        value={newExercise.tempo}
                        onChangeText={(value) => {
                          const formatted = formatTempo(value);
                          setNewExercise((prev) => ({ ...prev, tempo: formatted }));
                        }}
                        placeholder="3-1-1-0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        maxLength={7}
                        className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm text-gray-400">Odpoczynek (s)</Text>
                      <TextInput
                        value={newExercise.restSeconds === 0 ? '' : newExercise.restSeconds.toString()}
                        onChangeText={(value) => {
                          if (value === '') {
                            setNewExercise((prev) => ({ ...prev, restSeconds: 0 }));
                          } else {
                            const numValue = parseInt(value.replace(/[^0-9]/g, ''));
                            setNewExercise((prev) => ({
                              ...prev,
                              restSeconds: isNaN(numValue) ? 0 : numValue,
                            }));
                          }
                        }}
                        keyboardType="numeric"
                        className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="mb-1 text-sm text-gray-400">Notatki (opcjonalne)</Text>
                    <TextInput
                      value={newExercise.notes}
                      onChangeText={(value) =>
                        setNewExercise((prev) => ({ ...prev, notes: value }))
                      }
                      placeholder="Dodatkowe uwagi..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={2}
                      className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <View className="flex-row gap-4 mt-6 mb-8">
                  <TouchableOpacity
                    onPress={resetExerciseModal}
                    className="items-center flex-1 py-3 bg-gray-600 rounded-lg"
                    disabled={isSaving}
                  >
                    <Text className="font-semibold text-white">Anuluj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={addCustomExercise}
                    className="items-center flex-1 py-3 bg-purple-600 rounded-lg"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text className="font-semibold text-white">Dodaj</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </Modal>

      {/* Edit Training Day Modal */}
      <Modal
        visible={showEditDayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditDayModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="justify-start flex-1 bg-black bg-opacity-50">
            <View
              className="p-6 bg-slate-800 rounded-b-3xl"
              style={{ marginTop: insets.top + 10 }}
            >
              <Text className="mb-4 text-xl font-bold text-white">
                Edytuj Dzień Treningowy
              </Text>
              <TextInput
                value={editDayName}
                onChangeText={setEditDayName}
                placeholder="Nazwa dnia (np. Dzień 1 - Klatka)"
                placeholderTextColor="#9CA3AF"
                className="px-4 py-3 mb-6 text-lg text-white border border-gray-600 rounded-lg bg-slate-700"
                autoFocus
              />
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowEditDayModal(false);
                    setSelectedDayId(null);
                    setEditDayName('');
                  }}
                  className="items-center flex-1 py-3 mr-2 bg-gray-600 rounded-lg"
                  disabled={isSaving}
                >
                  <Text className="font-semibold text-white">Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={updateTrainingDay}
                  className="items-center flex-1 py-3 ml-2 bg-purple-600 rounded-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="font-semibold text-white">Zapisz</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Exercise Modal */}
      <Modal
        visible={showEditExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditExerciseModal(false)}
      >
        <View 
          className="flex-1 bg-slate-900"
          style={{ paddingTop: insets.top }}
        >
          {/* Modal Header */}
          <View className="px-6 py-4 border-b border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">Edytuj Ćwiczenie</Text>
              <TouchableOpacity onPress={() => {
                setShowEditExerciseModal(false);
                setSelectedDayId(null);
                setSelectedExercise(null);
              }}>
                <Text className="text-lg text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <ScrollView className="flex-1 px-6 pt-4">
              <View className="flex flex-col gap-4">
                <View>
                  <Text className="mb-1 text-sm text-gray-400">Nazwa ćwiczenia</Text>
                  <TextInput
                    value={editExercise.name}
                    onChangeText={(value) =>
                      setEditExercise((prev) => ({ ...prev, name: value }))
                    }
                    placeholder="np. Wyciskanie sztangi na ławce poziomej"
                    placeholderTextColor="#9CA3AF"
                    className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                  />
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="mb-1 text-sm text-gray-400">Serie</Text>
                    <TextInput
                      value={editExercise.sets === 0 ? '' : editExercise.sets.toString()}
                      onChangeText={(value) => {
                        if (value === '') {
                          setEditExercise((prev) => ({ ...prev, sets: 0 }));
                        } else {
                          const numValue = parseInt(value.replace(/[^0-9]/g, ''));
                          setEditExercise((prev) => ({
                            ...prev,
                            sets: isNaN(numValue) ? 0 : numValue,
                          }));
                        }
                      }}
                      keyboardType="numeric"
                      className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-sm text-gray-400">Powtórzenia</Text>
                    <TextInput
                      value={editExercise.reps}
                      onChangeText={(value) =>
                        setEditExercise((prev) => ({ ...prev, reps: value.replace(/[^0-9]/g, '') }))
                      }
                      placeholder="np. 10"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                    />
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="mb-1 text-sm text-gray-400">Tempo</Text>
                    <TextInput
                      value={editExercise.tempo}
                      onChangeText={(value) => {
                        const formatted = formatTempo(value);
                        setEditExercise((prev) => ({ ...prev, tempo: formatted }));
                      }}
                      placeholder="3-1-1-0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={7}
                      className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-sm text-gray-400">Odpoczynek (s)</Text>
                    <TextInput
                      value={editExercise.restSeconds === 0 ? '' : editExercise.restSeconds.toString()}
                      onChangeText={(value) => {
                        if (value === '') {
                          setEditExercise((prev) => ({ ...prev, restSeconds: 0 }));
                        } else {
                          const numValue = parseInt(value.replace(/[^0-9]/g, ''));
                          setEditExercise((prev) => ({
                            ...prev,
                            restSeconds: isNaN(numValue) ? 0 : numValue,
                          }));
                        }
                      }}
                      keyboardType="numeric"
                      className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mb-1 text-sm text-gray-400">Notatki (opcjonalne)</Text>
                  <TextInput
                    value={editExercise.notes}
                    onChangeText={(value) =>
                      setEditExercise((prev) => ({ ...prev, notes: value }))
                    }
                    placeholder="Dodatkowe uwagi..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={2}
                    className="px-4 py-3 text-white border border-gray-600 rounded-lg bg-slate-700"
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View className="flex-row gap-4 mt-6 mb-8">
                <TouchableOpacity
                  onPress={() => {
                    setShowEditExerciseModal(false);
                    setSelectedDayId(null);
                    setSelectedExercise(null);
                  }}
                  className="items-center flex-1 py-3 bg-gray-600 rounded-lg"
                  disabled={isSaving}
                >
                  <Text className="font-semibold text-white">Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={updateExercise}
                  className="items-center flex-1 py-3 bg-purple-600 rounded-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="font-semibold text-white">Zapisz</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Delete Training Day Confirmation */}
      <ConfirmDialog
        visible={dayToDelete !== null}
        title="Usuń dzień treningowy"
        message="Czy na pewno chcesz usunąć ten dzień treningowy? Wszystkie ćwiczenia zostaną usunięte."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onConfirm={confirmDeleteTrainingDay}
        onCancel={() => setDayToDelete(null)}
        destructive
      />

      {/* Delete Exercise Confirmation */}
      <ConfirmDialog
        visible={exerciseToDelete !== null}
        title="Usuń ćwiczenie"
        message={`Czy na pewno chcesz usunąć ćwiczenie "${exerciseToDelete?.name}"?`}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        onConfirm={confirmDeleteExercise}
        onCancel={() => setExerciseToDelete(null)}
        destructive
      />

      {/* Tempo Info Dialog */}
      <ConfirmDialog
        visible={showTempoInfo}
        title="Metodologia Tempo"
        message={"Tempo ćwiczenia określa czas trwania każdej fazy ruchu:\n\n• Pierwsza cyfra: FAZA KONCENTRYCZNA (opuszczanie ciężaru)\n• Druga cyfra: PAUZA NA DOLE (przerwa w pozycji końcowej)\n• Trzecia cyfra: FAZA EKSCENTRYCZNA (podnoszenie ciężaru)\n• Czwarta cyfra: PAUZA NA GÓRZE (przerwa w pozycji wyjściowej)\n\nPrzykład: 3-1-1-0 oznacza 3s w dół, 1s pauza na dole, 1s w górę, brak pauzy na górze."}
        confirmLabel="Rozumiem"
        onConfirm={() => setShowTempoInfo(false)}
        onCancel={() => setShowTempoInfo(false)}
      />
    </SafeAreaView>
  );
}
