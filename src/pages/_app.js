// src/pages/_app.js

import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { AuthContextProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import i18nextConfig from '../../next-i18next.config'; // Chemin vers next-i18next.config.js

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState } from 'react'; // Importez useState pour gérer l'état des modales

// REMPLACEZ CES COMPOSANTS FACTICES PAR VOS VRAIS COMPOSANTS DE MODALES
// Exemple: import LoginModal from '../components/auth/LoginModal';
// Exemple: import RegisterModal from '../components/auth/RegisterModal';

// Composant Modal de Connexion factice
const MockLoginModal = ({ onClose, onRegisterClick }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
      <h2 className="text-2xl font-bold mb-4 text-color-text-primary">Connexion</h2>
      <p className="text-color-text-secondary mb-6">Ceci est une modal de connexion factice.</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onRegisterClick}
          className="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition-colors"
        >
          S'inscrire
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
);

// Composant Modal d'Inscription factice
const MockRegisterModal = ({ onClose, onLoginClick }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
      <h2 className="text-2xl font-bold mb-4 text-color-text-primary">Inscription</h2>
      <p className="text-color-text-secondary mb-6">Ceci est une modal d'inscription factice.</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onLoginClick}
          className="px-4 py-2 rounded-md bg-violet-500 text-white hover:bg-violet-600 transition-colors"
        >
          Se connecter
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
);


function MyApp({ Component, pageProps }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginClick = () => setShowLoginModal(true);
  const handleRegisterClick = () => setShowRegisterModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const closeRegisterModal = () => setShowRegisterModal(false);

  // Fonction pour un bouton de calculatrice, si vous en avez un dans votre Navbar
  const handleOpenCalculator = () => {
    // Logique pour ouvrir la calculatrice
    console.log("Ouvrir la calculatrice");
  };


  return (
    <AuthContextProvider>
      <ThemeProvider>
        {/*
          IMPORTANT: Ajout du padding-top (pt-16) au div principal pour décaler le contenu
          sous la navbar fixe de hauteur h-16 (64px).
          Le min-h-screen assure que le conteneur prend au moins toute la hauteur de l'écran.
        */}
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
            onOpenCalculator={handleOpenCalculator} // Passez cette fonction si nécessaire
          />

          {/* Le contenu principal de la page. */}
          {/* Le pt-16 ici est essentiel pour éviter l'overlap avec la navbar fixe. */}
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 pt-16">
            <Component {...pageProps} />
          </main>

          <Footer />
        </div>

        {/* Modales de connexion et d'inscription */}
        {showLoginModal && (
          <MockLoginModal
            onClose={closeLoginModal}
            onRegisterClick={() => { closeLoginModal(); handleRegisterClick(); }}
          />
        )}
        {showRegisterModal && (
          <MockRegisterModal
            onClose={closeRegisterModal}
            onLoginClick={() => { closeRegisterModal(); handleLoginClick(); }}
          />
        )}
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default appWithTranslation(MyApp, i18nextConfig);