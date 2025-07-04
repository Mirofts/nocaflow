// src/pages/_app.js

import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

// IMPORTS DES COMPOSANTS DE LAYOUT
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// IMPORTEZ VOS VRAIS COMPOSANTS DE MODALES ICI
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/components/RegisterModal'; // Chemin corrigé si RegisterModal est dans components/components

function MyApp({ Component, pageProps }) {
  const { t } = useTranslation('common');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  return (
    // Les Context Providers doivent englober toute l'application pour être disponibles en SSR.
    // L'ordre est important: AuthContext peut dépendre de ThemeContext, ou l'inverse, mais ils doivent être au-dessus des composants qui les utilisent.
    <AuthContextProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-color-bg-primary text-color-text-primary">
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
          />

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pt-16">
            {/* Composant principal de la page, reçoit toutes les props */}
            <Component
              {...pageProps}
              onLoginClick={handleLoginClick}
              onRegisterClick={handleRegisterClick}
              t={t} // Passe la fonction de traduction 't' à toutes les pages/composants
            />
          </main>

          <Footer />
        </div>

        {/* AnimatePresence pour les animations d'entrée/sortie des modales */}
        <AnimatePresence>
            {showLoginModal && (
                <LoginModal
                    onClose={closeLoginModal}
                    onSwitchToRegister={switchToRegisterFromLogin}
                    t={t} // Passe la fonction de traduction
                />
            )}
            {showRegisterModal && (
                <RegisterModal
                    onClose={closeRegisterModal}
                    onSwitchToLogin={switchToLoginFromRegister}
                    t={t} // Passe la fonction de traduction
                />
            )}
        </AnimatePresence>

      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default appWithTranslation(MyApp, i18nextConfig);