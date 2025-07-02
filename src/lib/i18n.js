import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common_en from '../../public/locales/en/common.json';
import common_fr from '../../public/locales/fr/common.json';

i18n
  .use(initReactI18next) // Passe l'instance i18n à react-i18next
  .init({
    resources: {
      en: {
        common: common_en // 'common' est le namespace (nom de votre fichier de traduction sans .json)
      },
      fr: {
        common: common_fr
      }
    },
    lng: 'en', // Langue par défaut si aucune n'est détectée
    fallbackLng: 'en', // Langue de secours si une traduction manque
    debug: false, // Mettez à 'true' en développement pour voir les logs d'i18next
    interpolation: {
      escapeValue: false, // React protège déjà des XSS
    },
    ns: ['common'], // Déclare les namespaces (ici, 'common' car c'est votre fichier)
    defaultNS: 'common', // Namespace par défaut
  });

export default i18n;