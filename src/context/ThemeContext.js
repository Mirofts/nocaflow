// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

export const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Vérifier si nous sommes côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // Par défaut en sombre si aucune préférence n'est enregistrée
      return savedTheme === 'dark' || savedTheme === null;
    }
    // Par défaut en mode sombre côté serveur pour le rendu initial afin d'éviter le flash de contenu clair
    return true;
  });

  useEffect(() => {
    // Cet effet s'exécute uniquement côté client
    const root = window.document.documentElement;
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  const contextValue = useMemo(() => ({
    isDarkMode,
    toggleTheme,
  }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fournir un objet par défaut pour SSR/SSG afin d'éviter les erreurs de déstructuration.
    // Le mode sombre est la valeur par défaut pour le rendu côté serveur.
    return { isDarkMode: true, toggleTheme: () => {} };
  }
  return context;
};