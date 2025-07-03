// src/pages/_app.js

import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; 

// *** IMPORTEZ VOS VRAIS COMPOSANTS DE MODALES ICI ***
// Assurez-vous que les chemins sont corrects par rapport à votre structure de dossiers
// Si elles sont dans le dossier 'components', le chemin est '../components/NomDuFichier'
// Si elles sont dans 'components/auth', le chemin est '../components/auth/NomDuFichier'
import LoginModal from '../components/LoginModal';     // Par exemple: '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'; // Par exemple: '../components/RegisterModal'


function MyApp({ Component, pageProps }) {
  // Pas besoin de useTranslation ici si seules les modales l'utilisent, car elles l'importeront elles-mêmes
  // const { t } = useTranslation('common');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginClick = () => setShowLoginModal(true);
  const handleRegisterClick = () => setShowRegisterModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const closeRegisterModal = () => setShowRegisterModal(false);

  // Fonctions pour basculer entre les modales
  const switchToRegisterFromLogin = () => {
    closeLoginModal(); // Ferme la modale de connexion
    handleRegisterClick(); // Ouvre la modale d'inscription
  };

  const switchToLoginFromRegister = () => {
    closeRegisterModal(); // Ferme la modale d'inscription
    handleLoginClick(); // Ouvre la modale de connexion
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

        {/* *** VOS VRAIS COMPOSANTS DE MODALES SONT RENDUS ICI AVEC AnimatePresence *** */}
        <AnimatePresence>
            {showLoginModal && (
                <LoginModal
                    onClose={closeLoginModal}
                    onSwitchToRegister={switchToRegisterFromLogin}
                    // Si votre LoginModal prend d'autres props, ajoutez-les ici
                />
            )}
            {showRegisterModal && (
                <RegisterModal
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