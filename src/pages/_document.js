// src/pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    // Appliquer suppressHydrationWarning sur la balise <html> ou <body>
    // C'est un dernier recours pour les problèmes de className mismatch persistants liés au thème.
    // L'attribut 'lang' doit rester sur <html> et peut être dynamique via next-i18next/serverSideTranslations
    <Html lang="fr"> {/* 'lang' devrait être géré par Next.js/i18n, mais suppressHydrationWarning peut être mis ici aussi si nécessaire. */}
      <Head>
        {/* Assurez-vous d'un seul preconnect pour chaque URL, et un seul crossOrigin si nécessaire */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Le lien de la police est correct */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      {/* Les classes sur body sont pour Tailwind et sont gérées par _app.js et globals.css */}
      {/* C'est ici que le suppressHydrationWarning doit être ajouté pour le className mismatch persistant. */}
      <body className="bg-color-bg-primary text-color-text-primary antialiased" suppressHydrationWarning> {/* <-- AJOUTÉ ICI */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}