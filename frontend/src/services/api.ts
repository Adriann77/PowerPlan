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

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
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
      // Token is invalid or expired
      await this.removeToken();
      return false;
    }
  }
}

export const apiClient = new ApiClient();
