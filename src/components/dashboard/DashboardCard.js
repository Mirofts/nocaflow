// components/dashboard/DashboardCard.js
import React, { useState } from 'react';
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

    const cardVariants = {
        minimized: { height: '72px', transition: { duration: 0.1, ease: 'easeInOut' } },
        maximized: { height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } }
    };

    const contentVariants = {
        hidden: { opacity: 0, y: -10, transition: { duration: 0.1 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.1, delay: 0.1 } }
    };

    return (
        <motion.div
            className={`relative flex flex-col overflow-hidden border border-color-border-primary rounded-2xl ${className}`}
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            variants={cardVariants}
            animate={isMinimized ? 'minimized' : 'maximized'}
        >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-color-border-primary shadow-sm flex-shrink-0 bg-color-bg-tertiary">
                <div className="flex items-center gap-4">
                    {icon && <span className="text-purple-400">{icon}</span>}
                    {title && <h3 className="text-xl font-semibold text-color-text-primary">{title}</h3>}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                        onClick={handleMinimizeToggle}
                        className="p-1 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary"
                        title={isMinimized ? (t?.('maximize_block') || 'Maximize') : (t?.('minimize_block') || 'Minimize')}
                    >
                        {isMinimized ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
                        )}
                    </button>
                    {onFullscreenClick && (
                        <button
                            onClick={onFullscreenClick}
                            className="p-1 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary"
                            title={t?.('fullscreen') || 'Fullscreen'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
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
                        className={`flex flex-col flex-1 ${noContentPadding ? '' : 'p-6'} overflow-hidden`}
                    >
                        {/* Permet à l'intérieur de scroller uniquement si besoin */}
                        <div className="flex flex-col h-full">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
