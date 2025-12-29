import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@powerplan:token';

// API Response types
type ApiResponse<T> = {
  message?: string;
  user?: T;
  token?: string;
  error?: string;
  userId?: string;
  username?: string;
};

type LoginResponse = {
  message: string;
  user: {
    id: string;
    username: string;
  };
  token: string;
};

type RegisterResponse = {
  message: string;
  user: {
    id: string;
    username: string;
  };
  token: string;
};

type MeResponse = {
  message: string;
  userId: string;
  username: string;
};

export type WorkoutSessionExerciseLog = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  startingWeight?: number | null;
  isCompleted: boolean;
  notes?: string | null;
  feeling?: number | null;
  nextPreference?: 'GAIN' | 'STAY' | 'LOWER' | null;
};

export type WorkoutSession = {
  id: string;
  workoutPlanId: string;
  trainingDayId: string;
  weekNumber: number;
  isCompleted: boolean;
  completedAt?: string | null;
  notes?: string | null;
  workoutPlanName: string;
  trainingDayName: string;
  exerciseLogs: WorkoutSessionExerciseLog[];
};

export type StartWorkoutSessionRequest = {
  workoutPlanId: string;
  trainingDayId: string;
  weekNumber: number;
};

export type CompleteWorkoutSessionRequest = {
  notes?: string | null;
  exerciseLogs: {
    exerciseId: string;
    startingWeight?: number | null;
    isCompleted: boolean;
    notes?: string | null;
    feeling?: number | null;
    nextPreference?: 'GAIN' | 'STAY' | 'LOWER' | null;
  }[];
};

export type ExerciseWeightSuggestion = {
  exerciseId: string;
  suggestedWeight?: number | null;
};

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, try to get text for better error message
          const text = await response.text();
          throw new Error(
            `Invalid JSON response: ${text.substring(0, 100)}, ${jsonError}`,
          );
        }
      } else {
        // Non-JSON response (likely HTML error page or plain text)
        const text = await response.text();
        throw new Error(
          `Server returned non-JSON response (${
            response.status
          }): ${text.substring(0, 200)}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `HTTP error! status: ${response.status}`,
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async register(
    username: string,
    password: string,
  ): Promise<RegisterResponse> {
    const response = await this.request<
      ApiResponse<{ id: string; username: string }>
    >(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.user || !response.token) {
      throw new Error('Invalid response from server');
    }

    // Store the token
    await this.setToken(response.token);

    return {
      message: response.message || 'Registered successfully',
      user: response.user,
      token: response.token,
    };
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<
      ApiResponse<{ id: string; username: string }>
    >(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.user || !response.token) {
      throw new Error('Invalid response from server');
    }

    // Store the token
    await this.setToken(response.token);

    return {
      message: response.message || 'Logged in successfully',
      user: response.user,
      token: response.token,
    };
  }

  async logout(): Promise<void> {
    try {
      await this.request(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, remove token locally
      console.error('Logout error:', error);
    } finally {
      await this.removeToken();
    }
  }

  async getCurrentUser(): Promise<MeResponse> {
    const response = await this.request<MeResponse>(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
    });

    return response;
  }

  async checkAuth(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        return false;
      }

      // Verify token is still valid by calling /auth/me
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.log(error);
      await this.removeToken();
      return false;
    }
  }

  // Workout Plans
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    return this.request<WorkoutPlan[]>(API_ENDPOINTS.WORKOUT_PLANS.LIST, {
      method: 'GET',
    });
  }

  async createWorkoutPlan(
    data: CreateWorkoutPlanRequest,
  ): Promise<WorkoutPlan> {
    return this.request<WorkoutPlan>(API_ENDPOINTS.WORKOUT_PLANS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan> {
    return this.request<WorkoutPlan>(API_ENDPOINTS.WORKOUT_PLANS.GET(id), {
      method: 'GET',
    });
  }

  async updateWorkoutPlan(
    id: string,
    data: UpdateWorkoutPlanRequest,
  ): Promise<void> {
    await this.request(API_ENDPOINTS.WORKOUT_PLANS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Training Days
  async getTrainingDays(planId: string): Promise<TrainingDay[]> {
    return this.request<TrainingDay[]>(
      API_ENDPOINTS.TRAINING_DAYS.LIST(planId),
      {
        method: 'GET',
      },
    );
  }

  async createTrainingDay(
    planId: string,
    data: CreateTrainingDayRequest,
  ): Promise<TrainingDay> {
    return this.request<TrainingDay>(
      API_ENDPOINTS.TRAINING_DAYS.CREATE(planId),
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async updateTrainingDay(
    planId: string,
    dayId: string,
    data: UpdateTrainingDayRequest,
  ): Promise<TrainingDay> {
    return this.request<TrainingDay>(
      API_ENDPOINTS.TRAINING_DAYS.UPDATE(planId, dayId),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }

  async deleteTrainingDay(planId: string, dayId: string): Promise<void> {
    await this.request(API_ENDPOINTS.TRAINING_DAYS.DELETE(planId, dayId), {
      method: 'DELETE',
    });
  }

  // Exercises
  async getExercises(dayId: string): Promise<Exercise[]> {
    return this.request<Exercise[]>(API_ENDPOINTS.EXERCISES.LIST(dayId), {
      method: 'GET',
    });
  }

  async createExercise(
    dayId: string,
    data: CreateExerciseRequest,
  ): Promise<Exercise> {
    return this.request<Exercise>(API_ENDPOINTS.EXERCISES.CREATE(dayId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExercise(
    dayId: string,
    exerciseId: string,
    data: UpdateExerciseRequest,
  ): Promise<Exercise> {
    return this.request<Exercise>(
      API_ENDPOINTS.EXERCISES.UPDATE(dayId, exerciseId),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }

  async deleteExercise(dayId: string, exerciseId: string): Promise<void> {
    await this.request(API_ENDPOINTS.EXERCISES.DELETE(dayId, exerciseId), {
      method: 'DELETE',
    });
  }

  // Workout Sessions
  async startWorkoutSession(data: StartWorkoutSessionRequest): Promise<WorkoutSession> {
    return this.request<WorkoutSession>(API_ENDPOINTS.WORKOUT_SESSIONS.START, {
      method: 'POST',
      body: JSON.stringify({
        workoutPlanId: data.workoutPlanId,
        trainingDayId: data.trainingDayId,
        weekNumber: data.weekNumber,
        isCompleted: false,
        notes: null,
      }),
    });
  }

  async completeWorkoutSession(
    sessionId: string,
    data: CompleteWorkoutSessionRequest,
  ): Promise<WorkoutSession> {
    return this.request<WorkoutSession>(
      API_ENDPOINTS.WORKOUT_SESSIONS.COMPLETE(sessionId),
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async getWorkoutSessionHistory(workoutPlanId?: string): Promise<WorkoutSession[]> {
    const qs = workoutPlanId ? `?workoutPlanId=${encodeURIComponent(workoutPlanId)}` : '';
    return this.request<WorkoutSession[]>(`${API_ENDPOINTS.WORKOUT_SESSIONS.HISTORY}${qs}`, {
      method: 'GET',
    });
  }

  async getSuggestedWeights(params: {
    workoutPlanId: string;
    trainingDayId: string;
    weekNumber: number;
  }): Promise<ExerciseWeightSuggestion[]> {
    const qs = `?workoutPlanId=${encodeURIComponent(params.workoutPlanId)}` +
      `&trainingDayId=${encodeURIComponent(params.trainingDayId)}` +
      `&weekNumber=${encodeURIComponent(String(params.weekNumber))}`;
    return this.request<ExerciseWeightSuggestion[]>(
      `${API_ENDPOINTS.WORKOUT_SESSIONS.SUGGEST_WEIGHTS}${qs}`,
      { method: 'GET' },
    );
  }
}

export const apiClient = new ApiClient();

// Workout Plan types
export type WorkoutPlan = {
  id: string;
  name: string;
  description?: string;
  weekDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trainingDaysCount: number;
  workoutSessionsCount: number;
};

export type CreateWorkoutPlanRequest = {
  name: string;
  description?: string;
  weekDuration: number;
  isActive: boolean;
};

export type UpdateWorkoutPlanRequest = {
  name: string;
  description?: string;
  weekDuration: number;
  isActive: boolean;
};

export type TrainingDay = {
  id: string;
  workoutPlanId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  exercises: Exercise[];
};

export type CreateTrainingDayRequest = {
  name: string;
  description?: string;
};

export type UpdateTrainingDayRequest = {
  name: string;
  description?: string;
};

export type Exercise = {
  id: string;
  trainingDayId: string;
  orderNumber: string;
  name: string;
  sets: number;
  reps: number;
  tempo: string;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateExerciseRequest = {
  name: string;
  sets: number;
  reps: number;
  tempo?: string;
  restSeconds: number;
  notes?: string;
  orderNumber: number;
};

export type UpdateExerciseRequest = {
  name: string;
  sets: number;
  reps: number;
  tempo?: string;
  restSeconds: number;
  notes?: string;
  orderNumber: number;
};
