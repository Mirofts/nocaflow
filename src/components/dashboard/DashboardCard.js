// components/dashboard/DashboardCard.js
import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

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
    const { isDarkMode } = useTheme();

    const handleMinimizeToggle = () => {
        setIsMinimized(!isMinimized);
    };

    // Define card variants for smooth height transition
    // When not minimized, height is 'auto' to allow content to dictate size.
    // When minimized, height is fixed to 72px (header height).
    const cardVariants = {
        minimized: { height: '72px', transition: { duration: 0.3, ease: 'easeInOut' } },
        maximized: { height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } }
    };

    // Variants for content opacity/visibility
    const contentVariants = {
        hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.1 } }
    };

    return (
        <motion.div
            className={`relative overflow-hidden border border-color-border-primary rounded-2xl flex flex-col ${className}`}
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            variants={cardVariants}
            animate={isMinimized ? 'minimized' : 'maximized'}
        >
            {/* Header for the DashboardCard */}
            <div className={`flex justify-between items-center px-6 py-4 border-b border-color-border-primary shadow-sm flex-shrink-0 bg-color-bg-tertiary`}>
                <div className="flex items-center gap-4">
                    {icon && <span className="text-purple-400">{icon}</span>}
                    {title && <h3 className={`text-xl font-semibold text-color-text-primary`}>{title}</h3>}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Minimize/Maximize Button */}
                    <button
                        onClick={handleMinimizeToggle}
                        className={`p-1 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                        title={isMinimized ? (t ? t('maximize_block', 'Agrandir le bloc') : 'Maximize block') : (t ? t('minimize_block', 'Réduire le bloc') : 'Minimize block')}
                    >
                        {isMinimized ? (
                            // Expand icon for maximized state
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
                        ) : (
                            // Minimize icon for minimized state
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                        )}
                    </button>
                    {/* Fullscreen Button */}
                    {onFullscreenClick && (
                        <button
                            onClick={onFullscreenClick}
                            className={`p-1 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                            title={t ? t('fullscreen', 'Agrandir (Plein écran)') : 'Fullscreen'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        key="card-content"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`flex-grow text-color-text-secondary overflow-hidden ${noContentPadding ? '' : 'p-6'}`}
                        style={{ overflowY: 'auto' }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};