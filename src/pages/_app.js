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
  // Utilisez router.pathname pour une détection fiable côté client
  const isHomePage = router.pathname === '/';

  return (
    <AuthContextProvider>
      <ThemeProvider>
        {/* Le conteneur principal de l'application.
            Ajout de `overflow-x-hidden` pour éviter les barres de défilement horizontales.
            `!p-0 !m-0 !max-w-none` pour annuler tout padding/margin/max-width global sur le wrapper.
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

// Retiré getInitialProps car router.pathname est directement disponible avec useRouter dans le composant
// et pageProps.router n'est plus nécessaire pour cette logique.
// La détection de `isHomePage` est maintenant purement côté client avec `useRouter`.


export default appWithTranslation(MyApp, i18nextConfig);