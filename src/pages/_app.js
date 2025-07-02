import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({ Component, pageProps }) {
  console.log("MyApp simple test rendering");
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

export default appWithTranslation(MyApp);
