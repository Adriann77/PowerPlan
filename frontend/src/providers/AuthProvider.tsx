import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AuthCredentials = {
  username: string;
  password: string;
};

type AuthUser = {
  username: string;
};

type AuthResult = { success: true } | { success: false; message: string };

type AuthContextValue = {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  register: (username: string, password: string) => Promise<AuthResult>;
  listUsers: () => AuthUser[];
};

const initialUsers: AuthCredentials[] = [
  { username: 'test', password: 'test' },
  { username: 'test1', password: 'test1' },
];

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => ({
    success: false,
    message: 'Auth provider not initialised',
  }),
  logout: () => undefined,
  register: async () => ({
    success: false,
    message: 'Auth provider not initialised',
  }),
  listUsers: () => [],
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [users, setUsers] = useState<AuthCredentials[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const login = useCallback(
    async (username: string, password: string) => {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      if (!trimmedUsername || !trimmedPassword) {
        return {
          success: false,
          message: 'Please enter both username and password.',
        } as const;
      }

      const matchedUser = users.find(
        (user) =>
          user.username.toLowerCase() === trimmedUsername.toLowerCase() &&
          user.password === trimmedPassword,
      );

      if (!matchedUser) {
        return {
          success: false,
          message: 'Invalid username or password.',
        } as const;
      }

      setCurrentUser({ username: matchedUser.username });
      return { success: true } as const;
    },
    [users],
  );

  const register = useCallback(
    async (username: string, password: string) => {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      if (!trimmedUsername || !trimmedPassword) {
        return {
          success: false,
          message: 'Please choose both username and password.',
        } as const;
      }

      const exists = users.some(
        (user) => user.username.toLowerCase() === trimmedUsername.toLowerCase(),
      );

      if (exists) {
        return {
          success: false,
          message: 'That username is already taken.',
        } as const;
      }

      setUsers((prev) => [
        ...prev,
        { username: trimmedUsername, password: trimmedPassword },
      ]);
      setCurrentUser({ username: trimmedUsername });

      return { success: true } as const;
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
      register,
      listUsers: () => users.map(({ username }) => ({ username })),
    }),
    [currentUser, login, logout, register, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
