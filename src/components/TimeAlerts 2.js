// components/dashboard/TimeAlerts.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, parseISO, isValid, addDays, addHours, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { DashboardCard } from './DashboardCard'; // Make sure DashboardCard is imported

const TimeAlert = ({ type, title, dateTime, icon, pulseColorClass, openModal, t }) => {
    const { isDarkMode } = useTheme();
    const targetDate = parseISO(dateTime);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        if (!isValid(targetDate)) {
            console.warn(`Invalid date provided for ${type} alert: ${dateTime}`);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime(); // Difference in milliseconds

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, overdue: true };
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

            return { days, hours, minutes, overdue: false };
        };

        const updateCountdown = () => {
            setTimeLeft(calculateTimeLeft());
        };

        updateCountdown(); // Initial calculation
        const timer = setInterval(updateCountdown, 60 * 1000); // Update every minute

        return () => clearInterval(timer);
    }, [dateTime, targetDate, type]);

    const displayTime = t('time_left_format', '{{days}} jour(s) {{hours}} h {{minutes}} min')
        .replace('{{days}}', timeLeft.days)
        .replace('{{hours}}', timeLeft.hours)
        .replace('{{minutes}}', timeLeft.minutes);

    const isUrgent = timeLeft.days < 1 && !timeLeft.overdue;
    const pulseEffect = isUrgent || timeLeft.overdue; // This variable is not currently used for pulsing effect but can be re-integrated if desired.

    return (
        <div className="flex-1 flex flex-col items-center p-4">
            <div className="flex items-center justify-center mb-3"> {/* Adjusted for inline elements */}
                <div className={`flex items-center justify-center p-3 rounded-full ${pulseColorClass} bg-opacity-30`}>
                    {icon}
                </div>
                {/* Plus button moved next to the icon */}
                <motion.button
                    onClick={() => openModal(type === 'deadline' ? 'addDeadline' : 'addMeeting')}
                    className={`p-2 rounded-full ml-3 transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={type === 'deadline' ? t('add_deadline', 'Ajouter une échéance') : t('schedule_meeting', 'Planifier une réunion')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </motion.button>
            </div>
            {/* Changed text-pink-400 to conditional color */}
            <h4 className={`text-center text-lg font-semibold ${isDarkMode ? 'text-pink-400' : 'text-purple-700'}`}>
                {title}
            </h4>
            {/* Changed text-pink-300 to conditional color */}
            <p className={`text-center text-sm font-medium ${isDarkMode ? 'text-pink-300' : 'text-purple-600'} mt-1`}>
                {displayTime}
            </p>
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
            noContentPadding={true} // Ensure content fills the card
        >
            <div className={`grid grid-cols-1 md:grid-cols-2 flex-grow p-4 gap-4 ${isDarkMode ? 'bg-color-bg-secondary' : 'bg-white'}`}>
                <div className={`rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-color-border-primary' : 'border-gray-200'} ${isDarkMode ? 'bg-color-bg-tertiary' : 'bg-gray-50'}`}>
                    {nextDeadline ? (
                        <TimeAlert
                            type="deadline"
                            title={t('next_deadline', 'Prochaine Deadline')}
                            dateTime={nextDeadline.deadline}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                            pulseColorClass="bg-pink-500"
                            openModal={openModal}
                            t={t}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-color-text-secondary">
                             <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 mb-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <p className="text-lg font-semibold text-color-text-primary">{t('no_upcoming_deadlines', 'Aucune échéance à venir')}</p>
                            <p className="text-sm mt-1">{t('add_new_deadline_hint', 'Ajoutez de nouvelles échéances pour rester organisé.')}</p>
                            {/* Plus button for empty state - kept as-is as it fills purpose */}
                            <motion.button
                                onClick={() => openModal('addDeadline')}
                                className={`p-2 rounded-full mt-3 transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={t('add_deadline', 'Ajouter une échéance')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                            </motion.button>
                        </div>
                    )}
                </div>

                <div className={`rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-color-border-primary' : 'border-gray-200'} ${isDarkMode ? 'bg-color-bg-tertiary' : 'bg-gray-50'}`}>
                    {nextMeeting ? (
                        <TimeAlert
                            type="meeting"
                            title={t('next_meeting', 'Prochaine Réunion')}
                            dateTime={nextMeeting.dateTime}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>}
                            pulseColorClass="bg-violet-500"
                            openModal={openModal}
                            t={t}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-color-text-secondary">
                             <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 mb-2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 2v4a2 2 0 0 0 2 2h4"/><path d="M8 2v4a2 2 0 0 1-2 2H2"/><path d="M12 11h.01"/><path d="M12 15h.01"/></svg>
                            <p className="text-lg font-semibold text-color-text-primary">{t('no_upcoming_meetings', 'Aucune réunion à venir')}</p>
                            <p className="text-sm mt-1">{t('add_new_meeting_hint', 'Planifiez de nouvelles réunions pour rester connecté.')}</p>
                            {/* Plus button for empty state - kept as-is as it fills purpose */}
                            <motion.button
                                onClick={() => openModal('addMeeting')}
                                className={`p-2 rounded-full mt-3 transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={t('schedule_meeting', 'Planifier une réunion')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
};

export default TimeAlerts;