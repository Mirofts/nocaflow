// src/lib/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common_en from '../../public/locales/en/common.json';
import common_fr from '../../public/locales/fr/common.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        common: common_en // 'common' est le namespace
      },
      fr: {
        common: common_fr
      }
    },
    lng: 'en', // default language
    fallbackLng: 'en', // language to use if translations in user language are not available
    debug: false, // Set to true for debugging in development
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    ns: ['common'], // Declare namespaces, 'common' is used by default if not specified
    defaultNS: 'common',
  });

export default i18n;