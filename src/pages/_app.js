import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config';


import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Facultatif, tu peux le retirer si tu n’en veux pas

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-white text-black">
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
