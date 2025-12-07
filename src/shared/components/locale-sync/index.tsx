'use client';

import { useLocaleStore } from '@/shared/stores/locale-store';
import { setCookie } from 'cookies-next/client';
import { useEffect } from 'react';

interface Props {
  locale: LocaleType;
}

export function LocaleSync({ locale }: Props) {
  const { setLocale } = useLocaleStore();

  useEffect(() => {
    // 1. Sync store with current locale from URL/Server
    setLocale(locale);
    // 2. Sync cookie for future server requests
    setCookie('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
  }, [locale, setLocale]);

  return null;
}
