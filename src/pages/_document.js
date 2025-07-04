// src/pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    // 'lang="fr"' devrait être dynamique via next-i18next/serverSideTranslations pour la langue de la page
    // Mais pour _document.js, c'est généralement fixe ou déterminé à la construction.
    // L'erreur de preconnect croisé est souvent liée à des attributs 'crossOrigin' multiples ou conflictuels.
    <Html lang="fr" className="scroll-smooth">
      <Head>
        {/* Assurez-vous d'un seul preconnect pour chaque URL, et un seul crossOrigin si nécessaire */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* crossOrigin="anonymous" est le plus courant et généralement suffisant */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Retirez le second preconnect à fonts.gstatic.com pour éviter les doublons qui peuvent causer des avertissements */}
        {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/> */}
        
        {/* Le lien de la police est correct */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      {/* Les classes sur body sont pour Tailwind et sont gérées par _app.js et globals.css */}
      <body className="bg-color-bg-primary text-color-text-primary antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}