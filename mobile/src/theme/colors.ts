export const colors = {
  primary: {
    50: '#e8edf4',
    100: '#c5d0e3',
    500: '#1e3a5f',
    600: '#1a3354',
    700: '#152a45',
    800: '#102137',
    900: '#0b1829',
  },
  secondary: {
    50: '#fff8e1',
    100: '#ffecb3',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  accent: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    50: '#eef2ff',
    100: '#e0e7ff',
    500: '#6366f1',
    600: '#4f46e5',
  },
  light: {
    bg: '#f9fafb',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
  },
};

export type PastelThemeId = 'rose' | 'ocean' | 'mint' | 'lavender' | 'peach';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  navBg: string;
}

export const pastelThemes: Record<PastelThemeId, ThemeColors> = {
  rose: {
    bg: '#fef2f5',
    surface: '#ffffff',
    surfaceAlt: '#fce4ec',
    text: '#4a1c2b',
    textSecondary: '#9e5068',
    border: '#f8bbd0',
    navBg: '#880e4f',
  },
  ocean: {
    bg: '#eef6fb',
    surface: '#ffffff',
    surfaceAlt: '#dceef8',
    text: '#1a3650',
    textSecondary: '#5a7d9a',
    border: '#b8d8ec',
    navBg: '#1e3a5f',
  },
  mint: {
    bg: '#f0faf4',
    surface: '#ffffff',
    surfaceAlt: '#d4f0de',
    text: '#1a3a27',
    textSecondary: '#5a8a6e',
    border: '#a8e6c3',
    navBg: '#1b5e20',
  },
  lavender: {
    bg: '#f5f0fa',
    surface: '#ffffff',
    surfaceAlt: '#e8ddf2',
    text: '#2d1b4e',
    textSecondary: '#7a5ea0',
    border: '#d1b3e8',
    navBg: '#4a148c',
  },
  peach: {
    bg: '#fef8f0',
    surface: '#ffffff',
    surfaceAlt: '#ffe8cc',
    text: '#3d2a12',
    textSecondary: '#9a7550',
    border: '#ffd09e',
    navBg: '#bf360c',
  },
};

export const darkTheme: ThemeColors = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceAlt: '#273548',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  navBg: '#0f172a',
};
