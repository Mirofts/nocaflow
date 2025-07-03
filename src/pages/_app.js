// src/pages/_app.js

import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// *** IMPORTS DES COMPOSANTS DE LAYOUT ***
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// *** IMPORTEZ VOS VRAIS COMPOSANTS DE MODALES ICI ***
// Assurez-vous que les chemins sont corrects par rapport à votre structure de dossiers
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';


function MyApp({ Component, pageProps }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginClick = () => setShowLoginModal(true);
  const handleRegisterClick = () => setShowRegisterModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const closeRegisterModal = () => setShowRegisterModal(false);

  // Fonctions pour basculer entre les modales
  const switchToRegisterFromLogin = () => {
    closeLoginModal();
    handleRegisterClick();
  };

  const switchToLoginFromRegister = () => {
    closeRegisterModal();
    handleLoginClick();
  };

  const handleOpenCalculator = () => {
    console.log("Ouvrir la calculatrice");
    // Implémentez la logique pour ouvrir votre calculatrice ici
  };

  return (
    <AuthContextProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-color-bg-primary text-color-text-primary">
          <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="NocaFLOW - Système d'exploitation client tout-en-un." />
            <title>NocaFLOW</title>
          </Head>

          {/* *** NAVBAR EST MAINTENANT RENDUE ICI *** */}
          <Navbar
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onOpenCalculator={handleOpenCalculator}
          />

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pt-16">
            <Component
              {...pageProps}
              onLoginClick={handleLoginClick}
              onRegisterClick={handleRegisterClick}
            />
          </main>

          {/* *** FOOTER EST MAINTENANT RENDU ICI *** */}
          <Footer />
        </div>

        <AnimatePresence>
            {showLoginModal && (
                <LoginModal
                    onClose={closeLoginModal}
                    onSwitchToRegister={switchToRegisterFromLogin}
                />
            )}
            {showRegisterModal && (
                <RegisterModal
                    onClose={closeRegisterModal}
                    onSwitchToLogin={switchToLoginFromRegister}
                />
            )}
        </AnimatePresence>

      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default appWithTranslation(MyApp, i18nextConfig);