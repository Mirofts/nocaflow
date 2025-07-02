import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { AuthContextProvider } from '../context/AuthContext'; // <-- Importez AuthContextProvider
import { ThemeProvider } from '../context/ThemeContext';     // <-- Importez ThemeProvider

function MyApp({ Component, pageProps }) {
  console.log("MyApp simple test rendering"); // Debug log
  return (
    // Enveloppez l'application avec vos Context Providers
    <AuthContextProvider> {/* Fournit le contexte d'authentification à toute l'app */}
      <ThemeProvider> {/* Fournit le contexte de thème à toute l'app */}
        <main>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default appWithTranslation(MyApp);