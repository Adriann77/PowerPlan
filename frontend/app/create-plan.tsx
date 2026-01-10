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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../src/services/api';
import { LoadingOverlay, Button } from '../src/components';

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
    if (step === 2) {
      const durationNum = parseInt(formData.duration, 10);
      if (!formData.duration.trim() || isNaN(durationNum) || durationNum < 1) {
        Alert.alert('Błąd', 'Podaj prawidłową liczbę tygodni (minimum 1)');
        return;
      }
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
        
        // Navigate directly to manage plan screen
        router.replace(`/manage-plan/${plan.id}`);
      } catch (error) {
        Alert.alert(
          'Błąd',
          error instanceof Error
            ? error.message
            : 'Nie udało się utworzyć planu',
        );
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
              className='px-4 py-4 text-lg text-white border border-gray-600 rounded-xl bg-slate-800'
              autoFocus
              returnKeyType="next"
              onSubmitEditing={nextStep}
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
              onChangeText={(value) => {
                // Only allow numbers
                const numericValue = value.replace(/[^0-9]/g, '');
                updateFormData('duration', numericValue);
              }}
              placeholder='np. 8'
              placeholderTextColor='#9CA3AF'
              keyboardType='number-pad'
              className='px-4 py-4 text-lg text-white border border-gray-600 rounded-xl bg-slate-800'
              autoFocus
              returnKeyType="next"
              onSubmitEditing={nextStep}
            />
            <Text className='mt-3 text-sm text-gray-500'>
              Typowe bloki treningowe: 4, 6, 8 lub 12 tygodni
            </Text>
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
              className='h-32 px-4 py-4 text-lg text-white border border-gray-600 rounded-xl bg-slate-800'
              textAlignVertical='top'
            />
            
            {/* Summary */}
            <View className='mt-6 p-4 bg-slate-800 rounded-xl border border-gray-700'>
              <Text className='text-lg font-bold text-white mb-3'>Podsumowanie</Text>
              <View className='flex-row justify-between mb-2'>
                <Text className='text-gray-400'>Nazwa:</Text>
                <Text className='text-white font-medium'>{formData.name}</Text>
              </View>
              <View className='flex-row justify-between'>
                <Text className='text-gray-400'>Czas trwania:</Text>
                <Text className='text-white font-medium'>{formData.duration} tygodni</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-900'>
      <LoadingOverlay 
        visible={isCreating} 
        message="Tworzenie planu treningowego..." 
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <View className='flex-1'>
          {/* Header */}
          <View className='px-6 pt-4 pb-6 border-b border-gray-700'>
            <TouchableOpacity
              onPress={() => (step === 1 ? router.back() : prevStep())}
              className='self-start mb-4'
            >
              <Text className='text-base text-purple-400'>
                ← {step === 1 ? 'Anuluj' : 'Wstecz'}
              </Text>
            </TouchableOpacity>

            {/* Progress Indicator */}
            <View className='flex-row justify-center items-center mb-2'>
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <View
                    className={`w-10 h-10 rounded-full justify-center items-center ${
                      stepNumber <= step ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <Text className='text-sm font-bold text-white'>
                      {stepNumber}
                    </Text>
                  </View>
                  {stepNumber < 3 && (
                    <View 
                      className={`w-12 h-1 mx-1 rounded ${
                        stepNumber < step ? 'bg-purple-600' : 'bg-gray-700'
                      }`} 
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
            <Text className='text-center text-gray-400 text-sm'>
              Krok {step} z 3
            </Text>
          </View>

          {/* Form Content */}
          <ScrollView className='flex-1' keyboardShouldPersistTaps="handled">
            {renderStepContent()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View className='px-6 py-6 border-t border-gray-700'>
            <Button
              label={step === 3 ? '✓ Utwórz Plan' : 'Dalej →'}
              onPress={nextStep}
              variant={step === 3 ? 'success' : 'primary'}
              size="large"
              fullWidth
              disabled={isCreating}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
