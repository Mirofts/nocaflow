// src/components/dashboard/TimeAlerts.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, parseISO, isValid, differenceInMilliseconds } from 'date-fns';
import { fr } from 'date-fns/locale'; // <-- CORRIGÉ : Suppression du '=' en trop
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

    let remainingPercentage = 0;
    if (timeLeft.overdue) {
        remainingPercentage = 0;
    } else if (timeLeft.totalMinutes <= 0) {
        remainingPercentage = 0;
    } else if (timeLeft.totalMinutes >= FULL_GAUGE_DURATION_MINUTES) {
        remainingPercentage = 100;
    } else {
        remainingPercentage = (timeLeft.totalMinutes / FULL_GAUGE_DURATION_MINUTES) * 100;
    }

    let progressBarColorClass = '';
    if (timeLeft.overdue) {
        progressBarColorClass = 'bg-red-500';
    } else if (timeLeft.totalMinutes < 2 * 60) {
        progressBarColorClass = 'bg-red-400';
    } else if (timeLeft.totalMinutes < 6 * 60) {
        progressBarColorClass = 'bg-orange-400';
    } else if (timeLeft.totalMinutes < 24 * 60) {
        progressBarColorClass = 'bg-yellow-400';
    } else {
        progressBarColorClass = 'bg-green-400';
    }

    const gaugeTrackColorClass = 'bg-color-bg-tertiary';
    const cardBgClass = 'futuristic-card';
    const pulseIconBgClass = type === 'deadline' ? 'bg-pink-500' : 'bg-violet-500';
    const titleTextColorClass = isDarkMode ? 'text-indigo-400' : 'text-indigo-700';
    const timeTextColorClass = timeLeft.overdue ? 'text-red-500' : (isUrgent ? 'text-orange-400' : 'text-color-text-primary');
    const detailTextColorClass = 'text-color-text-secondary';
    const plusButtonColorClass = 'action-icon-button';

    return (
        <motion.div
            className={`relative flex flex-col items-center justify-between p-6 rounded-2xl shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${cardBgClass}`}
            onClick={() => onCardClick(alertData || {})}
        >
            <div className="flex justify-between items-center w-full mb-4">
                <div className={`flex items-center justify-center p-3 rounded-full ${pulseIconBgClass} bg-opacity-20`}>
                    {icon}
                </div>
                <motion.button
                    onClick={(e) => { e.stopPropagation(); openCreateModal(type === 'deadline' ? 'addDeadline' : 'addMeeting'); }}
                    className={plusButtonColorClass}
                    title={type === 'deadline' ? t('add_deadline', 'Ajouter une échéance') : t('schedule_meeting', 'Planifier une réunion')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </motion.button>
            </div>

            <h4 className={`text-center text-xl font-extrabold mb-2 ${titleTextColorClass}`}>
                {title}
            </h4>
            <p className={`text-center text-3xl font-black ${timeTextColorClass} mb-4 leading-tight`}>
                {displayTime}
            </p>
            <p className={`text-center text-base ${detailTextColorClass} mb-6 font-medium`}>
                {(alertData?.name || alertData?.title) || t('no_name', 'Nom inconnu')}
            </p>

            {/* Progress Gauge */}
            <div className={`w-full h-3 rounded-full ${gaugeTrackColorClass} mt-auto overflow-hidden`}>
                <motion.div
                    className={`h-full rounded-full ${progressBarColorClass}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${remainingPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
            </div>
            <span className={`mt-3 text-sm font-semibold ${detailTextColorClass}`}>
                {remainingPercentage.toFixed(0)}% {t('gauge_time_remaining', 'restant')}
            </span>
        </motion.div>
    );
};


const TimeAlerts = ({ projects, meetings, t, lang, openModal, onAlertCardClick }) => {
    const { isDarkMode } = useTheme();
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
            <div className={`grid grid-cols-1 md:grid-cols-2 flex-grow p-4 gap-6 bg-color-bg-primary rounded-xl shadow-inner`}>
                {/* Next Deadline Card */}
                <div className={`rounded-2xl p-1`}>
                    {nextDeadline ? (
                        <SingleTimeAlertCard
                            type="deadline"
                            title={t('next_deadline', 'Prochaine Échéance')}
                            dateTime={nextDeadline.deadline}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                            pulseColorClass="bg-pink-500"
                            openCreateModal={openModal}
                            onCardClick={onAlertCardClick}
                            alertData={{ type: 'deadline', ...nextDeadline, eventName: nextDeadline.name }}
                            t={t}
                        />
                    ) : (
                        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl h-full w-full futuristic-card text-color-text-secondary`}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 mb-3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <p className="text-lg font-semibold text-color-text-primary text-center mb-2">{t('no_upcoming_deadlines', 'Aucune échéance à venir')}</p>
                            <p className="text-sm text-color-text-secondary text-center">{t('add_new_deadline_hint', 'Ajoutez de nouvelles échéances pour rester organisé.')}</p>
                            <motion.button
                                onClick={() => openModal('addDeadline')}
                                className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('add_deadline', 'Ajouter une échéance')}
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Next Meeting Card */}
                <div className={`rounded-2xl p-1`}>
                    {nextMeeting ? (
                        <SingleTimeAlertCard
                            type="meeting"
                            title={t('next_meeting', 'Prochaine Réunion')}
                            dateTime={nextMeeting.dateTime}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>}
                            pulseColorClass="bg-violet-500"
                            openCreateModal={openModal}
                            onCardClick={onAlertCardClick}
                            alertData={{ type: 'meeting', ...nextMeeting, eventName: nextMeeting.title || nextMeeting.name }}
                            t={t}
                        />
                    ) : (
                        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl h-full w-full futuristic-card text-color-text-secondary`}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 mb-3"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>
                            <p className="text-lg font-semibold text-color-text-primary text-center mb-2">{t('no_upcoming_meetings', 'Aucune réunion à venir')}</p>
                            <p className="text-sm text-color-text-secondary text-center">{t('add_new_meeting_hint', 'Planifiez de nouvelles réunions pour rester connecté.')}</p>
                            <motion.button
                                onClick={() => openModal('addMeeting')}
                                className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700`}
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