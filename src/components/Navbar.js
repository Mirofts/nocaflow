// src/components/Navbar.js
import React, { useState, useEffect, useMemo } from 'react'; // Ensure useMemo is explicitly imported
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'next-i18next'; 
import Image from 'next/image';
import Greeting from './dashboard/Greeting';
import { initialMockData } from '../lib/mockData'; 


// FIX: Déplacer mainNavLinks en dehors du composant Navbar
const STATIC_MAIN_NAV_LINKS = [
  { href: '/', i18nKey: 'about' },
  { href: '/features', i18nKey: 'features' },
  { href: '/pricing', i18nKey: 'pricing' },
];

// FIX: Composant NavLink. No direct use of useMemo/useEffect, so it should be fine.
const NavLink = ({ href, children, currentPath }) => {
  const isActive = currentPath === href || (href === '/' && currentPath === '/');
  return (
    <Link href={href} className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap 
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

// FIX: Composant StatPill. Explicitly using React.memo to ensure React is in scope for its functional component definition.
// This often resolves "hook not defined" errors for helper components.
const StatPill = React.memo(({ icon, count, isPulsing = false, pulseColorClass = 'bg-pink-500' }) => (
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
));


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

  // User avatar logic (centralized)
  const displayUserNameForAvatar = user?.displayName || t('guest_user_default', 'Cher Invité');
  const avatarUrl = isGuestMode ? '/images/avatars/avatarguest.jpg' : (user?.photoURL || '/images/avatars/default-avatar.jpg');

  // Phrases for dashboard greeting (if shown)
  const phrases = [
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
  ];
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
  const navbarStats = useMemo(() => { // useMemo is defined in the outer scope of Navbar
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
            <Link href="/" className="flex-shrink-0 text-color-text-primary font-bold text-2xl whitespace-nowrap">
              <span className="text-color-text-primary">Noca</span>
              <span className="animated-gradient-text pink-violet-gradient-text">FLOW</span>
            </Link>
          </div>

          {/* Desktop Navigation Links & User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Standard Nav Links (using STATIC_MAIN_NAV_LINKS and t() for labels) */}
            {STATIC_MAIN_NAV_LINKS.map(link => (
                <NavLink key={link.href} href={link.href} currentPath={currentPath}>{t(link.i18nKey, link.label)}</NavLink>
            ))}

            {/* Dashboard Link (always visible) */}
            {!loadingAuth && (
              <NavLink href="/dashboard" currentPath={currentPath}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 text-color-text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                {t('dashboard', 'Dashboard')}
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
              aria-label={isDarkMode ? t('toggle_light_mode', 'Activer le mode clair') : t('toggle_dark_mode', 'Activer le mode sombre')}
              title={isDarkMode ? t('toggle_light_mode', 'Mode Clair') : t('toggle_dark_mode', 'Mode Sombre')}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>

            {/* User Avatar, Greeting, and Login/Register Buttons */}
            {user && !loadingAuth ? ( // User is logged in (or guest)
              <div className="flex items-center space-x-2 ml-4">
                {isDashboardPage && ( // Only show Dashboard-specific content if on Dashboard page
                  <>
                    <div className="relative group cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <Image
                            src={avatarUrl}
                            alt={displayUserNameForAvatar}
                            width={32} height={32} // Smaller avatar for Navbar
                            className={`rounded-full border-2 ${isDarkMode ? 'border-slate-700' : 'border-color-border-primary'} group-hover:border-pink-500 transition-colors object-cover`}
                        />
                    </div>
                    <div className="flex flex-col items-start mr-2">
                        <div className="flex items-center">
                            <Greeting t={t} /> {/* Ave, TOI / Ave, YOU */}
                        </div>
                        <div className="h-4 overflow-hidden text-xs text-color-text-secondary leading-tight whitespace-nowrap">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentPhraseIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {phrases[currentPhraseIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>
                    {/* Stats Pills (using dummy data for Navbar) */}
                    <StatPill icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-1.9A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/></svg>
                    } count={navbarStats.messages} isPulsing={navbarStats.messages > 0} pulseColorClass="bg-pink-500" />
                    <StatPill icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    } count={navbarStats.tasks} isPulsing={navbarStats.tasks > 0} pulseColorClass="bg-sky-500" />
                    <StatPill icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    } count={navbarStats.meetings} isPulsing={navbarStats.meetings > 0} pulseColorClass="bg-amber-500" />

                    <button
                        onClick={onOpenCalculator}
                        className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"
                        aria-label={t('calculator', 'Calculatrice')}
                        title={t('calculator', 'Calculatrice')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                            <line x1="8" y1="6" x2="8.01" y2="6"/>
                            <line x1="16" y1="6" x2="16.01" y2="6"/>
                            <line x1="8" y1="10" x2="8.01" y2="10"/>
                            <line x1="16" y1="10" x2="16.01" y2="10"/>
                            <line x1="8" y1="14" x2="8.01" y2="14"/>
                            <line x1="16" y1="14" x2="16.01" y2="14"/>
                            <line x1="8" y1="18" x2="8.01" y2="18"/>
                            <line x1="12" y1="18" x2="12.01" y2="18"/>
                            <line x1="16" y1="18" x2="16.01" y2="18"/>
                            <line x1="12" y1="2" x2="12" y2="22"/>
                            <line x1="4" y1="10" x2="20" y2="10"/>
                        </svg>
                    </button>
                  </>
                )}

                {/* Logout Button (always visible if user is logged in) */}
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"
                  aria-label={t('logout', 'Déconnexion')}
                  title={t('logout', 'Déconnexion')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/></svg>
                  {t('logout', 'Déconnexion')}
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
                    {t('login', 'Connexion')}
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    {t('register', 'Inscription')}
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
              <span className="sr-only">{t('open_main_menu', 'Ouvrir le menu principal')}</span>
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
              {STATIC_MAIN_NAV_LINKS.map(link => ( // FIX: Utilisation de STATIC_MAIN_NAV_LINKS ici aussi
                <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors">
                  {t(link.i18nKey, link.label)}
                </Link>
              ))}
              {!loadingAuth && (
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                    {t('dashboard', 'Dashboard')}
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
                    {isDarkMode ? t('toggle_light_mode', 'Activer le mode clair') : t('toggle_dark_mode', 'Activer le mode sombre')}
                  </button>
                  {/* Login/Register/Logout buttons in mobile menu */}
                  {user && !loadingAuth ? (
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/></svg>
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