// src/lib/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18nConfig from '../../next-i18next.config'; // Importez la configuration i18n

i18n
  .use(HttpBackend) // Charge les fichiers de traduction via HTTP (depuis /public/locales)
  .use(LanguageDetector) // Détecte la langue du navigateur
  .use(initReactI18next) // Lie i18next à React
  .init({
    fallbackLng: i18nConfig.i18n.defaultLocale, // Langue par défaut si celle du navigateur n'est pas supportée
    supportedLngs: i18nConfig.i18n.locales, // Langues supportées
    debug: process.env.NODE_ENV === 'development', // Active le debug en dev
    interpolation: {
      escapeValue: false, // React échappe déjà les XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/common.json', // Chemin vers vos fichiers JSON de traduction
    },
    ns: ['common'], // Nom de l'espace de noms par défaut
    defaultNS: 'common',
  });

export default i18n;