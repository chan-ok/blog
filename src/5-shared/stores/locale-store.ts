import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LocaleState {
  locale: LocaleType;
}

interface LocaleActions {
  setLocale: (locale: LocaleType) => void;
}

export const useLocaleStore = create<LocaleState & LocaleActions>()(
  devtools(
    (set) => ({
      locale: 'ko',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'LocaleStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
