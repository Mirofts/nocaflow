// src/components/dashboard/DashboardHeader.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import Greeting from './Greeting';

// Composant PulsingIcon pour les icônes animées
const PulsingIcon = ({ children, isPulsing, pulseColorClass = 'bg-pink-500' }) => (
    <motion.div
        animate={isPulsing ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] } : {}}
        transition={isPulsing ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
        className={`flex items-center justify-center p-2 rounded-full ${pulseColorClass} bg-opacity-30`}
    >
        {children}
    </motion.div>
);

// Composant StatPill pour les bulles de statistiques
const StatPill = ({ icon, count, isPulsing = false, pulseColorClass }) => (
    <div className="flex items-center gap-2 text-sm bg-color-bg-secondary px-3 py-1.5 rounded-full border border-color-border-primary">
        <PulsingIcon isPulsing={isPulsing} pulseColorClass={pulseColorClass}>
            {icon}
        </PulsingIcon>
        <span className="font-bold text-color-text-primary">{count}</span>
    </div>
);

// Le composant pour les icônes d'ancrage / boutons d'application
const AnchorIcons = ({ t, isMobileView, openFullScreenModal }) => {
    const iconStyle = "w-6 h-6 text-color-text-secondary group-hover:text-purple-400 transition-colors";
    const anchors = [
        { id: 'messages', title: t('quick_nav_messages', 'Messages'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconStyle}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, component: 'FlowLiveMessages' },
        { id: 'notepad', title: t('quick_nav_notepad', 'Bloc-notes'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconStyle}><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>, component: 'Notepad' },
        { id: 'calendar', title: t('quick_nav_calendar', 'Calendrier'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconStyle}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>, component: 'Calendar' },
        { id: 'gantt', title: t('quick_nav_gantt', 'Planning Gantt'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconStyle}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>, component: 'GanttChartPlanning' },
        { id: 'projects', title: t('quick_nav_projects', 'Projets'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconStyle}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>, component: 'Projects' },
        { id: 'team', title: t('quick_nav_team', 'Mon Équipe'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconStyle}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, component: 'TeamManagement' },
        { id: 'clients', title: t('quick_nav_clients', 'Clients'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconStyle}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, component: 'ClientManagement' },
        { id: 'invoices', title: t('quick_nav_invoices', 'Factures'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconStyle}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, component: 'InvoiceListModal' },
    ];

    if (isMobileView) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:hidden w-full mt-4">
                {anchors.map((anchor) => (
                    <button
                        key={anchor.id}
                        onClick={() => openFullScreenModal(anchor.component, anchor.title)}
                        title={anchor.title}
                        className="group flex flex-col items-center justify-center p-3 sm:p-4 bg-color-bg-secondary border border-color-border-primary rounded-lg hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-200 text-center"
                    >
                        {anchor.icon}
                        <span className="text-xs mt-2 text-color-text-primary font-medium">{anchor.title}</span>
                    </button>
                ))}
            </div>
        );
    }

    // Version Desktop (inchangée)
    return (
        <div className="flex items-center gap-2 hidden md:flex">
            {anchors.map((anchor) => (
                <a
                    key={anchor.id}
                    href={`#${anchor.id}-section`}
                    title={anchor.title}
                    className="group flex items-center justify-center w-10 h-10 bg-color-bg-secondary border border-color-border-primary rounded-lg hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-200"
                >
                    {anchor.icon}
                </a>
            ))}
        </div>
    );
};


const DashboardHeader = ({ user, isGuestMode, openModal, handleLogout, stats, t, onOpenCalculator, isMobileView, openFullScreenModal }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    const phrases = useMemo(() => [
        t("phrase1", "NocaFLOW trie même les chaussettes sales ?"),
        t("phrase2", "Un seul outil. Zéro chaos. Juste du FLOW."),
        t("phrase3", "Multitâche ? Non. NocaFLOW fait tout, vraiment."),
        t("phrase4", "Productif sans effort. Merci NocaFLOW, dopage légal."),
        t("phrase5", "NocaFLOW gère tout, sauf les ronrons. 🐾"),
        t("phrase6", "Adieu stress. Bonjour FLOW (et siestes félines)."),
        t("phrase7", "Même mamie l’utilise. Et elle kiffe grave."),
        t("phrase8", "Plus fort que le café : NocaFLOW."),
        t("phrase9", "NocaFLOW rend accros… à l’efficacité !"),
        t("phrase10", "Projets qui volent. Tracas au tapis.")
    ], [t]);

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [phrases]);

    const displayUserNameForAvatar = user?.displayName || t('guest_user_default', 'Cher Invité');
    const avatarUrl = isGuestMode ? '/images/avatars/avatarguest.jpg' : (user?.photoURL || '/images/avatars/default-avatar.jpg');


    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4"
        >
            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => openModal('avatar')}>
                    <Image
                        src={avatarUrl}
                        alt={displayUserNameForAvatar}
                        width={60}
                        height={60}
                        className={`rounded-full border-2 ${isDarkMode ? 'border-slate-700' : 'border-color-border-primary'} group-hover:border-pink-500 transition-colors object-cover`}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-color-bg-tertiary rounded-full p-1 border-2 border-color-border-primary group-hover:bg-pink-500 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-color-text-primary"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1.5 1.5-4L18.5 2.5Z"/></svg>
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Greeting t={t} />
                        {!isGuestMode && user?.customId && (
                            <div className="bg-violet-500/20 text-violet-300 text-xs font-bold px-2 py-1 rounded-full">
                                ID: {user.customId}
                            </div>
                        )}
                        {!isGuestMode && (
                            <button
                                onClick={() => openModal('userNameEdit')}
                                className="text-color-text-secondary text-sm p-1 rounded-md hover:bg-color-bg-hover transition-colors"
                                title={t('edit', 'Modifier le nom')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-color-text-primary"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
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

            <div className="flex flex-col md:flex-row items-center gap-3 self-start md:self-center w-full md:w-auto">
                <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start w-full md:w-auto">
                    <StatPill icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-1.9A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/></svg>} count={stats.messages} isPulsing={stats.messages > 0} pulseColorClass="bg-pink-500" />
                    <StatPill icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} count={stats.tasks} isPulsing={stats.tasks > 0} pulseColorClass="bg-sky-500" />
                    <StatPill icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} count={stats.meetings} isPulsing={stats.meetings > 0} pulseColorClass="bg-amber-500" />
                    
                    <div className="h-6 w-px bg-color-border-primary hidden md:block mx-1"></div>
                    
                    <button onClick={onOpenCalculator} className="p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors flex-shrink-0" aria-label={t('calculator', 'Calculatrice')} title={t('calculator', 'Calculatrice')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="8.01" y2="6"/><line x1="16" y1="6" x2="16.01" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="8.01" y2="18"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="16" y1="18" x2="16.01" y2="18"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="10" x2="20" y2="10"/></svg>
                    </button>
                </div>
                
                <AnchorIcons t={t} isMobileView={isMobileView} openFullScreenModal={openFullScreenModal} />
            </div>
        </motion.header>
    );
};

export default DashboardHeader;