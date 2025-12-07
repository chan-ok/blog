import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface LocaleState {
  locale: LocaleType;
}

interface LocaleActions {
  setLocale: (locale: LocaleType) => void;
}

export const useLocaleStore = create<LocaleState & LocaleActions>()(
  devtools(
    persist(
      (set) => ({
        locale: 'ko',
        setLocale: (locale) => set({ locale }),
      }),
      {
        name: 'locale-storage',
      }
    ),
    {
      name: 'LocaleStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
