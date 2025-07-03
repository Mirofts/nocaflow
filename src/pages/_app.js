// src/pages/_app.js

import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config'; // Chemin vers next-i18next.config.js
import { useTranslation } from 'react-i18next'; // Importez useTranslation ici aussi
import { AnimatePresence } from 'framer-motion'; // Importez AnimatePresence pour les transitions des modales

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState } from 'react';

// *** IMPORTEZ VOS VRAIS COMPOSANTS DE MODALES ICI ***
// Assurez-vous que les chemins sont corrects par rapport à votre structure de dossiers
import LoginModal from '../components/LoginModal';    // Ajustez le chemin si nécessaire, ex: './components/auth/LoginModal'
import RegisterModal from '../components/RegisterModal'; // Ajustez le chemin si nécessaire, ex: './components/auth/RegisterModal'


function MyApp({ Component, pageProps }) {
  const { t } = useTranslation('common'); // Pour passer la fonction de traduction aux modales
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginClick = () => setShowLoginModal(true);
  const handleRegisterClick = () => setShowRegisterModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const closeRegisterModal = () => setShowRegisterModal(false);

  // Fonctions pour basculer entre les modales si l'utilisateur clique sur "S'inscrire" depuis la modale de connexion
  const switchToRegisterFromLogin = () => {
    closeLoginModal();
    handleRegisterClick();
  };

  // Fonctions pour basculer entre les modales si l'utilisateur clique sur "Se connecter" depuis la modale d'inscription
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

          <Navbar
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            onOpenCalculator={handleOpenCalculator}
          />

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pt-16">
            <Component
              {...pageProps}
              // Passe les fonctions de gestion des modales aux pages (comme index.js) si elles en ont besoin
              onLoginClick={handleLoginClick}
              onRegisterClick={handleRegisterClick}
            />
          </main>

          <Footer />
        </div>

        {/* *** UTILISEZ VOS VRAIS COMPOSANTS DE MODALES ICI AVEC AnimatePresence *** */}
        <AnimatePresence>
            {showLoginModal && (
                <LoginModal
                    t={t} // Passe la fonction de traduction
                    onClose={closeLoginModal}
                    onSwitchToRegister={switchToRegisterFromLogin}
                    // Si votre LoginModal prend d'autres props (ex: `setError`, `setLoading`), ajoutez-les ici
                />
            )}
            {showRegisterModal && (
                <RegisterModal
                    t={t} // Passe la fonction de traduction
                    onClose={closeRegisterModal}
                    onSwitchToLogin={switchToLoginFromRegister}
                    // Si votre RegisterModal prend d'autres props, ajoutez-les ici
                />
            )}
        </AnimatePresence>

      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default appWithTranslation(MyApp, i18nextConfig);