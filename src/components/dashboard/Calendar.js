// components/dashboard/Calendar.js
import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay, isToday as checkIsToday, parseISO, isValid, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Calendar = ({ onDayClick, t, className = '', tasks, meetings, projects }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const { isDarkMode } = useTheme();

    const allTasks = tasks;
    const allMeetings = meetings;
    const allProjects = projects;

    const startDate = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startDayOfWeek = (getDay(startDate) + 6) % 7; // Lundi est 0, Dimanche est 6

    // Create array for calendar days, including nulls for leading empty days
    const calendarDays = Array(startDayOfWeek).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

    const getEventsForDay = (day) => {
        if (!day) return [];
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const tasksOnDay = (allTasks || []).filter(t => t.deadline && isValid(parseISO(t.deadline)) && isSameDay(parseISO(t.deadline), date));
        const meetingsOnDay = (allMeetings || []).filter(m => m.dateTime && isValid(parseISO(m.dateTime)) && isSameDay(parseISO(m.dateTime), date));
        const projectsOnDay = (allProjects || []).filter(p => p.deadline && isValid(parseISO(p.deadline)) && isSameDay(parseISO(p.deadline), date));
        return [...tasksOnDay, ...meetingsOnDay, ...projectsOnDay];
    };

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDayClickWrapper = (day) => {
        if (!day) return;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(date);
        onDayClick(date, getEventsForDay(day));
    };

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        } title={t('calendar_title', 'Calendrier')} className={className}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <button
                        onClick={handlePrevMonth}
                        className={`p-2 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h3 className="text-lg font-bold text-color-text-primary text-center flex-grow">
                        {format(currentMonth, 'MMMM', { locale: fr })} {format(currentMonth, 'yyyy')}
                    </h3>
                    <button
                        onClick={handleNextMonth}
                        className={`p-2 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-color-text-secondary font-bold mb-2 flex-shrink-0">
                    {weekDays.map(d => <div key={d}>{d}</div>)}
                </div>
                {/* Adjusted min-h for cells and overall flex-grow to ensure all days fit/scroll */}
                <div className="grid grid-cols-7 gap-1 flex-grow overflow-y-auto custom-scrollbar">
                    {calendarDays.map((day, i) => {
                        const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                        const isCurrentDay = day && checkIsToday(date);
                        const isSelected = selectedDate && day && isSameDay(selectedDate, date);
                        const eventsCount = day ? getEventsForDay(day).length : 0;

                        return (
                            <motion.div
                                key={`day-${i}`}
                                className={`relative flex flex-col items-center justify-center p-1 min-h-[45px] md:min-h-[55px] lg:min-h-[65px] rounded-lg cursor-pointer transition-all text-sm
                                ${day ? '' : 'invisible pointer-events-none'}
                                ${isCurrentDay ? (isDarkMode ? 'bg-pink-500/20 text-white font-bold' : 'bg-violet-200 text-violet-800 font-bold') : 'text-color-text-primary'}
                                ${isSelected ? 'border-2 border-pink-400' : ''}`}
                                whileHover={{ scale: 1.05, zIndex: 10, backgroundColor: isDarkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(168, 85, 247, 0.2)' }}
                                onClick={() => handleDayClickWrapper(day)}
                            >
                                {day}
                                {eventsCount > 0 && (
                                    // Adjusted positioning for the badge
                                    <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 flex items-center justify-center text-xs rounded-full 
                                                     ${isDarkMode ? 'bg-violet-500 text-white' : 'bg-purple-600 text-white'} animate-bounce-slow`}
                                         style={{ animationDuration: `${0.5 + eventsCount * 0.1}s` }}>
                                        {eventsCount}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </DashboardCard>
    );
};

export default Calendar;