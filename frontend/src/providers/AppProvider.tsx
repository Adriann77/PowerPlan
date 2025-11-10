import React from 'react';

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return <>{children}</>;
}

export default AppProvider;
