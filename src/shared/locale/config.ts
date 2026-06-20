import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ja from './locales/ja.json';
import ko from './locales/ko.json';

export const resources = { ko, ja } as const;

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    ja: { translation: ja },
  },
  lng: 'ko',
  fallbackLng: 'ko',
  supportedLngs: ['ko', 'ja'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
