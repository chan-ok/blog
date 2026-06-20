import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import type { LocaleType } from '@/shared/types/common.schema';

import i18n from './config';
import { useLocaleStore } from './store';

interface LocaleProviderProps {
  locale: LocaleType;
  children: React.ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    setLocale(locale);
    i18n.changeLanguage(locale);
  }, [locale, setLocale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
