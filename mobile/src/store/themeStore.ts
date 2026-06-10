import { create } from 'zustand';
import { pastelThemes, darkTheme, type PastelThemeId, type ThemeColors } from '../theme/colors';

export type ThemeMode = PastelThemeId | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  theme: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'ocean',
  isDark: false,
  theme: pastelThemes.ocean,
  setTheme: (mode: ThemeMode) => {
    const theme = mode === 'dark' ? darkTheme : pastelThemes[mode];
    set({ mode, isDark: mode === 'dark', theme });
  },
  toggle: () => {
    const current = get().mode;
    const next: ThemeMode = current === 'dark' ? 'ocean' : 'dark';
    get().setTheme(next);
  },
}));
