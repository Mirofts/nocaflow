// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Importe useRouter
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
// IMPORTE useTranslation de next-i18next, PAS TranslationContext
import { useTranslation } from 'next-i18next';

// Composant NavLink pour les liens de navigation avec animation au survol
const NavLink = ({ href, children, t, currentPath }) => {
  // Détermine si le lien est actif. Pour la page d'accueil ('/'), assure une correspondance exacte.
  const isActive = currentPath === href || (href === '/' && currentPath === '/');
  return (
    <Link href={href} className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-pink-400' : 'text-color-text-secondary hover:text-color-text-primary'}`}>
      {children}
      {isActive && (
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

// Composant principal Navbar
export default function Navbar({ onLoginClick, onRegisterClick, onOpenCalculator }) {
  // Utilise useTranslation de next-i18next directement pour les traductions
  const { t } = useTranslation('common');
  // Obtient l'objet router pour la gestion de la locale et du chemin actuel
  const router = useRouter();
  const { locale: currentLocale, push, pathname, asPath, query } = router;

  // États locaux pour la gestion du menu mobile et de l'authentification
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser: user, logout, loadingAuth } = useAuth(); // Renommé currentUser en user pour la cohérence
  const { isDarkMode, toggleTheme } = useTheme();

  const currentPath = pathname; // Utilise pathname du router pour le chemin actuel
  const isGuestMode = user && user.uid === 'guest_noca_flow'; // Vérifie le mode invité

  // URL de l'avatar par défaut si l'utilisateur n'en a pas
  const defaultAvatar = 'https://placehold.co/40x40/ec4899/ffffff?text=NF';
  const avatarUrl = user?.photoURL || defaultAvatar;

  // Liens de navigation principaux
  const mainNavLinks = [
    { href: '/', label: t('about', 'À Propos') },
    { href: '/features', label: t('features', 'Fonctionnalités') },
    { href: '/pricing', label: t('pricing', 'Tarifs') },
  ];

  // Ferme le menu mobile lors du changement de route
  useEffect(() => {
    setIsOpen(false);
  }, [asPath]);

  // Fonction pour changer la locale (langue)
  const setLocale = (newLocale) => {
    push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 ${isDarkMode ? 'bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-md border-b border-slate-700/50' : 'glass-nav border-b border-color-border-primary'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Logo du site avec dégradé animé */}
            <Link href="/" className="flex-shrink-0 text-color-text-primary font-bold text-2xl">
              <span className="text-color-text-primary">Noca</span>
              <span className="animated-gradient-text pink-violet-gradient-text">FLOW</span>
            </Link>
          </div>

          {/* Navigation principale (visible sur les grands écrans) */}
          <div className="hidden md:flex items-center space-x-4">
            {mainNavLinks.map(link => (
                <NavLink key={link.href} href={link.href} t={t} currentPath={currentPath}>{link.label}</NavLink>
            ))}

            {/* Lien vers le Dashboard, visible si l'authentification n'est pas en cours de chargement */}
            {!loadingAuth && (
              <NavLink href="/dashboard" t={t} currentPath={currentPath}>
                {/* Icône du Dashboard */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 text-color-text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                {t('dashboard', 'Dashboard')}
              </NavLink>
            )}

            {/* Sélecteur de langue */}
            <div className="relative">
              <select
                value={currentLocale}
                onChange={(e) => setLocale(e.target.value)}
                className={`block pl-3 pr-8 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500
                            ${isDarkMode
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-color-bg-tertiary border-color-border-primary text-color-text-primary'
                            }`}
                aria-label="Langue"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
              {/* Icône de flèche pour le sélecteur */}
              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isDarkMode ? 'text-white' : 'text-color-text-primary'}`}>
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Bouton de bascule de thème (clair/sombre) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"
              aria-label={isDarkMode ? t('toggle_light_mode', 'Activer le mode clair') : t('toggle_dark_mode', 'Activer le mode sombre')}
              title={isDarkMode ? t('toggle_light_mode', 'Mode Clair') : t('toggle_dark_mode', 'Mode Sombre')}
            >
              {isDarkMode ? (
                // Icône Soleil pour le mode clair
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                // Icône Lune pour le mode sombre
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>

            {/* Boutons de connexion/inscription ou avatar/déconnexion selon l'état de l'utilisateur */}
            {user && !loadingAuth ? (
              <div className="flex items-center space-x-2 ml-4">
                {/* Avatar de l'utilisateur (cliquable pour le dashboard) */}
                <div className="relative group">
                  <Link href="/dashboard" className="flex items-center space-x-2">
                    <motion.img
                      src={avatarUrl}
                      alt={user.displayName || 'User Avatar'}
                      className="w-10 h-10 rounded-full border-2 border-pink-500 cursor-pointer object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                  {/* Tooltip pour le nom de l'utilisateur */}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-color-bg-secondary text-color-text-primary text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {user.displayName || (isGuestMode ? t('guest_user', 'Invité') : t('user_profile', 'Mon profil'))}
                  </span>
                </div>
                {/* Bouton de déconnexion */}
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"
                  aria-label={t('logout', 'Déconnexion')}
                  title={t('logout', 'Déconnexion')}
                >
                  {/* Icône de déconnexion */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/></svg>
                  {t('logout', 'Déconnexion')}
                </button>
              </div>
            ) : (
              // Boutons Connexion/Inscription si non connecté et chargement terminé
              !loadingAuth && !user && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={onLoginClick}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-1"
                  >
                    {/* Icône de connexion */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                    {t('login', 'Connexion')}
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors flex items-center justify-center gap-1"
                  >
                    {/* Icône d'inscription */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    {t('register', 'Inscription')}
                  </button>
                </div>
              )
            )}
          </div>

          {/* Bouton du menu mobile (visible sur les petits écrans) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-color-border-active"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{t('open_main_menu', 'Ouvrir le menu principal')}</span>
              {isOpen ? (
                // Icône de fermeture (X)
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block h-6 w-6" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                // Icône de menu (hamburger)
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block h-6 w-6" aria-hidden="true"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile (affiché/masqué avec Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 glass-card mx-4 rounded-b-2xl p-4 border-t-0"
          >
            <div className="pt-2 pb-3 space-y-1 sm:px-3">
              {/* Liens de navigation du menu mobile */}
              {mainNavLinks.map(link => (
                <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors">
                  {link.label}
                </Link>
              ))}
              {/* Lien Dashboard pour mobile */}
              {!loadingAuth && (
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                    {t('dashboard', 'Dashboard')}
                </Link>
              )}
              {/* Sélecteur de langue pour mobile */}
              <div className="px-3 py-2">
                <select
                  value={currentLocale}
                  onChange={(e) => setLocale(e.target.value)}
                  className={`block w-full pl-3 pr-8 py-2 text-base rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500
                              ${isDarkMode
                                  ? 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-color-bg-tertiary border-color-border-primary text-color-text-primary'
                              }`}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              {/* Bouton de bascule de thème pour mobile */}
              <button
                onClick={toggleTheme}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    )}
                    {isDarkMode ? t('toggle_light_mode', 'Activer le mode clair') : t('toggle_dark_mode', 'Activer le mode sombre')}
                  </button>
                  {/* Boutons de déconnexion/connexion/inscription pour mobile */}
                  {user && !loadingAuth ? (
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/></svg>
                      {t('logout', 'Déconnexion')}
                    </button>
                  ) : (
                    !loadingAuth && !user && (
                      <div className="flex flex-col space-y-2 pt-2">
                        <button
                          onClick={onLoginClick}
                          className="w-full px-3 py-2 rounded-md text-base font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                          {t('login', 'Connexion')}
                        </button>
                        <button
                          onClick={onRegisterClick}
                          className="w-full px-3 py-2 rounded-md text-base font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                          {t('register', 'Inscription')}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </nav>
  );
}