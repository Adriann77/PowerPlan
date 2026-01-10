import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, WorkoutPlan, TrainingDay, Exercise } from '../services/api';

// Plans Hook
export function usePlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchPlans = useCallback(async (isRefresh = false) => {
    if (!isMounted.current) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await apiClient.getWorkoutPlans();
      if (isMounted.current) {
        setPlans(data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Nie udało się załadować planów');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Auto-fetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  const refresh = useCallback(() => fetchPlans(true), [fetchPlans]);

  const getActivePlan = useCallback(() => {
    return plans.find(p => p.isActive) ?? null;
  }, [plans]);

  return {
    plans,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchPlans,
    getActivePlan,
    setPlans,
  };
}

// Training Days Hook
export function useTrainingDays(planId: string | undefined) {
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchTrainingDays = useCallback(async (isRefresh = false) => {
    if (!planId || !isMounted.current) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await apiClient.getTrainingDays(planId);
      if (isMounted.current) {
        setTrainingDays(data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Nie udało się załadować dni treningowych');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [planId]);

  useEffect(() => {
    if (planId) {
      fetchTrainingDays();
    }
  }, [planId, fetchTrainingDays]);

  const refresh = useCallback(() => fetchTrainingDays(true), [fetchTrainingDays]);

  return {
    trainingDays,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchTrainingDays,
    setTrainingDays,
  };
}

// Active Plan with Training Days Hook
export function useActivePlanWithDays() {
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isMounted.current) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const plans = await apiClient.getWorkoutPlans();
      const active = plans.find(p => p.isActive) ?? null;

      if (isMounted.current) {
        setActivePlan(active);

        if (active) {
          const days = await apiClient.getTrainingDays(active.id);
          if (isMounted.current) {
            setTrainingDays(days);
          }
        } else {
          setTrainingDays([]);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Nie udało się załadować danych');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    activePlan,
    trainingDays,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchData,
  };
}

// Exercise Templates - Common exercises that users can pick from
export const EXERCISE_TEMPLATES = [
  // Klatka piersiowa
  { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: 8, tempo: '3-1-1-0', restSeconds: 120, category: 'Klatka piersiowa' },
  { name: 'Wyciskanie hantli na ławce skośnej', sets: 4, reps: 10, tempo: '3-1-1-0', restSeconds: 90, category: 'Klatka piersiowa' },
  { name: 'Rozpiętki na bramie', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Klatka piersiowa' },
  { name: 'Pompki', sets: 3, reps: 15, tempo: '2-0-1-0', restSeconds: 60, category: 'Klatka piersiowa' },
  { name: 'Wyciskanie na maszynie', sets: 3, reps: 12, tempo: '2-1-1-0', restSeconds: 60, category: 'Klatka piersiowa' },
  
  // Plecy
  { name: 'Martwy ciąg', sets: 4, reps: 6, tempo: '3-1-1-0', restSeconds: 180, category: 'Plecy' },
  { name: 'Wiosłowanie sztangą', sets: 4, reps: 8, tempo: '3-1-1-0', restSeconds: 120, category: 'Plecy' },
  { name: 'Podciąganie na drążku', sets: 4, reps: 8, tempo: '3-1-1-0', restSeconds: 120, category: 'Plecy' },
  { name: 'Wiosłowanie hantlem jednorącz', sets: 3, reps: 10, tempo: '3-1-1-0', restSeconds: 90, category: 'Plecy' },
  { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Plecy' },
  { name: 'Przyciąganie wyciągu dolnego', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Plecy' },
  
  // Nogi
  { name: 'Przysiad ze sztangą', sets: 4, reps: 8, tempo: '3-1-1-0', restSeconds: 180, category: 'Nogi' },
  { name: 'Przysiad bułgarski', sets: 3, reps: 10, tempo: '3-1-1-0', restSeconds: 90, category: 'Nogi' },
  { name: 'Wypychanie na suwnicy', sets: 4, reps: 10, tempo: '3-1-1-0', restSeconds: 120, category: 'Nogi' },
  { name: 'Uginanie nóg leżąc', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Nogi' },
  { name: 'Prostowanie nóg na maszynie', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Nogi' },
  { name: 'Wspiecia na palce stojąc', sets: 4, reps: 15, tempo: '2-1-1-0', restSeconds: 45, category: 'Nogi' },
  { name: 'Hip thrust', sets: 3, reps: 12, tempo: '2-1-1-0', restSeconds: 90, category: 'Nogi' },
  
  // Barki
  { name: 'Wyciskanie żołnierskie', sets: 4, reps: 8, tempo: '3-1-1-0', restSeconds: 120, category: 'Barki' },
  { name: 'Wyciskanie hantli siedząc', sets: 4, reps: 10, tempo: '3-1-1-0', restSeconds: 90, category: 'Barki' },
  { name: 'Unoszenie hantli bokiem', sets: 3, reps: 15, tempo: '2-1-1-0', restSeconds: 45, category: 'Barki' },
  { name: 'Unoszenie hantli w opadzie tułowia', sets: 3, reps: 15, tempo: '2-1-1-0', restSeconds: 45, category: 'Barki' },
  { name: 'Face pull', sets: 3, reps: 15, tempo: '2-1-1-0', restSeconds: 45, category: 'Barki' },
  
  // Biceps
  { name: 'Uginanie ramion ze sztangą stojąc', sets: 3, reps: 10, tempo: '3-1-1-0', restSeconds: 60, category: 'Biceps' },
  { name: 'Uginanie ramion z hantlami', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Biceps' },
  { name: 'Uginanie ramion na modlitewniku', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Biceps' },
  { name: 'Uginanie ramion "młotki"', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Biceps' },
  
  // Triceps
  { name: 'Prostowanie ramion na wyciągu', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Triceps' },
  { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: 10, tempo: '3-1-1-0', restSeconds: 90, category: 'Triceps' },
  { name: 'Pompki na poręczach', sets: 3, reps: 10, tempo: '3-1-1-0', restSeconds: 90, category: 'Triceps' },
  { name: 'Francuskie wyciskanie', sets: 3, reps: 12, tempo: '3-1-1-0', restSeconds: 60, category: 'Triceps' },
  
  // Brzuch
  { name: 'Plank', sets: 3, reps: 60, tempo: '0-0-0-0', restSeconds: 45, category: 'Brzuch' },
  { name: 'Spięcia brzucha', sets: 3, reps: 20, tempo: '2-0-1-0', restSeconds: 45, category: 'Brzuch' },
  { name: 'Unoszenie nóg w zwisie', sets: 3, reps: 15, tempo: '2-0-1-0', restSeconds: 45, category: 'Brzuch' },
  { name: 'Skręty rosyjskie', sets: 3, reps: 20, tempo: '2-0-1-0', restSeconds: 45, category: 'Brzuch' },
];

export type ExerciseTemplate = typeof EXERCISE_TEMPLATES[0];

export function getExerciseCategories(): string[] {
  return [...new Set(EXERCISE_TEMPLATES.map(e => e.category))];
}

export function getExercisesByCategory(category: string): ExerciseTemplate[] {
  return EXERCISE_TEMPLATES.filter(e => e.category === category);
}
