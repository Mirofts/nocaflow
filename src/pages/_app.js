import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({ Component, pageProps }) { // pageProps est reçu ici
  console.log("MyApp simple test rendering"); // Debug log
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <main>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

// MODIFICATION CRUCIALE : Passez pageProps à appWithTranslation
// C'est ainsi que next-i18next reçoit les traductions de getStaticProps/getServerSideProps
export default appWithTranslation(MyApp, { pageProps }); // <-- MODIFIEZ CETTE LIGNE