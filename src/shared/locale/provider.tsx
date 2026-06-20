import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import type { i18n } from 'i18next';

import { i18next } from './config';
import { useLocaleStore } from './store';
import { LocaleType } from './types';

interface LocaleProviderProps {
  locale: LocaleType;
  children: React.ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    setLocale(locale);
    i18next.changeLanguage(locale);
  }, [locale, setLocale]);

  return <I18nextProvider i18n={i18next as unknown as i18n}>{children}</I18nextProvider>;
}
