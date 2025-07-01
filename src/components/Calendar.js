// components/dashboard/Calendar.js
import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay, isToday as checkIsToday, parseISO, isValid, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { initialMockData } from '../../lib/mockData';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

const Calendar = ({ onDayClick, t, className = '' }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const { isDarkMode } = useTheme(); // Use isDarkMode to conditionally style

    const allTasks = initialMockData.tasks;
    const allMeetings = initialMockData.meetings;
    const allProjects = initialMockData.projects;

    const startDate = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startDayOfWeek = (getDay(startDate) + 6) % 7;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const hasEvents = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const tasksOnDay = (allTasks || []).some(t => t.deadline && isValid(parseISO(t.deadline)) && isSameDay(parseISO(t.deadline), date));
        const meetingsOnDay = (allMeetings || []).some(m => m.dateTime && isValid(parseISO(m.dateTime)) && isSameDay(parseISO(m.dateTime), date));
        const projectsOnDay = (allProjects || []).some(p => p.deadline && isValid(parseISO(p.deadline)) && isSameDay(parseISO(p.deadline), date));
        return tasksOnDay || meetingsOnDay || projectsOnDay;
    };

    const getEventsForDay = (day) => {
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
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(date);
        onDayClick(date, getEventsForDay(day));
    };

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        } title={t('calendar_title', 'Calendrier')} className={className}>
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <button 
                    onClick={handlePrevMonth} 
                    // Use theme variables for button text and hover background
                    className={`p-2 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                {/* Month and year text color using theme variables */}
                <h3 className="text-lg font-bold text-color-text-primary text-center flex-grow">
                    {format(currentMonth, 'MMMM', { locale: fr })} {format(currentMonth, 'yyyy')}
                </h3>
                <button 
                    onClick={handleNextMonth} 
                    // Use theme variables for button text and hover background
                    className={`p-2 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>

            {/* Weekday labels text color using theme variables */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-color-text-secondary font-bold mb-2 flex-shrink-0">
                {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-grow overflow-y-auto custom-scrollbar" style={{maxHeight: 'calc(100% - 70px - 28px)'}}>
                {Array(startDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`} className="p-1 aspect-square" />)}
                {days.map(day => {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isCurrentDay = checkIsToday(date);
                    const isSelected = selectedDate && isSameDay(selectedDate, date);

                    return (
                        <motion.div
                            key={day}
                            // Hover background color
                            whileHover={{ scale: 1.1, zIndex: 10, backgroundColor: isDarkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(168, 85, 247, 0.2)' }}
                            onClick={() => handleDayClickWrapper(day)}
                            className={`relative flex items-center justify-center p-1 aspect-square rounded-lg cursor-pointer transition-all text-sm
                                // Current day background and text color
                                ${isCurrentDay ? (isDarkMode ? 'bg-pink-500/20 text-white font-bold' : 'bg-violet-200 text-violet-800 font-bold') : 'text-color-text-primary'}
                                ${isSelected ? 'border-2 border-pink-400' : ''}`} // Border color can remain accent
                        >
                            {day}
                            {hasEvents(day) && (
                                <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce-slow"></div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </DashboardCard>
    );
};

export default Calendar;