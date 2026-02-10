import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/5-shared/config/i18n';
import { useLocaleStore } from '@/5-shared/stores/locale-store';

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
