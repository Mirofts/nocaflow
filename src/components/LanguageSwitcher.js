'use client';

import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    const { pathname, asPath, query } = router;
    i18n.changeLanguage(lng); // Change i18n langage
    router.push({ pathname, query }, asPath, { locale: lng }); // Change locale dans l'URL
  };

  return (
    <div className="flex gap-2 p-2">
      <button onClick={() => changeLanguage('en')} className="px-3 py-1 bg-blue-500 text-white rounded">
        English
      </button>
      <button onClick={() => changeLanguage('fr')} className="px-3 py-1 bg-red-500 text-white rounded">
        Français
      </button>
    </div>
  );
}
