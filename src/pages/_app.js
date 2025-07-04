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
import { useRouter } from 'next/router'; // Import useRouter here

// IMPORTS DES COMPOSANTS DE LAYOUT
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// IMPORTEZ VOS VRAIS COMPOSANTS DE MODALES ICI
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

function MyApp({ Component, pageProps }) {
  const { t } = useTranslation('common');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const router = useRouter(); // Initialize useRouter here

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

  // Déterminez si la page actuelle est la page d'accueil pour ajuster le layout
  const isHomePage = router.pathname === '/';

  return (
    <AuthContextProvider>
      <ThemeProvider>
        {/* Le conteneur principal de l'application.
            Assure qu'il n'y a pas de padding/margin global pour permettre le full-bleed.
        */}
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
          />

          {/* Conditionnement de la classe `main` pour la page d'accueil */}
          {/* Si c'est la page d'accueil, pas de padding horizontal pour laisser la vidéo en full-bleed */}
          {/* Sinon, appliquer les padding normaux pour le contenu des autres pages */}
          <main className={`flex-1 ${isHomePage ? '' : 'px-4 py-8 sm:px-6 lg:px-8'} pt-16`}>
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

// Pas besoin de getInitialProps ici, useRouter gère déjà le pathname côté client.
export default appWithTranslation(MyApp, i18nextConfig);