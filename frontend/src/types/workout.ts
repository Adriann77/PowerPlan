export type User = {
  id: string;
  username: string;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description?: string | null;
  weekDuration: number;
  isActive: boolean;
  trainingDays: TrainingDay[];
};

export type TrainingDay = {
  id: string;
  name: string;
  description?: string | null;
  exercises: Exercise[];
};

export type Exercise = {
  id: string;
  orderNumber: string;
  name: string;
  sets: number;
  reps: number;
  tempo: string;
  restSeconds: number;
  notes?: string | null;
};

export type WorkoutSession = {
  id: string;
  trainingDayId: string;
  weekNumber: number;
  completedAt?: string | null;
  isCompleted: boolean;
  notes?: string | null;
  exerciseLogs: ExerciseLog[];
};

export type ExerciseLog = {
  id: string;
  exerciseId: string;
  startingWeight?: number | null;
  isCompleted: boolean;
  notes?: string | null;
  feeling?: number | null;
  nextPreference?: 'GAIN' | 'STAY' | 'LOWER' | null;
};

export type MockWorkoutState = {
  user: User;
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
};


