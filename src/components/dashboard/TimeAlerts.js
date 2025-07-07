// src/components/dashboard/TimeAlerts.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isValid(targetDate)) {
            if (isMounted.current) {
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
            const days = Math.floor(totalSeconds / (3600 * 24));
            const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            const totalRemainingMinutes = Math.floor(differenceMs / (1000 * 60));

            return { days, hours, minutes, seconds, totalMinutes: totalRemainingMinutes, overdue: false };
        };

        const updateCountdown = () => {
            if (isMounted.current) {
                setTimeLeft(calculateTimeLeft());
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [dateTime, targetDate, type]);

    const displayTime = timeLeft.overdue
        ? t('overdue', 'Passée')
        : t('time_left_format', '{{days}} jour(s) {{hours}} h {{minutes}} min')
            .replace('{{days}}', timeLeft.days)
            .replace('{{hours}}', timeLeft.hours)
            .replace('{{minutes}}', timeLeft.minutes);

    const isUrgent = timeLeft.days < 1 && !timeLeft.overdue;

    // --- LOGIQUE DE LA BARRE DE PROGRESSION (TEMPS RESTANT) ---
    let remainingPercentage = 0; // 0% = plus de temps, 100% = tout le temps (48h)
    if (timeLeft.overdue) {
        remainingPercentage = 0; // Si dépassé, il ne reste plus de temps, donc 0% de la jauge remplie
    } else if (timeLeft.totalMinutes <= 0) {
        remainingPercentage = 0; // Si le temps est exactement 0, 0% de la jauge remplie
    } else if (timeLeft.totalMinutes >= FULL_GAUGE_DURATION_MINUTES) {
        remainingPercentage = 100; // Si il reste 48h ou plus, la jauge est pleine (100% restant)
    } else {
        // Temps restant sur la fenêtre de 48h
        remainingPercentage = (timeLeft.totalMinutes / FULL_GAUGE_DURATION_MINUTES) * 100;
    }

    // Déterminer la couleur de la barre en fonction du temps restant (plutôt que le temps passé)
    let progressBarColorClass = '';
    if (timeLeft.overdue) {
        progressBarColorClass = 'bg-red-500'; // Dépassé
    } else if (timeLeft.totalMinutes < 2 * 60) { // Moins de 2h
        progressBarColorClass = 'bg-red-400';
    } else if (timeLeft.totalMinutes < 6 * 60) { // Moins de 6h
        progressBarColorClass = 'bg-orange-400';
    } else if (timeLeft.totalMinutes < 24 * 60) { // Moins de 24h
        progressBarColorClass = 'bg-yellow-400';
    } else {
        progressBarColorClass = 'bg-green-400'; // Reste > 24h
    }

    const gaugeTrackColorClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
    const cardBgClass = isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'; // Ajout de bordures subtiles

    return (
        <motion.div
            className={`relative flex flex-col items-center justify-between p-6 rounded-2xl shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${cardBgClass}`}
            onClick={() => onCardClick(alertData || {})}
        >
            <div className="flex justify-between items-center w-full mb-4">
                <div className={`flex items-center justify-center p-3 rounded-full ${pulseColorClass} bg-opacity-20`}> {/* Plus grand padding, moins d'opacité */}
                    {icon}
                </div>
                <motion.button
                    onClick={(e) => { e.stopPropagation(); openCreateModal(type === 'deadline' ? 'addDeadline' : 'addMeeting'); }}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={type === 'deadline' ? t('add_deadline', 'Ajouter une échéance') : t('schedule_meeting', 'Planifier une réunion')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </motion.button>
            </div>

            <h4 className={`text-center text-xl font-extrabold mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                {title}
            </h4>
            <p className={`text-center text-3xl font-black ${timeLeft.overdue ? 'text-red-500' : (isUrgent ? 'text-orange-400' : (isDarkMode ? 'text-white' : 'text-gray-900'))} mb-4 leading-tight`}>
                {displayTime}
            </p>
            <p className="text-center text-base text-gray-400 dark:text-gray-500 mb-6 font-medium">
                {(alertData?.name || alertData?.title) || t('no_name', 'Nom inconnu')}
            </p>

            {/* Progress Gauge */}
            <div className={`w-full h-3 rounded-full ${gaugeTrackColorClass} mt-auto overflow-hidden`}> {/* Hauteur augmentée */}
                <motion.div
                    className={`h-full rounded-full ${progressBarColorClass}`}
                    initial={{ width: '100%' }} // Commence à 100% de la jauge pleine (temps restant)
                    animate={{ width: `${remainingPercentage}%` }} // Se réduit au fur et à mesure que le temps passe
                    transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
            </div>
            <span className="mt-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                {remainingPercentage.toFixed(0)}% {t('gauge_time_remaining', 'restant')} {/* Texte mis à jour */}
            </span>
        </motion.div>
    );
};


const TimeAlerts = ({ projects, meetings, t, lang, openModal, onAlertCardClick }) => {
    const safeProjects = projects || [];
    const safeMeetings = meetings || [];

    const nextDeadline = safeProjects
        .filter(p => p.deadline && isValid(parseISO(p.deadline)) && new Date(p.deadline) > new Date())
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

    const nextMeeting = safeMeetings
        .filter(meetingItem => meetingItem.dateTime && isValid(parseISO(meetingItem.dateTime)) && new Date(meetingItem.dateTime) > new Date())
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
            <div className={`grid grid-cols-1 md:grid-cols-2 flex-grow p-4 gap-6 bg-gray-900 rounded-xl shadow-inner`}> {/* Fond sombre pour les cartes claires */}
                {/* Next Deadline Card */}
                <div className={`rounded-2xl p-1`}> {/* Container pour la carte individuelle */}
                    {nextDeadline ? (
                        <SingleTimeAlertCard
                            type="deadline"
                            title={t('next_deadline', 'Prochaine Échéance')}
                            dateTime={nextDeadline.deadline}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                            pulseColorClass="bg-pink-500"
                            openCreateModal={openModal}
                            onCardClick={onAlertCardClick}
                            alertData={{ type: 'deadline', ...nextDeadline }}
                            t={t}
                        />
                    ) : (
                        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl h-full w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} text-gray-500 dark:text-gray-400 transition-colors duration-200`}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 mb-3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center mb-2">{t('no_upcoming_deadlines', 'Aucune échéance à venir')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('add_new_deadline_hint', 'Ajoutez de nouvelles échéances pour rester organisé.')}</p>
                            <motion.button
                                onClick={() => openModal('addDeadline')}
                                className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('add_deadline', 'Ajouter une échéance')}
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Next Meeting Card */}
                <div className={`rounded-2xl p-1`}> {/* Container pour la carte individuelle */}
                    {nextMeeting ? (
                        <SingleTimeAlertCard
                            type="meeting"
                            title={t('next_meeting', 'Prochaine Réunion')}
                            dateTime={nextMeeting.dateTime}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>}
                            pulseColorClass="bg-violet-500"
                            openCreateModal={openModal}
                            onCardClick={onAlertCardClick}
                            alertData={{ type: 'meeting', ...nextMeeting }}
                            t={t}
                        />
                    ) : (
                        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl h-full w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} text-gray-500 dark:text-gray-400 transition-colors duration-200`}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 mb-3"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center mb-2">{t('no_upcoming_meetings', 'Aucune réunion à venir')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('add_new_meeting_hint', 'Planifiez de nouvelles réunions pour rester connecté.')}</p>
                            <motion.button
                                onClick={() => openModal('addMeeting')}
                                className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
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