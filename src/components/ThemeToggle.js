// src/components/ThemeToggle.js
import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ theme, setTheme }) => {
  // Détermine si le bouton doit être "coché" (mode sombre)
  const isDark = theme === 'dark';

  // Fonction pour changer le thème
  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    // Ce conteneur utilise la classe .theme-toggle de votre CSS (assurez-vous qu'elle existe dans globals.css si vous l'utilisez)
    <div className="flex items-center space-x-2">
      <Sun size={18} className="text-yellow-400" /> {/* Icône Soleil */}
      
      {/* Bouton de bascule simple pour le thème */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          checked={isDark}
          onChange={handleToggle}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
      
      <Moon size={18} className="text-blue-400" /> {/* Icône Lune */}
    </div>
  );
};

export default ThemeToggle;