import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, WorkoutSession } from '../services/api';

// History Hook
export function useWorkoutHistory(workoutPlanId?: string) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (!isMounted.current) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await apiClient.getWorkoutSessionHistory(workoutPlanId);
      if (isMounted.current) {
        setSessions(data.filter(s => s.isCompleted));
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Nie udało się załadować historii');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [workoutPlanId]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const refresh = useCallback(() => fetchHistory(true), [fetchHistory]);

  return {
    sessions,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchHistory,
  };
}

// Progress Data Hook
export type ExerciseProgressData = {
  exerciseId: string;
  exerciseName: string;
  dataPoints: {
    week: number;
    weight: number | null;
    date: string | null;
  }[];
  maxWeight: number;
  minWeight: number;
  latestWeight: number | null;
  progressPercentage: number | null;
};

export type TrainingDayProgress = {
  trainingDayId: string;
  trainingDayName: string;
  exercises: ExerciseProgressData[];
};

export function useProgressData(workoutPlanId: string | undefined, weekDuration: number = 8) {
  const [progressData, setProgressData] = useState<TrainingDayProgress[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchProgress = useCallback(async (isRefresh = false) => {
    if (!workoutPlanId || !isMounted.current) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const history = await apiClient.getWorkoutSessionHistory(workoutPlanId);
      const completedSessions = history.filter(s => s.isCompleted);
      
      if (isMounted.current) {
        setSessions(completedSessions);

        // Group by training day
        const byTrainingDay = new Map<string, {
          trainingDayId: string;
          trainingDayName: string;
          sessions: WorkoutSession[];
        }>();

        for (const session of completedSessions) {
          if (!byTrainingDay.has(session.trainingDayId)) {
            byTrainingDay.set(session.trainingDayId, {
              trainingDayId: session.trainingDayId,
              trainingDayName: session.trainingDayName || `Dzień ${session.trainingDayId}`,
              sessions: [],
            });
          }
          byTrainingDay.get(session.trainingDayId)!.sessions.push(session);
        }

        // Process each training day
        const processedData: TrainingDayProgress[] = [];

        for (const [, dayData] of byTrainingDay) {
          // Group exercises from all sessions
          const exerciseMap = new Map<string, {
            exerciseId: string;
            exerciseName: string;
            dataPoints: Map<number, { weight: number | null; date: string | null }>;
          }>();

          for (const session of dayData.sessions) {
            for (const log of session.exerciseLogs) {
              if (!exerciseMap.has(log.exerciseId)) {
                exerciseMap.set(log.exerciseId, {
                  exerciseId: log.exerciseId,
                  exerciseName: log.exerciseName || log.exerciseId,
                  dataPoints: new Map(),
                });
              }

              const exercise = exerciseMap.get(log.exerciseId)!;
              const existingPoint = exercise.dataPoints.get(session.weekNumber);
              
              // Keep the latest entry for each week
              if (!existingPoint || (session.completedAt && (!existingPoint.date || new Date(session.completedAt) > new Date(existingPoint.date)))) {
                exercise.dataPoints.set(session.weekNumber, {
                  weight: log.startingWeight ?? null,
                  date: session.completedAt ?? null,
                });
              }
            }
          }

          // Convert to array format
          const exercises: ExerciseProgressData[] = [];

          for (const [, exerciseData] of exerciseMap) {
            const dataPoints = Array.from({ length: weekDuration }, (_, i) => {
              const week = i + 1;
              const point = exerciseData.dataPoints.get(week);
              return {
                week,
                weight: point?.weight ?? null,
                date: point?.date ?? null,
              };
            });

            const weights = dataPoints.filter(p => p.weight !== null).map(p => p.weight as number);
            const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
            const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
            
            // Get the latest non-null weight
            const sortedByDate = dataPoints
              .filter(p => p.weight !== null && p.date !== null)
              .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
            
            const latestWeight = sortedByDate[0]?.weight ?? null;
            
            // Calculate progress percentage (first vs last recorded weight)
            const recordedWeights = dataPoints.filter(p => p.weight !== null);
            let progressPercentage: number | null = null;
            
            if (recordedWeights.length >= 2) {
              const firstWeight = recordedWeights[0].weight!;
              const lastWeight = recordedWeights[recordedWeights.length - 1].weight!;
              if (firstWeight > 0) {
                progressPercentage = ((lastWeight - firstWeight) / firstWeight) * 100;
              }
            }

            exercises.push({
              exerciseId: exerciseData.exerciseId,
              exerciseName: exerciseData.exerciseName,
              dataPoints,
              maxWeight,
              minWeight,
              latestWeight,
              progressPercentage,
            });
          }

          // Sort exercises by name
          exercises.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName, 'pl'));

          processedData.push({
            trainingDayId: dayData.trainingDayId,
            trainingDayName: dayData.trainingDayName,
            exercises,
          });
        }

        // Sort training days by name
        processedData.sort((a, b) => a.trainingDayName.localeCompare(b.trainingDayName, 'pl'));

        setProgressData(processedData);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Nie udało się załadować postępu');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [workoutPlanId, weekDuration]);

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [fetchProgress])
  );

  const refresh = useCallback(() => fetchProgress(true), [fetchProgress]);

  // Get all unique exercises across all training days
  const getAllExercises = useCallback(() => {
    const exercises: { exerciseId: string; exerciseName: string; trainingDayName: string }[] = [];
    for (const day of progressData) {
      for (const ex of day.exercises) {
        exercises.push({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          trainingDayName: day.trainingDayName,
        });
      }
    }
    return exercises;
  }, [progressData]);

  // Get all unique training days
  const getTrainingDays = useCallback(() => {
    return progressData.map(d => ({
      trainingDayId: d.trainingDayId,
      trainingDayName: d.trainingDayName,
    }));
  }, [progressData]);

  return {
    progressData,
    sessions,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchProgress,
    getAllExercises,
    getTrainingDays,
  };
}
