import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '../services/api';

type AuthUser = {
  id: string;
  username: string;
};

type AuthResult = { success: true } | { success: false; message: string };

type AuthContextValue = {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (username: string, password: string) => Promise<AuthResult>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({
    success: false,
    message: 'Auth provider not initialised',
  }),
  logout: async () => undefined,
  register: async () => ({
    success: false,
    message: 'Auth provider not initialised',
  }),
  checkAuth: async () => undefined,
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  const checkAuth = useCallback(async () => {
    try {
      const isAuthenticated = await apiClient.checkAuth();
      if (isAuthenticated) {
        const userData = await apiClient.getCurrentUser();
        setCurrentUser({
          id: userData.userId,
          username: userData.username,
        });
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username: string, password: string) => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return {
        success: false,
        message: 'Please enter both username and password.',
      } as const;
    }

    try {
      const response = await apiClient.login(trimmedUsername, trimmedPassword);
      setCurrentUser({
        id: response.user.id,
        username: response.user.username,
      });
      return { success: true } as const;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Login failed. Please try again.',
      } as const;
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return {
        success: false,
        message: 'Please choose both username and password.',
      } as const;
    }

    try {
      const response = await apiClient.register(
        trimmedUsername,
        trimmedPassword,
      );
      setCurrentUser({
        id: response.user.id,
        username: response.user.username,
      });
      return { success: true } as const;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Registration failed. Please try again.',
      } as const;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isLoading,
      login,
      logout,
      register,
      checkAuth,
    }),
    [currentUser, isLoading, login, logout, register, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
