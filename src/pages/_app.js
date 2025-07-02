import '@/styles/globals.css';
import '@/i18n'; // ✅ IMPORT INDISPENSABLE pour initReactI18next
import { appWithTranslation } from 'next-i18next'; // Importez ceci
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({ Component, pageProps }) { // <-- pageProps est reçu ici, comme d'habitude
  console.log("MyApp simple test rendering"); // Debug log
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <main>
          {/* Component reçoit les pageProps, y compris les traductions de next-i18next */}
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

// CORRECTION CRUCIALE : Le HOC appWithTranslation ne prend qu'un argument (le composant)
// il se configure via next-i18next.config.js et injecte les props dans pageProps.
export default appWithTranslation(MyApp); // <-- REVENIR À CETTE LIGNE, PAS appWithTranslation(MyApp, { pageProps })