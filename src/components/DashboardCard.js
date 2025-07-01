// components/dashboard/DashboardCard.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

export const DashboardCard = ({
    children,
    className = '',
    icon,
    title,
    onFullscreenClick,
    initialMinimized = false,
    t,
    noContentPadding = false // Prop pour désactiver le padding interne du contenu
}) => {
    const [isMinimized, setIsMinimized] = useState(initialMinimized);
    const { isDarkMode } = useTheme(); // Get isDarkMode from context

    const handleMinimizeToggle = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className={`relative overflow-hidden border border-color-border-primary rounded-2xl flex flex-col ${className} ${isMinimized ? 'minimized-card' : ''}`}
            style={{ backgroundColor: 'var(--color-bg-secondary)' }} // Keep this for the glass effect background
        >
            {/* Header for the DashboardCard */}
            {/* Use bg-color-bg-tertiary for header background and text-color-text-primary for title */}
            <div className={`flex justify-between items-center px-4 py-3 border-b border-color-border-primary shadow-sm flex-shrink-0 bg-color-bg-tertiary`}>
                <div className="flex items-center gap-3">
                    {/* Icon color always purple-400 for consistency, it should stand out */}
                    {icon && <span className="text-purple-400">{icon}</span>}
                    {/* Title text color should always be primary text color for readability */}
                    {title && <h3 className={`text-lg font-semibold text-color-text-primary`}>{title}</h3>}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Minimize/Maximize Button */}
                    <button
                        onClick={handleMinimizeToggle}
                        // Use theme variables for button text and hover background
                        className={`p-1 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                        title={isMinimized ? (t ? t('maximize_block', 'Agrandir le bloc') : 'Maximize block') : (t ? t('minimize_block', 'Réduire le bloc') : 'Minimize block')}
                    >
                        {isMinimized ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                        )}
                    </button>
                    {/* Fullscreen Button */}
                    {onFullscreenClick && (
                        <button
                            onClick={onFullscreenClick}
                            // Use theme variables for button text and hover background
                            className={`p-1 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                            title={t ? t('fullscreen', 'Agrandir (Plein écran)') : 'Fullscreen'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        // Applique 'p-4' sauf si noContentPadding est true
                        className={`flex-grow text-color-text-secondary overflow-hidden ${noContentPadding ? '' : 'p-4'}`}
                        style={{ overflowY: 'auto' }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};