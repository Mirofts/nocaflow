// next-i18next.config.js
const path = require('path'); // Importation de 'path'

module.exports = {
  i18n: {
    defaultLocale: 'fr', // Doit correspondre au defaultLocale de next.config.mjs pour éviter des comportements inattendus
    locales: ['en', 'fr'], // Toutes les locales supportées
    // Si localeDetection est géré dans next.config.mjs via le routing de Next.js,
    // ou si vous voulez un contrôle strictement manuel (via le sélecteur de langue),
    // il est préférable de le désactiver ici pour éviter les conflits.
    localeDetection: false, 
  },
  // TRÈS IMPORTANT : Vous devez spécifier où se trouvent vos fichiers de traduction.
  // Le chemin doit être absolu, basé sur la racine de votre projet.
  localePath: path.resolve('./public/locales'), // FIX: Ajout de localePath
  
  // Utile en développement pour que les changements de traduction soient pris en compte immédiatement.
  reloadOnPrerender: process.env.NODE_ENV === 'development', // FIX: Décommenté et activé pour le dev

  // Si vous aviez un backend spécifique pour les traductions (ex: CMS), vous le configureriez ici.
  // Pour les fichiers JSON locaux, `localePath` suffit.
  // backend: {
  //   loadPath: './public/locales/{{lng}}/{{ns}}.json',
  // },
};