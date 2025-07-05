// src/components/Navbar.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Greeting from './dashboard/Greeting'; // Import Greeting for the text part
import { initialMockData } from '../lib/mockData'; // For guest stats fallback


// Déplacé STATIC_MAIN_NAV_LINKS ici (restera en dehors du composant)
const STATIC_MAIN_NAV_LINKS = [
  { href: '/#about', i18nKey: 'about' },
  { href: '/#features', i18nKey: 'features' },
  { href: '/#pricing', i18nKey: 'pricing' },
];

// NavLink reste un composant séparé et réutilisable
const NavLink = ({ href, children, currentPath, locale }) => {
  const isActive = currentPath === href || (href === '/' && currentPath === '/');
  return (
    <Link href={href} locale={locale} className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap 
      ${isActive ? 'text-pink-400' : 'text-color-text-secondary hover:text-color-text-primary'}`}>
      {children}
      {isActive && (
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

// StatPill reste un composant séparé et réutilisable (pour l'affichage des chiffres)
const StatPill = React.memo(({ icon, count, isPulsing = false, pulseColorClass = 'bg-pink-500' }) => {
  return (
    <div className="flex items-center gap-2 text-sm bg-color-bg-secondary px-3 py-1.5 rounded-full border border-color-border-primary">
        <motion.div
            animate={isPulsing ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] } : {}}
            transition={isPulsing ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
            className={`flex items-center justify-center p-1.5 rounded-full ${pulseColorClass} bg-opacity-30`}
        >
            {icon}
        </motion.div>
        <span className="font-bold text-color-text-primary">{count}</span>
    </div>
  );
});


// Composant principal Navbar
export default function Navbar({ onLoginClick, onRegisterClick, onOpenCalculator, isDashboardPage }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale: currentLocale, push, pathname, asPath, query } = router;

  const [isOpen, setIsOpen] = useState(false);
  const { currentUser: user, logout, loadingAuth } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const currentPath = pathname;
  const isGuestMode = !user || user.uid === 'guest_noca_flow';

  // User avatar logic (centralized in Navbar for rendering)
  const displayUserNameForAvatar = user?.displayName || t('guest_user_default', 'Cher Invité');
  const avatarUrl = isGuestMode ? '/images/avatars/default-avatar.jpg' : (user?.photoURL || '/images/avatars/default-avatar.jpg');

  // Phrases for dashboard greeting (if shown)
  const phrases = useMemo(() => [
      "NocaFLOW trie même les chaussettes sales ?",
      "Un seul outil. Zéro chaos. Juste du FLOW.",
      "Multitâche ? Non. NocaFLOW fait tout, vraiment.",
      "Productif sans effort. Merci NocaFLOW, dopage légal.",
      "NocaFLOW gère tout, sauf les ronrons. 🐾",
      "Adieu stress. Bonjour FLOW (et siestes félines).",
      "Même mamie l’utilise. Et elle kiffe grave.",
      "Plus fort que le café : NocaFLOW.",
      "NocaFLOW rend accros… à l’efficacité !",
      "Projets qui volent. Tracas au tapis."
  ], []); // <-- Memoize phrases

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
      let interval;
      if (isDashboardPage) { // Only animate phrases on Dashboard page
          interval = setInterval(() => {
              setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
          }, 10000);
      }
      return () => clearInterval(interval);
  }, [isDashboardPage, phrases.length]);


  // Mock stats for guest mode in Navbar (if needed, otherwise fetch real stats in dashboard page)
  const navbarStats = useMemo(() => {
      // Pour les stats en temps réel, vous devriez les passer via pageProps ou les charger ici
      // Pour l'exemple, utilisons les mock data si en mode invité.
      return {
          messages: isGuestMode ? (initialMockData.messages || []).length : 0,
          tasks: isGuestMode ? (initialMockData.tasks || []).filter(task => !task.completed).length : 0,
          meetings: isGuestMode ? (initialMockData.meetings || []).filter(m => new Date(m.dateTime) > new Date()).length : 0,
      };
  }, [isGuestMode]);


  useEffect(() => {
    setIsOpen(false); // Close mobile menu on route change
  }, [asPath]);

  const setLocale = (newLocale) => {
    push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 ${isDarkMode ? 'bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-md border-b border-slate-700/50' : 'glass-nav border-b border-color-border-primary'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            {/* Correction: Ajout de locale={currentLocale} au Link racine */}
            <Link href="/" locale={currentLocale} className="flex-shrink-0 text-color-text-primary font-bold text-2xl whitespace-nowrap">
              <span className="text-color-text-primary">Noca</span>
              <span className="animated-gradient-text pink-violet-gradient-text">FLOW</span>
            </Link>
          </div>

          {/* Desktop Navigation Links & User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Standard Nav Links */}
            {STATIC_MAIN_NAV_LINKS.map(link => (
                <NavLink key={link.href} href={link.href} currentPath={currentPath} locale={currentLocale}>{t(link.i18nKey)}</NavLink>
            ))}

            {/* Dashboard Link (always visible) */}
            {!loadingAuth && (
              // Correction: Suppression des commentaires JSX qui enveloppaient la balise NavLink
              <NavLink href="/dashboard" currentPath={currentPath} locale={currentLocale}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 text-color-text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                {t('dashboard')}
              </NavLink>
            )}

            {/* Language Selector */}
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
              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isDarkMode ? 'text-white' : 'text-color-text-primary'}`}>
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"
              aria-label={isDarkMode ? t('toggle_light_mode') : t('toggle_dark_mode')}
              title={isDarkMode ? t('toggle_light_mode') : t('toggle_dark_mode')}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>

            {/* User Login/Register/Logout Buttons */}
            {user && !loadingAuth ? ( // User is logged in (or guest)
              <div className="flex items-center space-x-2 ml-4">
                {/* Conditionnellement l'avatar de la Navbar et le bouton de déconnexion */}
                <div className="relative group">
                  {/* Correction: Ajout de locale={currentLocale} au Link de l'avatar vers le dashboard */}
                  <Link href="/dashboard" locale={currentLocale} className="flex items-center space-x-2">
                    <motion.img
                      src={user?.photoURL || '/images/avatars/default-avatar.jpg'}
                      alt={user.displayName || 'User Avatar'}
                      width={32} height={32} // Smaller avatar for Navbar
                      className="w-10 h-10 rounded-full border-2 border-pink-500 cursor-pointer object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-color-bg-secondary text-color-text-primary text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {user.displayName || (user.uid === 'guest_noca_flow' ? t('guest_user') : t('user_profile'))}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"
                  aria-label={t('logout')}
                  title={t('logout')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/></svg>
                  {t('logout')}
                </button>
              </div>
            ) : ( // User is NOT logged in (show Login/Register buttons)
              !loadingAuth && !user && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={onLoginClick}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                    {t('login')}
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y1="11"/></svg>
                    {t('register')}
                  </button>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Toggle (Hamburger) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-color-border-active"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{t('open_main_menu')}</span>
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block h-6 w-6" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block h-6 w-6" aria-hidden="true"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
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
              {/* Correction: Ajout de locale={currentLocale} à tous les Link statiques pour mobile */}
              {STATIC_MAIN_NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} locale={currentLocale} className="block px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors">
                  {t(link.i18nKey)}
                </Link>
              ))}
              {!loadingAuth && (
                // Correction: Suppression des commentaires JSX qui enveloppaient la balise Link du Dashboard pour mobile
                <Link href="/dashboard" locale={currentLocale} className="block px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                    {t('dashboard')}
                </Link>
              )}
              {/* Language Selector in mobile menu */}
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
              {/* Theme Toggle in mobile menu */}
              <button
                onClick={toggleTheme}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    )}
                    {isDarkMode ? t('toggle_light_mode') : t('toggle_dark_mode')}
                  </button>
                  {/* Login/Register/Logout buttons in mobile menu */}
                  {user && !loadingAuth ? (
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/></svg>
                      {t('logout')}
                    </button>
                  ) : (
                    !loadingAuth && !user && (
                      <div className="flex flex-col space-y-2 pt-2">
                        <button
                          onClick={onLoginClick}
                          className="w-full px-3 py-2 rounded-md text-base font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                          {t('login')}
                        </button>
                        <button
                          onClick={onRegisterClick}
                          className="w-full px-3 py-2 rounded-md text-base font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y1="11"/></svg>
                          {t('register')}
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