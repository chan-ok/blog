import { createInstance, type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import ja from './locales/ja.json';
import ko from './locales/ko.json';
import { TranslationResourceSchema } from './schema';

export const resources = {
  ko: TranslationResourceSchema.parse(ko),
  ja: TranslationResourceSchema.parse(ja),
} as const;

const i18next: i18n = createInstance();

i18next.use(initReactI18next).init({
  resources: {
    ko: { translation: resources.ko },
    ja: { translation: resources.ja },
  },
  lng: 'ko',
  fallbackLng: 'ko',
  supportedLngs: ['ko', 'ja'],
  interpolation: {
    escapeValue: false,
  },
});

export { i18next };
