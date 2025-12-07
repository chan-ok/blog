import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        setTheme: (theme) => {
          set({ theme });
        },
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
