import { create } from 'zustand';

export type PastelTheme = 'rose' | 'ocean' | 'mint' | 'lavender' | 'peach';
export type ThemeMode = PastelTheme | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
}

const THEME_KEY = 'samba-theme';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  // Remove all theme classes
  root.classList.remove('dark', 'theme-rose', 'theme-ocean', 'theme-mint', 'theme-lavender', 'theme-peach');
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add(`theme-${mode}`);
  }
}

const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null) as ThemeMode | null;
const initial: ThemeMode = stored || 'ocean';

// Apply on load
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initial,
  isDark: initial === 'dark',
  setTheme: (mode: ThemeMode) => {
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
    set({ mode, isDark: mode === 'dark' });
  },
  toggle: () => {
    const current = get().mode;
    const next: ThemeMode = current === 'dark' ? 'ocean' : 'dark';
    get().setTheme(next);
  },
}));
