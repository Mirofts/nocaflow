// components/dashboard/TimeAlerts.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, parseISO, isValid, differenceInMilliseconds } from 'date-fns';
import { fr } from 'date-fns/locale'; // Assurez-vous d'importer 'fr' pour la locale
import { useTheme } from '../../context/ThemeContext';
import { DashboardCard } from './DashboardCard'; // Make sure DashboardCard is imported

// Define the maximum duration for a full gauge (48 hours in minutes)
const FULL_GAUGE_DURATION_MINUTES = 48 * 60; // 48 hours * 60 minutes/hour

// Componant interne TimeAlert - Renommé pour plus de clarté
const SingleTimeAlertCard = ({ type, title, dateTime, icon, pulseColorClass, openCreateModal, onCardClick, alertData, t }) => {
    const { isDarkMode } = useTheme();
    const targetDate = parseISO(dateTime);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, overdue: false });

    useEffect(() => {
        if (!isValid(targetDate)) {
            console.warn(`Invalid date provided for ${type} alert: ${dateTime}`);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const differenceMs = targetDate.getTime() - now.getTime(); // Difference in milliseconds

            if (differenceMs <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, overdue: true };
            }

            const totalSeconds = Math.floor(differenceMs / 1000);
            const days = Math.floor(totalSeconds / (60 * 60 * 24));
            const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;
            const totalRemainingMinutes = Math.floor(differenceMs / (1000 * 60));

            return { days, hours, minutes, seconds, totalMinutes: totalRemainingMinutes, overdue: false };
        };

        const updateCountdown = () => {
            setTimeLeft(calculateTimeLeft());
        };

        updateCountdown(); // Initial calculation
        const timer = setInterval(updateCountdown, 1000); // Update every second for smoother gauge

        return () => clearInterval(timer);
    }, [dateTime, targetDate, type]);

    const displayTime = t('time_left_format', '{{days}} jour(s) {{hours}} h {{minutes}} min')
        .replace('{{days}}', timeLeft.days)
        .replace('{{hours}}', timeLeft.hours)
        .replace('{{minutes}}', timeLeft.minutes);

    const isUrgent = timeLeft.days < 1 && !timeLeft.overdue;
    const pulseEffect = isUrgent || timeLeft.overdue; // Used for potential pulsing animation

    // Calculate progress for the gauge based on 48 hours as the max
    let progressPercentage = 0;
    if (timeLeft.overdue) {
        progressPercentage = 100; // If overdue, gauge is 100% (passed the deadline)
    } else if (timeLeft.totalMinutes <= 0) {
         progressPercentage = 100; // If exact time is zero, it's also 100% (at the deadline)
    } else if (timeLeft.totalMinutes >= FULL_GAUGE_DURATION_MINUTES) {
        // If remaining time is more than or exactly 48 hours, gauge shows 0% completed/remaining (full bar for future)
        progressPercentage = 0; // Gauge starts empty for very future events, fills up as time passes
    } else {
        // If within 48 hours, calculate based on time passed within the 48h window
        // (FULL_GAUGE_DURATION_MINUTES - timeLeft.totalMinutes) is the time 'consumed' from the 48h window
        progressPercentage = ((FULL_GAUGE_DURATION_MINUTES - timeLeft.totalMinutes) / FULL_GAUGE_DURATION_MINUTES) * 100;
    }

    // Determine gauge color based on remaining time
    let progressBarColor = '';
    if (timeLeft.overdue) {
        progressBarColor = 'bg-red-500'; // Rouge si dépassé
    } else if (timeLeft.totalMinutes <= 12 * 60) { // Moins de 12 heures
        progressBarColor = 'bg-orange-500'; // Orange si très proche
    } else if (timeLeft.totalMinutes <= 24 * 60) { // Moins de 24 heures
        progressBarColor = 'bg-yellow-500'; // Jaune si proche
    } else {
        progressBarColor = 'bg-blue-500'; // Bleu par défaut (loin)
    }


    const gaugeTrackColorClass = isDarkMode ? 'bg-slate-700' : 'bg-gray-200';

    return (
        <motion.div
            className={`relative flex flex-col items-center justify-center p-4 rounded-lg shadow-md cursor-pointer h-full
                        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                        transition-colors duration-200`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardClick(alertData)} // <-- Rend la carte entière cliquable
        >
            <div className="flex items-center justify-center mb-2">
                <div className={`flex items-center justify-center p-2 rounded-full ${pulseColorClass} bg-opacity-30`}>
                    {icon}
                </div>
                {/* Bouton pour ajouter un élément (échéance/réunion) */}
                <motion.button
                    onClick={(e) => { e.stopPropagation(); openCreateModal(type === 'deadline' ? 'addDeadline' : 'addMeeting'); }}
                    className={`p-1.5 rounded-full ml-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={type === 'deadline' ? t('add_deadline', 'Ajouter une échéance') : t('schedule_meeting', 'Planifier une réunion')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </motion.button>
            </div>
            <h4 className={`text-center text-base font-semibold ${isDarkMode ? 'text-pink-400' : 'text-purple-700'}`}>
                {title}
            </h4>
            <p className={`text-center text-xs font-medium ${type === 'deadline' ? (isDarkMode ? 'text-pink-300' : 'text-purple-600') : (isDarkMode ? 'text-violet-300' : 'text-purple-400')} mt-0.5`}>
                {timeLeft.overdue ? t('overdue', 'Passé') : displayTime}
            </p>

            {/* Progress Gauge */}
            <div className={`w-full h-1.5 rounded-full ${gaugeTrackColorClass} mt-2 overflow-hidden`}>
                <motion.div
                    className={`h-full rounded-full ${progressBarColor}`}
                    initial={{ width: '0%' }} // Start from 0 for fresh animation
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
            </div>
            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('gauge_progress', '{{percentage}}% passé')} {/* Updated text for clarity */}
            </span>
        </motion.div>
    );
};


const TimeAlerts = ({ projects, meetings, t, lang, openModal, onAlertCardClick }) => { // onAlertCardClick ajouté ici
    const { isDarkMode } = useTheme();

    const nextDeadline = projects
        .filter(p => p.deadline && isValid(parseISO(p.deadline)) && new Date(p.deadline) > new Date())
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

    const nextMeeting = meetings
        .filter(m => m.dateTime && isValid(parseISO(m.dateTime)) && new Date(m.dateTime) > new Date())
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0];

    return (
        <DashboardCard
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            }
            title={t('time_alerts_title', 'Alertes Temps')}
            className="col-span-12"
            noContentPadding={true}
        >
            <div className={`grid grid-cols-1 md:grid-cols-2 flex-grow p-2 gap-2 ${isDarkMode ? 'bg-color-bg-secondary' : 'bg-white'} rounded-xl`}>
                {/* Next Deadline Card */}
                <div className={`rounded-lg p-3 flex flex-col items-center border ${isDarkMode ? 'border-color-border-primary' : 'border-gray-200'} ${isDarkMode ? 'bg-color-bg-tertiary' : 'bg-gray-50'}`}>
                    {nextDeadline ? (
                        <SingleTimeAlertCard // Renommé le composant interne
                            type="deadline"
                            title={t('next_deadline', 'Prochaine Échéance')}
                            dateTime={nextDeadline.deadline}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                            pulseColorClass="bg-pink-500"
                            openCreateModal={openModal} // openModal pour créer (l'ancienne prop)
                            onCardClick={onAlertCardClick} // La nouvelle prop pour ouvrir la modale de détails
                            alertData={{ type: 'deadline', ...nextDeadline }} // Passe les données complètes pour la modale
                            t={t}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 px-2 text-color-text-secondary">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 mb-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <p className="text-base font-semibold text-color-text-primary text-center">{t('no_upcoming_deadlines', 'Aucune échéance à venir')}</p>
                            <p className="text-xs mt-1 text-center">{t('add_new_deadline_hint', 'Ajoutez de nouvelles échéances pour rester organisé.')}</p>
                            <motion.button
                                onClick={() => openModal('addDeadline')}
                                className={`p-1.5 rounded-full mt-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={t('add_deadline', 'Ajouter une échéance')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Next Meeting Card */}
                <div className={`rounded-lg p-3 flex flex-col items-center border ${isDarkMode ? 'border-color-border-primary' : 'border-gray-200'} ${isDarkMode ? 'bg-color-bg-tertiary' : 'bg-gray-50'}`}>
                    {nextMeeting ? (
                        <SingleTimeAlertCard // Renommé le composant interne
                            type="meeting"
                            title={t('next_meeting', 'Prochaine Réunion')}
                            dateTime={nextMeeting.dateTime}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>}
                            pulseColorClass="bg-violet-500"
                            openCreateModal={openModal} // openModal pour créer
                            onCardClick={onAlertCardClick} // La nouvelle prop pour ouvrir la modale de détails
                            alertData={{ type: 'meeting', ...nextMeeting }} // Passe les données complètes pour la modale
                            t={t}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 px-2 text-color-text-secondary">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 mb-1"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>
                            <p className="text-base font-semibold text-color-text-primary text-center">{t('no_upcoming_meetings', 'Aucune réunion à venir')}</p>
                            <p className="text-xs mt-1 text-center">{t('add_new_meeting_hint', 'Planifiez de nouvelles réunions pour rester connecté.')}</p>
                            <motion.button
                                onClick={() => openModal('addMeeting')}
                                className={`p-1.5 rounded-full mt-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={t('schedule_meeting', 'Planifier une réunion')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
};

export default TimeAlerts;