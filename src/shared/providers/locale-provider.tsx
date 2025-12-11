'use client';

import { useEffect } from 'react';
import { useLocaleStore } from '@/shared/stores/locale-store';

interface LocaleProviderProps {
  locale: LocaleType;
  children: React.ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    setLocale(locale);
  }, [locale, setLocale]);

  return <>{children}</>;
}
