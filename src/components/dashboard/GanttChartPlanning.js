// src/components/dashboard/GanttChartPlanning.js
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { DashboardCard } from './DashboardCard';
import { format, eachDayOfInterval, isSameDay, addDays, startOfMonth, endOfMonth, getDay, isWeekend, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// Couleurs pour le Gantt Chart (doivent correspondre à celles définies dans modals.js pour la sélection)
const GanttColorsMap = {
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    gray: 'bg-gray-500',
};

const GanttChartPlanning = forwardRef(({ initialTasks, t, staffMembers, clients, onAddTask, onSave, className = '', noContentPadding = false }, ref) => {
    const [tasks, setTasks] = useState(initialTasks);
    const [currentDate, setCurrentDate] = useState(new Date());
    const containerRef = React.useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    useImperativeHandle(ref, () => ({
        toggleFullScreen: () => {
            if (containerRef.current) {
                if (!document.fullscreenElement) {
                    containerRef.current.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                    });
                } else {
                    document.exitFullscreen();
                }
            }
        }
    }));

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const getDaysInView = useCallback(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const daysInView = getDaysInView();
    const startDate = daysInView[0];
    const endDate = daysInView[daysInView.length - 1];

    const totalDays = daysInView.length;

    const getTaskStyle = useCallback((task) => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);

        if (!taskStartDate || !taskEndDate || taskStartDate > endDate || taskEndDate < startDate) {
            return { display: 'none' };
        }

        const effectiveStartDate = taskStartDate < startDate ? startDate : taskStartDate;
        const effectiveEndDate = taskEndDate > endDate ? endDate : taskEndDate;

        const startOffsetDays = (effectiveStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const durationDays = (effectiveEndDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;

        const left = (startOffsetDays / totalDays) * 100;
        const width = (durationDays / totalDays) * 100;

        return {
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: task.color ? GanttColorsMap[task.color] : GanttColorsMap['blue'],
        };
    }, [startDate, endDate, totalDays]);

    const handlePrevMonth = () => {
        setCurrentDate(prev => addDays(prev, -totalDays));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => addDays(prev, totalDays));
    };

    const allPeople = [...new Set([
        ...(Array.isArray(staffMembers) ? staffMembers.map(m => m.name) : []),
        ...(Array.isArray(clients) ? clients.map(c => c.name) : []),
        ...(initialTasks || []).map(t => t.person) // Include people from initial tasks
    ])].sort();

    return (
        <DashboardCard
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>
            }
            title={t('gantt_planning_title', 'Planning des tâches d\'équipe')}
            className={`relative flex flex-col ${className} ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
            noContentPadding={true}
        >
            <div className={`flex items-center justify-between p-4 flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'}`}>
                <motion.button
                    onClick={handlePrevMonth}
                    className={`p-2 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </motion.button>
                <h3 className="text-lg font-bold text-color-text-primary flex-grow text-center">
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h3>
                <motion.button
                    onClick={handleNextMonth}
                    className={`p-2 rounded-full transition-colors text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </motion.button>
            </div>

            <div className={`flex flex-col flex-1 overflow-hidden ${noContentPadding ? '' : 'p-4'}`} ref={containerRef}>
                <div className="grid grid-cols-1 gap-1 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header des jours */}
                    <div className="grid gap-px sticky top-0 z-10" style={{ gridTemplateColumns: `150px repeat(${totalDays}, minmax(0, 1fr))` }}>
                        <div className={`p-2 font-bold text-sm ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-color-bg-secondary text-color-text-primary'} sticky left-0 z-20 border-b border-color-border-primary`}>
                            {t('team_member', 'Membre d\'équipe')}
                        </div>
                        {daysInView.map((day, index) => {
                            const isWeekendDay = isWeekend(day);
                            return (
                                <div
                                    key={index}
                                    className={`p-2 text-center text-xs font-semibold border-b border-color-border-primary ${
                                        isWeekendDay ? (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400') : (isDarkMode ? 'bg-gray-700 text-white' : 'bg-color-bg-secondary text-color-text-primary')
                                    } ${isSameDay(day, new Date()) ? (isDarkMode ? 'bg-pink-500/20 text-pink-300' : 'bg-violet-200 text-violet-800') : ''}`}
                                >
                                    {format(day, 'dd', { locale: fr })}
                                    <br />
                                    {format(day, 'EEE', { locale: fr }).charAt(0).toUpperCase()}
                                </div>
                            );
                        })}
                    </div>

                    {/* Lignes de tâches pour chaque personne */}
                    {allPeople.length > 0 ? (
                        allPeople.map((person, pIndex) => (
                            <div key={pIndex} className="grid gap-px relative" style={{ gridTemplateColumns: `150px repeat(${totalDays}, minmax(0, 1fr))` }}>
                                <div className={`p-2 font-medium text-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-color-bg-primary text-color-text-primary'} sticky left-0 z-10 border-b border-color-border-primary`}>
                                    {person}
                                </div>
                                {daysInView.map((day, dIndex) => (
                                    <div
                                        key={`${pIndex}-${dIndex}`}
                                        className={`p-2 border-b border-color-border-primary ${
                                            isWeekend(day) ? (isDarkMode ? 'bg-slate-800' : 'bg-gray-50') : (isDarkMode ? 'bg-gray-800' : 'bg-color-bg-primary')
                                        } ${isSameDay(day, new Date()) ? (isDarkMode ? 'bg-pink-500/10' : 'bg-violet-100') : ''}`}
                                    ></div>
                                ))}
                                {tasks
                                    .filter(task => task.person === person)
                                    .map((task, tIndex) => (
                                        <motion.div
                                            key={task.id || tIndex}
                                            className={`absolute h-4 rounded-full px-2 text-xs font-semibold flex items-center shadow-md cursor-pointer ${GanttColorsMap[task.color] || GanttColorsMap.blue} ${task.completed ? 'opacity-50' : ''}`}
                                            style={{
                                                ...getTaskStyle(task),
                                                top: `${50 + (tIndex % 2) * 20}%`, // Empilement simple pour éviter les chevauchements directs
                                                transform: `translateY(-50%)`,
                                                zIndex: 20
                                            }}
                                            whileHover={{ scale: 1.03, boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}
                                            title={`${task.title} (${format(new Date(task.startDate), 'dd/MM')} - ${format(new Date(task.endDate), 'dd/MM')})`}
                                        >
                                            {task.title}
                                        </motion.div>
                                    ))}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-slate-500 py-10">
                            {t('no_gantt_tasks', 'Aucune tâche de planification à afficher.')}
                        </div>
                    )}
                </div>
            </div>

            <div className={`p-4 border-t border-color-border-primary flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'}`}>
                <motion.button
                    onClick={() => onAddTask()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg main-action-button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    {t('add_gantt_task', 'Ajouter une tâche au Planning')}
                </motion.button>
            </div>
        </DashboardCard>
    );
});

GanttChartPlanning.displayName = 'GanttChartPlanning';
export default GanttChartPlanning;