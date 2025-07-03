// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'fr', // Doit correspondre au defaultLocale de next.config.mjs pour éviter des comportements inattendus
    locales: ['en', 'fr'],
    // localeDetection: true, // Cette ligne est redondante ici car déjà dans next.config.mjs
                              // et gérée par next-i18next via le routing de Next.js
  },
  // Vous pouvez ajouter d'autres options i18next ici si nécessaire, par exemple:
  // reloadOnPrerender: process.env.NODE_ENV === 'development',
  // backend: {
  //   loadPath: './public/locales/{{lng}}/{{ns}}.json',
  // },
};