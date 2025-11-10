import React, { createContext, useContext, useMemo } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { NativeWindStyleSheet } from 'nativewind';
import { Theme as AppTheme, theme as baseTheme } from './theme';

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: ColorSchemeName;
  navigationTheme: NavigationTheme;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: baseTheme,
  colorScheme: 'dark',
  navigationTheme: DarkTheme,
});

NativeWindStyleSheet.setOutput({
  web: 'web',
  default: 'native',
});

type ThemeProviderProps = {
  children: React.ReactNode;
};

const navigationDarkTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: baseTheme.palette.background,
    card: baseTheme.palette.surface,
    text: baseTheme.palette.text.primary,
    border: baseTheme.palette.border,
    notification: baseTheme.palette.primary,
  },
};

const navigationLightTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
    notification: baseTheme.palette.primary,
  },
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme() ?? 'dark';

  const value = useMemo(
    () => ({
      theme: baseTheme,
      colorScheme,
      navigationTheme: colorScheme === 'dark' ? navigationDarkTheme : navigationLightTheme,
    }),
    [colorScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);


