// src/pages/_app.js

import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next'; // Assurez-vous que c'est bien 'next-i18next'
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config'; // Le chemin vers votre config i18n
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'next-i18next'; // Assurez-vous que c'est bien 'next-i18next'
import { useRouter } from 'next/router';

// IMPORTS DES COMPOSANTS DE LAYOUT
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// IMPORTEZ VOS VRAIS COMPOSANTS DE MODALES ICI
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

function MyApp({ Component, pageProps }) {
  const { t } = useTranslation('common'); // Utilisation correcte du namespace 'common'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const router = useRouter();

  const handleLoginClick = () => setShowLoginModal(true);
  const handleRegisterClick = () => setShowRegisterModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const closeRegisterModal = () => setShowRegisterModal(false);

  const switchToRegisterFromLogin = () => {
    closeLoginModal();
    setShowRegisterModal(true);
  };

  const switchToLoginFromRegister = () => {
    closeRegisterModal();
    setShowLoginModal(true);
  };

  const handleOpenCalculator = () => {
    console.log("Ouvrir la calculatrice");
  };

  const isHomePage = router.pathname === '/';
  const isDashboardPage = router.pathname === '/dashboard';

  return (
    <AuthContextProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-color-bg-primary text-color-text-primary !p-0 !m-0 !max-w-none overflow-x-hidden">
          <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="NocaFLOW - Système d'exploitation client tout-en-un." />
            <title>NocaFLOW</title>
          </Head>

          <Navbar
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onOpenCalculator={handleOpenCalculator}
            isDashboardPage={isDashboardPage}
          />

          <main className={`flex-1 ${isHomePage || isDashboardPage ? '' : 'px-4 py-8 sm:px-6 lg:px-8'} pt-16`}>
            <Component
              {...pageProps}
              onLoginClick={handleLoginClick}
              onRegisterClick={handleRegisterClick}
              t={t}
            />
          </main>

          <Footer />
        </div>

        <AnimatePresence>
            {showLoginModal && (
                <LoginModal
                    onClose={closeLoginModal}
                    onSwitchToRegister={switchToRegisterFromLogin}
                    t={t}
                />
            )}
            {showRegisterModal && (
                <RegisterModal
                    onClose={closeRegisterModal}
                    onSwitchToLogin={switchToLoginFromRegister}
                    t={t}
                />
            )}
        </AnimatePresence>

      </ThemeProvider>
    </AuthContextProvider>
  );
}

// appWithTranslation doit envelopper l'export par défaut de votre composant MyApp
// Il prend le composant et la configuration i18next
export default appWithTranslation(MyApp, i18nextConfig);