// src/context/ThemeContext.js

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') === 'dark';
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        return false;
    });

    const isInitialRender = useRef(true);

    useEffect(() => {
        const root = document.documentElement;
        
        if (isInitialRender.current) {
            root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
            isInitialRender.current = false;
        } else {
            root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        }

    }, [isDarkMode]);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prevMode => !prevMode);
    }, []);

    const getThemeClasses = useCallback((lightClass, darkClass) => {
        return isDarkMode ? darkClass : lightClass;
    }, [isDarkMode]);

    const value = {
        isDarkMode,
        toggleTheme,
        getThemeClasses
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};