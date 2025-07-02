import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next'; // <-- Importez ceci

// REMARQUE : NE PAS IMPORTER '../lib/i18n'; ici si vous l'avez supprimé ou vidé.

function MyApp({ Component, pageProps }) {
  console.log("MyApp simple test rendering"); // Debug log
  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
}

// Exportez l'application enveloppée avec appWithTranslation
export default appWithTranslation(MyApp); // <-- MODIFIEZ CETTE LIGNE