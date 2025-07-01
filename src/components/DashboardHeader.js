// components/dashboard/DashboardHeader.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Greeting from './Greeting';

const PulsingIcon = ({ children, isPulsing, pulseColorClass = 'bg-pink-500' }) => (
    <motion.div
        animate={isPulsing ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] } : {}}
        transition={isPulsing ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
        className={`flex items-center justify-center p-2 rounded-full ${pulseColorClass} bg-opacity-30`}
    >
        {children}
    </motion.div>
);

const StatPill = ({ icon, count, isPulsing = false, pulseColorClass }) => (
    <div className="flex items-center gap-2 text-sm bg-color-bg-secondary px-3 py-1.5 rounded-full border border-color-border-primary">
        <PulsingIcon isPulsing={isPulsing} pulseColorClass={pulseColorClass}>
            {icon}
        </PulsingIcon>
        <span className="font-bold text-color-text-primary">{count}</span>
    </div>
);

const DashboardHeader = ({ user, isGuestMode, openModal, handleLogout, stats, t, onOpenCalculator }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    const displayUserNameForAvatar = user?.displayName || t('guest_user_default', 'Cher Invité');
    const avatarUrl = isGuestMode ? '/images/avatarguest.jpg' : (user?.photoURL || '/images/avatars/yves.jpg');

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
        const interval = setInterval(() => {
            setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [phrases.length]);

    return (
        <motion.header
            variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => openModal('avatar')}>
                    <Image
                        src={avatarUrl}
                        alt={displayUserNameForAvatar}
                        width={60}
                        height={60}
                        // Use border-color-border-primary for border in light mode
                        className={`rounded-full border-2 ${isDarkMode ? 'border-slate-700' : 'border-color-border-primary'} group-hover:border-pink-500 transition-colors object-cover`}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-color-bg-tertiary rounded-full p-1 border-2 border-color-border-primary group-hover:bg-pink-500 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-color-text-primary"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5Z"/></svg>
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center">
                        <Greeting t={t} />
                        {!isGuestMode && (
                            <button
                                onClick={() => openModal('userNameEdit')}
                                className="text-color-text-secondary text-sm ml-2 p-1 rounded-md hover:bg-color-bg-hover transition-colors"
                                title={t('edit', 'Modifier le nom')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-color-text-secondary"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                            </button>
                        )}
                    </div>
                    <div className="h-10 overflow-hidden mt-1">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentPhraseIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="text-color-text-secondary text-xs leading-tight typewriter-text"
                            >
                                {phrases[currentPhraseIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
                <StatPill icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-1.9A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/></svg>
                } count={stats.messages} isPulsing={stats.messages > 0} pulseColorClass="bg-pink-500" />
                <StatPill icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                } count={stats.tasks} isPulsing={stats.tasks > 0} pulseColorClass="bg-sky-500" />
                <StatPill icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                } count={stats.meetings} isPulsing={stats.meetings > 0} pulseColorClass="bg-amber-500" />

                <button
                    onClick={onOpenCalculator}
                    className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"
                    aria-label={t('calculator', 'Calculatrice')}
                    title={t('calculator', 'Calculatrice')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            </div>
        </motion.header>
    );
};

export default DashboardHeader;