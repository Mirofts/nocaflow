// components/dashboard/Calendar.js
import React, { useState, useMemo, useCallback } from 'react';
import {
    format,
    getDaysInMonth,
    startOfMonth,
    getDay,
    isSameDay,
    isToday as checkIsToday,
    parseISO,
    isValid,
    addMonths,
    subMonths,
    isFuture
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// --- Icônes pour la liste des événements ---
const TaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const MeetingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DeadlineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;


const Calendar = ({ onDayClick, className = '', tasks, meetings, projects }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const { isDarkMode } = useTheme();

    // --- Logique du calendrier (inchangée) ---
    const allTasks = useMemo(() => tasks || [], [tasks]);
    const allMeetings = useMemo(() => meetings || [], [meetings]);
    const allProjects = useMemo(() => projects || [], [projects]);

    const startDate = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
    const daysInMonth = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
    const startDayOfWeek = useMemo(() => (getDay(startDate) + 6) % 7, [startDate]);
    const calendarDays = useMemo(() =>
        Array(startDayOfWeek).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))
    , [startDayOfWeek, daysInMonth]);

    const getEventsForDay = useCallback((day) => {
        if (!day) return [];
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const tasksOnDay = allTasks.filter(t => t.deadline && isValid(parseISO(t.deadline)) && isSameDay(parseISO(t.deadline), date));
        const meetingsOnDay = allMeetings.filter(m => m.dateTime && isValid(parseISO(m.dateTime)) && isSameDay(parseISO(m.dateTime), date));
        const projectsOnDay = allProjects.filter(p => p.deadline && isValid(parseISO(p.deadline)) && isSameDay(parseISO(p.deadline), date));
        return [...tasksOnDay, ...meetingsOnDay, ...projectsOnDay];
    }, [currentMonth, allTasks, allMeetings, allProjects]);

    const handlePrevMonth = useCallback(() => setCurrentMonth(current => subMonths(current, 1)), []);
    const handleNextMonth = useCallback(() => setCurrentMonth(current => addMonths(current, 1)), []);
    const handleDayClickWrapper = useCallback((day) => {
        if (!day) return;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(date);
        if (onDayClick) onDayClick(date, getEventsForDay(day));
    }, [currentMonth, onDayClick, getEventsForDay]);

    // --- Logique des événements à venir ---
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        const allEvents = [
            ...allTasks.map(t => ({ ...t, type: 'Tâche', date: parseISO(t.deadline), title: t.text })),
            ...allMeetings.map(m => ({ ...m, type: 'Réunion', date: parseISO(m.dateTime), title: m.title })),
            ...allProjects.map(p => ({ ...p, type: 'Deadline', date: parseISO(p.deadline), title: p.name }))
        ];

        return allEvents
            .filter(event => event.date && isValid(event.date) && isFuture(event.date))
            .sort((a, b) => a.date - b.date)
            // MODIFICATION : Changé de 5 à 7
            .slice(0, 7);
    }, [allTasks, allMeetings, allProjects]);

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // --- Structure de la grille ---
    return (
        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-6 w-full ${className}`}>
            {/* Colonne de gauche : Calendrier */}
            <div className="lg:col-span-3 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} aria-label="Mois précédent" className="p-2 rounded-full transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center flex-grow capitalize">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h3>
                    <button onClick={handleNextMonth} aria-label="Mois suivant" className="p-2 rounded-full transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 font-bold mb-2">{weekDays.map(d => <div key={d}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                        const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                        const isCurrentDay = date && checkIsToday(date);
                        const isSelected = selectedDate && date && isSameDay(selectedDate, date);
                        const eventsCount = day ? getEventsForDay(day).length : 0;
                        return (
                            <motion.div key={`day-${i}`} className={`relative flex items-center justify-center p-1 rounded-lg cursor-pointer transition-colors aspect-square ${day ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'invisible'} ${isCurrentDay ? (isDarkMode ? 'bg-pink-500/20 text-white font-bold' : 'bg-violet-200 text-violet-800 font-bold') : 'text-gray-700 dark:text-gray-200'} ${isSelected ? 'border-2 border-pink-400' : 'border border-transparent'}`} whileHover={{ scale: 1.05, zIndex: 10 }} onClick={() => handleDayClickWrapper(day)}>
                                <span className="text-sm font-medium">{day}</span>
                                {eventsCount > 0 && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-500 rounded-full"></div>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Colonne de droite : Événements à venir */}
            <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Prochains évènements</h3>
                {upcomingEvents.length > 0 ? (
                    <ul className="space-y-4">
                        {upcomingEvents.map((event, index) => (
                            <li key={index} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    {event.type === 'Tâche' && <TaskIcon />}
                                    {event.type === 'Réunion' && <MeetingIcon />}
                                    {event.type === 'Deadline' && <DeadlineIcon />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{event.title || 'Sans titre'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                        {format(event.date, "eeee d MMMM 'à' HH:mm", { locale: fr })}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun évènement à venir.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;