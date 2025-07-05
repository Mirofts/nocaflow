// components/dashboard/TimeAlerts.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, parseISO, isValid, addDays, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { DashboardCard } from './DashboardCard'; // Make sure DashboardCard is imported

// Define the maximum duration for a full gauge (48 hours in minutes)
const FULL_GAUGE_DURATION_MINUTES = 48 * 60; // 48 hours * 60 minutes/hour

const TimeAlert = ({ type, title, dateTime, icon, pulseColorClass, openModal, t }) => {
    const { isDarkMode } = useTheme();
    const targetDate = parseISO(dateTime);
    // Include seconds in timeLeft state for smoother gauge animation
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, overdue: false });
    // initialTotalMinutes will now always be 48 hours for gauge calculation, or the actual time if less
    const [initialCalculationPointMinutes, setInitialCalculationPointMinutes] = useState(0);

    useEffect(() => {
        if (!isValid(targetDate)) {
            console.warn(`Invalid date provided for ${type} alert: ${dateTime}`);
            return;
        }

        const now = new Date();
        // The initial point from which time remaining is calculated for the gauge's "fullness"
        // This should be the targetDate's position relative to the starting point of the 48-hour window,
        // or 48 hours itself if the event is very far.
        const timeRemainingUntilTarget = differenceInMinutes(targetDate, now);
        
        // If the event is within 48 hours from now, the initialCalculationPoint is 48 hours.
        // If the event is beyond 48 hours, the initialCalculationPoint is the actual time remaining,
        // but we'll cap it at 48 hours for the gauge display.
        // This is a bit tricky, let's simplify: the total range the gauge represents is 48 hours.
        // So, initialCalculationPointMinutes is always FULL_GAUGE_DURATION_MINUTES for the denominator.
        setInitialCalculationPointMinutes(FULL_GAUGE_DURATION_MINUTES);


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
    // The pulseEffect variable is defined but not directly used for a pulsing animation on the card itself,
    // though the pulseColorClass is used for the icon background.
    const pulseEffect = isUrgent || timeLeft.overdue;

    // Calculate progress for the gauge based on 48 hours as the max
    let progressPercentage = 0;
    // We only show progress if the event is within the 48-hour window
    if (timeLeft.totalMinutes > 0 && timeLeft.totalMinutes <= FULL_GAUGE_DURATION_MINUTES) {
        progressPercentage = (timeLeft.totalMinutes / FULL_GAUGE_DURATION_MINUTES) * 100;
    } else if (timeLeft.totalMinutes > FULL_GAUGE_DURATION_MINUTES) {
        // If remaining time is more than 48 hours, gauge should appear full
        progressPercentage = 100;
    } else if (timeLeft.overdue) {
        progressPercentage = 0; // If overdue, gauge is empty
    }
    
    // Determine gauge background color based on type and dark mode
    const gaugeColorClass = type === 'deadline' 
        ? (isDarkMode ? 'bg-pink-600' : 'bg-pink-500') 
        : (isDarkMode ? 'bg-violet-600' : 'bg-violet-500');

    const gaugeTrackColorClass = isDarkMode ? 'bg-slate-700' : 'bg-gray-200';

    return (
        <div className="flex-1 flex flex-col items-center py-3 px-2">
            <div className="flex items-center justify-center mb-2">
                <div className={`flex items-center justify-center p-2 rounded-full ${pulseColorClass} bg-opacity-30`}>
                    {icon}
                </div>
                <motion.button
                    onClick={() => openModal(type === 'deadline' ? 'addDeadline' : 'addMeeting')}
                    className={`p-1.5 rounded-full ml-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('add_deadline', 'Ajouter une échéance') : t('schedule_meeting', 'Planifier une réunion')}
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
                    className={`h-full rounded-full ${gaugeColorClass}`}
                    initial={{ width: '100%' }} // Start full for initial animation
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
            </div>
        </div>
    );
};


const TimeAlerts = ({ projects, meetings, t, lang, openModal }) => {
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
                        <TimeAlert
                            type="deadline"
                            title={t('next_deadline', 'Prochaine Échéance')}
                            dateTime={nextDeadline.deadline}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                            pulseColorClass="bg-pink-500"
                            openModal={openModal}
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
                        <TimeAlert
                            type="meeting"
                            title={t('next_meeting', 'Prochaine Réunion')}
                            dateTime={nextMeeting.dateTime}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>}
                            pulseColorClass="bg-violet-500"
                            openModal={openModal}
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