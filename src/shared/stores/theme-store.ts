import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  toggle: (theme: Theme) => void;
  setTheme: (theme: Theme) => void;
}

const nextState: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

export const useThemeStore = create<ThemeState & ThemeActions>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        toggle: (theme) => set({ theme: nextState[theme] }),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'theme-storage',
      }
    ),
    {
      name: 'ThemeStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
