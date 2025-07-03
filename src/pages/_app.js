import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-white text-black">
          <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="NocaFLOW - Système d'exploitation client tout-en-un." />
            <title>NocaFLOW</title>
          </Head>

          <Navbar />

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <Component {...pageProps} />
          </main>

          <Footer />
        </div>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default appWithTranslation(MyApp, i18nextConfig);
