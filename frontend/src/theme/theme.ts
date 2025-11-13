import type { TextStyle } from 'react-native';

export const palette = {
  background: '#05010d',
  surface: '#151312',
  surfaceMuted: '#1f1c29',
  surfaceElevated: '#2a2534',
  primary: '#AB8BFF',
  secondary: '#5C4B99',
  success: '#3DD68C',
  warning: '#F5C453',
  danger: '#F0766B',
  text: {
    primary: '#F3F4F6',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    inverse: '#111827',
  },
  border: '#27233A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
  full: 9999,
};

export const typography: {
  fontFamily: string;
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  button: TextStyle;
} = {
  fontFamily: 'System',
  heading1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  heading2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  heading3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
};

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export type Theme = {
  palette: typeof palette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
};

export const theme: Theme = {
  palette,
  spacing,
  radii,
  typography,
  shadows,
};
