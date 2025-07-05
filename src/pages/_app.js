// src/pages/_app.js
import '../i18next';
import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import LoadingIndicator from '../src/components/LoadingIndicator'; // <-- Import it here

// IMPORTS DES COMPOSANTS DE LAYOUT
import Navbar from '../components/Navbar'; // La Navbar globale
import Footer from '../components/Footer';

// IMPORTS DES MODALES (globales)
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

function MyApp({ Component, pageProps }) {
  const { t } = useTranslation('common');
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
  const isDashboardPage = router.pathname === '/dashboard'; // Détection de la page Dashboard

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

          {/* Navbar est toujours présente sur toutes les pages */}
          <Navbar
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onOpenCalculator={handleOpenCalculator}
            isDashboardPage={isDashboardPage} // Passe l'info à la Navbar si elle en a besoin
          />

          {/* <main> conditionnel pour les paddings */}
          {/* Dashboard et Home n'ont pas de padding ici, ils gèrent le leur. Autres pages oui. */}
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

        {/* Modales gérées globalement */}
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

export default appWithTranslation(MyApp, i18nextConfig);