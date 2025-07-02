import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // facultatif
import '../i18n'; // initialise i18next manuellement si nécessaire

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <main>
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </main>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default appWithTranslation(MyApp);
