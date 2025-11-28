import { AuthProvider } from './AuthProvider';

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>{children}</AuthProvider>
  );
}

export default AppProvider;
