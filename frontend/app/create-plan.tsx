import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../src/services/api';

interface PlanFormData {
  name: string;
  duration: string;
  description: string;
}

export default function CreatePlanScreen() {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    duration: '',
    description: '',
  });

  const updateFormData = (field: keyof PlanFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = async () => {
    if (step === 1 && !formData.name.trim()) {
      Alert.alert('Błąd', 'Nazwa planu jest wymagana');
      return;
    }
    if (step === 2 && !formData.duration.trim()) {
      Alert.alert('Błąd', 'Czas trwania jest wymagany');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Create plan via API
      setIsCreating(true);
      try {
        const plan = await apiClient.createWorkoutPlan({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          weekDuration: parseInt(formData.duration, 10),
          isActive: false,
        });
        Alert.alert('Sukces', 'Plan treningowy został utworzony!', [
          {
            text: 'OK',
            onPress: () => router.push(`/manage-plan/${plan.id}`),
          },
        ]);
      } catch (error) {
        Alert.alert(
          'Błąd',
          error instanceof Error
            ? error.message
            : 'Nie udało się utworzyć planu',
        );
      } finally {
        setIsCreating(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View className='flex-1 px-6'>
            <Text className='mt-6 mb-2 text-2xl font-bold text-white'>
              Nazwa Planu
            </Text>
            <Text className='mb-6 text-gray-400'>
              Wprowadź nazwę swojego planu treningowego
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder='np. Plan Siłowy dla Początkujących'
              placeholderTextColor='#9CA3AF'
              className='px-4 py-3 text-lg text-white border border-gray-600 rounded-lg bg-slate-800'
              autoFocus
            />
          </View>
        );

      case 2:
        return (
          <View className='flex-1 px-6'>
            <Text className='mb-2 text-2xl font-bold text-white'>
              Czas Trwania
            </Text>
            <Text className='mb-6 text-gray-400'>
              Ile tygodni ma trwać Twój plan?
            </Text>
            <TextInput
              value={formData.duration}
              onChangeText={(value) => updateFormData('duration', value)}
              placeholder='np. 8'
              placeholderTextColor='#9CA3AF'
              keyboardType='decimal-pad'
              className='px-4 py-3 text-lg text-white border border-gray-600 rounded-lg bg-slate-800'
              autoFocus
            />
          </View>
        );

      case 3:
        return (
          <View className='flex-1 px-6'>
            <Text className='mb-2 text-2xl font-bold text-white'>
              Opis Planu
            </Text>
            <Text className='mb-6 text-gray-400'>
              Dodaj opcjonalny opis swojego planu (można pominąć)
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder='Opisz cele planu, poziom trudności, itp.'
              placeholderTextColor='#9CA3AF'
              multiline
              numberOfLines={4}
              className='h-32 px-4 py-3 text-lg text-white border border-gray-600 rounded-lg bg-slate-800'
              textAlignVertical='top'
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <View className='flex-1'>
          {/* Header */}
          <View className='px-6 pt-4 pb-6 border-b border-gray-600'>
            <TouchableOpacity
              onPress={() => (step === 1 ? router.back() : prevStep())}
              className='self-start mb-4'
            >
              <Text className='text-base text-purple-400'>
                ← {step === 1 ? 'Wróć' : 'Poprzedni'}
              </Text>
            </TouchableOpacity>

            {/* Progress Indicator */}
            <View className='flex-row justify-center mb-4'>
              {[1, 2, 3].map((stepNumber) => (
                <View
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full mx-2 justify-center items-center ${
                    stepNumber <= step ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <Text className='text-sm font-semibold text-white'>
                    {stepNumber}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Form Content */}
          <ScrollView className='flex-1'>{renderStepContent()}</ScrollView>

          {/* Navigation Buttons */}
          <View className='px-6 py-6 border-t border-gray-600'>
            <TouchableOpacity
              onPress={nextStep}
              disabled={isCreating}
              className={`rounded-lg py-4 items-center ${
                isCreating ? 'bg-gray-600' : 'bg-purple-600'
              }`}
            >
              {isCreating ? (
                <ActivityIndicator color='#ffffff' />
              ) : (
                <Text className='text-lg font-semibold text-white'>
                  {step === 3 ? 'Utwórz Plan' : 'Dalej'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
