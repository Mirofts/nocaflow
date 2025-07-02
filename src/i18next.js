import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../public/locales/en/common.json';
import translationFR from '../public/locales/fr/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
    },
    lng: 'fr',
    fallbackLng: 'fr',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
