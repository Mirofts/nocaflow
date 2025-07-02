'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/common.json';
import translationFR from '../locales/fr/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
    },
    fallbackLng: 'fr',
    lng: 'fr', // or detect via cookies, headers, etc.

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
