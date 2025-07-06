// src/components/dashboard/TimeAlerts.js
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Importer useRef
import { motion } from 'framer-motion';
import { format, differenceInMinutes, parseISO, isValid, differenceInMilliseconds } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { DashboardCard } from './DashboardCard';

// Define the maximum duration for a full gauge (48 hours in minutes)
const FULL_GAUGE_DURATION_MINUTES = 48 * 60; // 48 hours * 60 minutes/hour

const SingleTimeAlertCard = ({ type, title, dateTime, icon, pulseColorClass, openCreateModal, onCardClick, alertData, t }) => {
    const { isDarkMode } = useTheme();
    const targetDate = parseISO(dateTime);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, overdue: false });
    const isMounted = useRef(false); // <-- Nouveau ref pour suivre l'état de montage

    useEffect(() => {
        isMounted.current = true; // Le composant est monté
        return () => {
            isMounted.current = false; // Le composant va être démonté
        };
    }, []); // S'exécute une seule fois au montage/démontage

    useEffect(() => {
        if (!isValid(targetDate)) {
            if (isMounted.current) { // Vérifier si monté avant la mise à jour
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, overdue: true });
            }
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const differenceMs = targetDate.getTime() - now.getTime();

            if (differenceMs <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, overdue: true };
            }

            const totalSeconds = Math.floor(differenceMs / 1000);
            const days = Math.floor(totalSeconds / (3600 * 24)); // Correction d'une petite erreur de calcul
            const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            const totalRemainingMinutes = Math.floor(differenceMs / (1000 * 60));

            return { days, hours, minutes, seconds, totalMinutes: totalRemainingMinutes, overdue: false };
        };

        const updateCountdown = () => {
            if (isMounted.current) { // <-- Vérifier si le composant est toujours monté
                setTimeLeft(calculateTimeLeft());
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [dateTime, targetDate, type]); // Dépendances inchangées

    const displayTime = timeLeft.overdue
        ? t('overdue', 'Passée')
        : t('time_left_format', '{{days}} jour(s) {{hours}} h {{minutes}} min')
            .replace('{{days}}', timeLeft.days)
            .replace('{{hours}}', timeLeft.hours)
            .replace('{{minutes}}', timeLeft.minutes);

    const isUrgent = timeLeft.days < 1 && !timeLeft.overdue;

    let progressPercentage = 0;
    if (timeLeft.overdue) {
        progressPercentage = 100;
    } else if (timeLeft.totalMinutes <= 0) {
         progressPercentage = 100;
    } else if (timeLeft.totalMinutes >= FULL_GAUGE_DURATION_MINUTES) {
        progressPercentage = 0;
    } else {
        progressPercentage = ((FULL_GAUGE_DURATION_MINUTES - timeLeft.totalMinutes) / FULL_GAUGE_DURATION_MINUTES) * 100;
    }

    let progressBarColor = '';
    if (timeLeft.overdue) {
        progressBarColor = 'bg-red-500';
    } else if (timeLeft.totalMinutes <= 2 * 60) {
        progressBarColor = 'bg-red-400';
    } else if (timeLeft.totalMinutes <= 6 * 60) {
        progressBarColor = 'bg-orange-400';
    } else if (timeLeft.totalMinutes <= 24 * 60) {
        progressBarColor = 'bg-yellow-400';
    } else {
        progressBarColor = 'bg-green-400';
    }

    const gaugeTrackColorClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
    const cardBgClass = isDarkMode ? 'bg-gray-700' : 'bg-white';

    return (
        <motion.div
            className={`relative flex flex-col items-center justify-between p-4 rounded-lg shadow-lg cursor-pointer h-full transition-colors duration-200 ${cardBgClass}`}
            whileHover={{ scale: 1.02, boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardClick(alertData)}
        >
            <div className="flex justify-between items-center w-full mb-3">
                <div className={`flex items-center justify-center p-2 rounded-full ${pulseColorClass} bg-opacity-30`}>
                    {icon}
                </div>
                <motion.button
                    onClick={(e) => { e.stopPropagation(); openCreateModal(type === 'deadline' ? 'addDeadline' : 'addMeeting'); }}
                    className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={type === 'deadline' ? t('add_deadline', 'Ajouter une échéance') : t('schedule_meeting', 'Planifier une réunion')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </motion.button>
            </div>
            <h4 className={`text-center text-lg font-bold mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                {title}
            </h4>
            <p className={`text-center text-xl font-extrabold ${timeLeft.overdue ? 'text-red-500' : (isUrgent ? 'text-orange-500' : (isDarkMode ? 'text-white' : 'text-gray-900'))} mb-2`}>
                {displayTime}
            </p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                {alertData.name || alertData.title}
            </p>

            <div className={`w-full h-2 rounded-full ${gaugeTrackColorClass} mt-auto overflow-hidden`}>
                <motion.div
                    className={`h-full rounded-full ${progressBarColor}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
            </div>
            <span className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                {progressPercentage.toFixed(0)}% {t('gauge_progress_done', 'passé')}
            </span>
        </motion.div>
    );
};


const TimeAlerts = ({ projects, meetings, t, lang, openModal, onAlertCardClick }) => {
    const nextDeadline = projects
        .filter(p => p.deadline && isValid(parseISO(p.deadline)) && new Date(p.deadline) > new Date())
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

    const nextMeeting = meetings
        .filter(m => m.dateTime && isValid(parseISO(m.dateTime)) && new Date(m.dateTime) > new Date())
        .sort((a, b) => new Date(m.dateTime) - new Date(b.dateTime))[0];

    return (
        <DashboardCard
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            }
            title={t('time_alerts_title', 'Alertes Temps')}
            className="col-span-12"
            noContentPadding={true}
        >
            <div className={`grid grid-cols-1 md:grid-cols-2 flex-grow p-4 gap-4 bg-gray-50 dark:bg-gray-900 rounded-xl`}>
                {/* Next Deadline Card */}
                <div className={`rounded-lg p-1 flex flex-col items-center border border-transparent`}>
                    {nextDeadline ? (
                        <SingleTimeAlertCard
                            type="deadline"
                            title={t('next_deadline', 'Prochaine Échéance')}
                            dateTime={nextDeadline.deadline}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                            pulseColorClass="bg-pink-500"
                            openCreateModal={openModal}
                            onCardClick={onAlertCardClick}
                            alertData={{ type: 'deadline', ...nextDeadline }}
                            t={t}
                        />
                    ) : (
                        <div className={`flex flex-col items-center justify-center py-4 px-2 text-gray-500 dark:text-gray-400 rounded-lg shadow-lg h-full w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 mb-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <p className="text-base font-semibold text-gray-700 dark:text-gray-200 text-center">{t('no_upcoming_deadlines', 'Aucune échéance à venir')}</p>
                            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 text-center">{t('add_new_deadline_hint', 'Ajoutez de nouvelles échéances pour rester organisé.')}</p>
                            <motion.button
                                onClick={() => openModal('addDeadline')}
                                className={`mt-3 px-4 py-2 rounded-md transition-colors ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('add_deadline', 'Ajouter une échéance')}
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Next Meeting Card */}
                <div className={`rounded-lg p-1 flex flex-col items-center border border-transparent`}>
                    {nextMeeting ? (
                        <SingleTimeAlertCard
                            type="meeting"
                            title={t('next_meeting', 'Prochaine Réunion')}
                            dateTime={nextMeeting.dateTime}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>}
                            pulseColorClass="bg-violet-500"
                            openCreateModal={openModal}
                            onCardClick={onAlertCardClick}
                            alertData={{ type: 'meeting', ...nextMeeting }}
                            t={t}
                        />
                    ) : (
                        <div className={`flex flex-col items-center justify-center py-4 px-2 text-gray-500 dark:text-gray-400 rounded-lg shadow-lg h-full w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 mb-2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>
                            <p className="text-base font-semibold text-gray-700 dark:text-gray-200 text-center">{t('no_upcoming_meetings', 'Aucune réunion à venir')}</p>
                            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 text-center">{t('add_new_meeting_hint', 'Planifiez de nouvelles réunions pour rester connecté.')}</p>
                            <motion.button
                                onClick={() => openModal('addMeeting')}
                                className={`mt-3 px-4 py-2 rounded-md transition-colors ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('schedule_meeting', 'Planifier une réunion')}
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
};

export default TimeAlerts;