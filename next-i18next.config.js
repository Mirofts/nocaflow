/** @type {import('next-i18next').UserConfig} */
const i18nConfig = {
  i18n: {
    defaultLocale: 'fr',        // langue par défaut
    locales: ['en', 'fr'],      // langues supportées
  },
  localePath: './public/locales', // obligatoire pour charger les fichiers depuis /public
  reloadOnPrerender: process.env.NODE_ENV === 'development', // utile pour le dev
};

module.exports = i18nConfig;
