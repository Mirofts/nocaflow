// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

export const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      // Côté serveur : toujours sombre par défaut pour éviter le flash
      return true;
    }

    // Côté client : lire la préférence sauvegardée
    const savedTheme = localStorage.getItem('theme');
    let initialMode;

    if (savedTheme === 'dark') {
      initialMode = true;
    } else if (savedTheme === 'light') {
      initialMode = false;
    } else {
      // Si aucune préférence sauvegardée, par défaut en mode sombre (votre choix)
      initialMode = true;
      // Optionnel: si vous voulez respecter la préférence système si aucune sauvegarde
      // const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      // initialMode = prefersDark;
    }

    // Appliquer l'attribut immédiatement pour éviter le flash de contenu
    document.documentElement.setAttribute('data-theme', initialMode ? 'dark' : 'light');
    return initialMode;
  });

  useEffect(() => {
    // Cet effet met à jour l'attribut et localStorage si isDarkMode change APRÈS l'initialisation
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