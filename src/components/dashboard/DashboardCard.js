// src/components/dashboard/DashboardCard.js
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useFullScreen } from '../../hooks/useFullScreen';

export const DashboardCard = ({
    children,
    className = '',
    icon,
    title,
    initialMinimized = false,
    t,
    noContentPadding = false,
    // onFullscreenClick // Cette prop n'est plus directement utilisée pour le plein écran générique
}) => {
    const [isMinimized, setIsMinimized] = useState(initialMinimized);
    const { isDarkMode } = useTheme();

    const cardRef = useRef(null);
    const { toggleFullScreen } = useFullScreen(cardRef); // Votre hook de plein écran

    const handleMinimizeToggle = () => {
        setIsMinimized(!isMinimized);
    };

    const cardVariants = {
        minimized: { height: '72px', transition: { duration: 0.2, ease: 'easeInOut' } },
        maximized: { height: 'auto', transition: { duration: 0.2, ease: 'easeInOut' } }
    };

    const contentVariants = {
        hidden: { opacity: 0, transition: { duration: 0.1 } },
        visible: { opacity: 1, transition: { duration: 0.2, delay: 0.1 } }
    };

    return (
        <motion.div
            ref={cardRef} // S'ASSURER QUE LA REF EST BIEN ICI
            className={`relative flex flex-col border border-color-border-primary rounded-2xl bg-color-bg-secondary ${className}`}
            variants={cardVariants}
            animate={isMinimized ? 'minimized' : 'maximized'}
            style={{ overflow: 'visible' }}
        >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-color-border-primary shadow-sm flex-shrink-0 bg-color-bg-tertiary z-10">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M3 3h6v6M21 21h-6v-6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                        )}
                    </button>
                    
                    {/* Le bouton de plein écran n'est plus généré par DashboardCard, mais par les composants spécifiques si besoin. */}
                    {/* Si vous voulez un bouton plein écran par défaut sur toutes les cartes Desktop, remettez-le ici. */}
                    {/* Pour les besoins mobiles, il est déclenché par les boutons d'application du Header. */}
                    {/* Example if you want it back: */}
                    {/* <button
                        onClick={toggleFullScreen}
                        className="p-1 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary"
                        title={t?.('fullscreen') || 'Fullscreen'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
                    </button> */}
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
                        className={`relative ${noContentPadding ? '' : 'p-6'}`}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};