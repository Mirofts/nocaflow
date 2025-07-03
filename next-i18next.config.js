// next-i18next.config.js

const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  localePath: path.resolve('./public/locales'), // Chemin explicite
  fallbackLng: 'fr', // Valeur par défaut si une traduction manque
  ns: ['common'], // noms des namespaces à charger par défaut
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // utile avec React
  },
};
