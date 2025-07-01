// components/dashboard/GanttChartPlanning.js
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'; // Re-verified: ensure all hooks are explicitly imported
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import { format, addDays, differenceInDays, parseISO, isValid, isToday as checkIsToday, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { initialMockData } from '../../lib/mockData';
import { useTheme } from '../../context/ThemeContext';

// Composant pour une barre de tâche individuelle dans le Gantt
const GanttTaskBar = ({ task, totalDaysInPeriod, startDate, t, onEditTask, onValidateTask }) => {
    const { isDarkMode } = useTheme();
    const taskStart = parseISO(task.startDate);
    const taskEnd = parseISO(task.endDate);

    if (!isValid(taskStart) || !isValid(taskEnd)) {
        return null;
    }

    // Calcul de l'offset et de la durée en jours par rapport à la période affichée
    const offsetDays = differenceInDays(taskStart, startDate);
    const durationDays = differenceInDays(taskEnd, taskStart) + 1;

    // Calcul des pourcentages pour le positionnement et la largeur
    const leftPercentage = (offsetDays / totalDaysInPeriod) * 100;
    const widthPercentage = (durationDays / totalDaysInPeriod) * 100;

    // Déterminer la couleur basée sur la complétion ou un statut
    const barColor = task.completed
        ? 'bg-green-500/80'
        : task.color === 'pink' ? 'bg-pink-500/80'
        : task.color === 'red' ? 'bg-red-500/80'
        : task.color === 'violet' ? 'bg-violet-500/80'
        : task.color === 'blue' ? 'bg-blue-500/80'
        : task.color === 'cyan' ? 'bg-cyan-500/80'
        : task.color === 'orange' ? 'bg-orange-500/80'
        : task.color === 'teal' ? 'bg-teal-500/80'
        : 'bg-gray-500/80';

    return (
        <motion.div
            className={`absolute h-8 rounded-md shadow-md ${barColor} flex items-center justify-between px-2 overflow-hidden group`}
            style={{
                left: `${leftPercentage}%`,
                width: `${widthPercentage}%`,
                top: '50%',
                transform: 'translateY(-50%)'
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, originX: 0 }}
        >
            <span className="text-white text-xs font-semibold truncate mr-2">
                {task.title}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Edit Button */}
                <motion.button
                    onClick={(e) => { e.stopPropagation(); onEditTask(task); }} // Stop propagation to prevent triggering row click
                    className={`p-1 rounded-full transition-colors
                                ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-white/30 text-white'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('edit_task', 'Modifier la tâche')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                </motion.button>
                {/* Validate/Complete Button (only if not already completed) */}
                {!task.completed && (
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); onValidateTask(task.id); }} // Stop propagation
                        className={`p-1 rounded-full transition-colors
                                    ${isDarkMode ? 'hover:bg-green-700 text-green-300' : 'hover:bg-green-200/50 text-green-700'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={t('validate_task', 'Valider la tâche')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};


// Composant principal du Planning (Gantt Chart simplifié)
const GanttChartPlanning = forwardRef((props, ref) => {
    const { t, onAddTask, className = '', staffMembers, clients, onSave } = props;
    const ganttContainerRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentViewDate, setCurrentViewDate] = useState(new Date());
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fullscreenChangeHandler = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', fullscreenChangeHandler);
        document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);

        return () => {
            document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
            document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
            document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler);
            document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler);
        };
    }, []);

    useImperativeHandle(ref, () => ({
        toggleFullScreen: () => { // toggleFullScreen is defined here as a function within useCallback for useImperativeHandle
            const element = ganttContainerRef.current;
            if (element) {
                if (!document.fullscreenElement) {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullScreen) {
                        document.msExitFullScreen();
                    }
                }
            }
        }
    }));

    const startDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
    const endDate = addDays(startDate, 29);
    const totalDaysInPeriod = differenceInDays(endDate, startDate) + 1;

    const [ganttTasks, setGanttTasks] = useState(props.initialTasks || []);

    useEffect(() => {
        setGanttTasks(props.initialTasks);
    }, [props.initialTasks]);

    const tasksByPerson = (ganttTasks || []).reduce((acc, task) => {
        const taskStart = parseISO(task.startDate);
        const taskEnd = parseISO(task.endDate);

        if (isValid(taskStart) && isValid(taskEnd) && taskStart <= endDate && taskEnd >= startDate) {
            if (!acc[task.person]) {
                acc[task.person] = [];
            }
            acc[task.person].push(task);
        }
        return acc;
    }, {});

    const sortedPeople = Object.keys(tasksByPerson).sort();

    const daysHeader = Array.from({ length: totalDaysInPeriod }, (_, i) => {
        const date = addDays(startDate, i);
        const isToday = checkIsToday(date);
        return {
            date: format(date, 'dd'),
            dayOfWeek: format(date, 'EE', { locale: fr }).charAt(0),
            isToday: isToday
        };
    });

    const handlePrevMonth = useCallback(() => {
        setCurrentViewDate(subMonths(currentViewDate, 1));
    }, [currentViewDate]);

    const handleNextMonth = useCallback(() => {
        setCurrentViewDate(addMonths(currentViewDate, 1));
    }, [currentViewDate]);

    const handleEditTask = useCallback((task) => {
        onAddTask(task);
    }, [onAddTask]);

    const handleValidateTask = useCallback((taskId) => {
        const taskToUpdate = ganttTasks.find(t => t.id === taskId);
        if (taskToUpdate) {
            const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed, progress: taskToUpdate.completed ? 0 : 100 };
            onSave(updatedTask);
        }
    }, [ganttTasks, onSave]);


    return (
        <DashboardCard
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>
            }
            title={t('gantt_planning_title', 'Planning des Tâches Équipe')}
            className={`${className} ${isFullScreen ? 'fixed inset-0 z-[1000] rounded-none' : ''}`}
            onFullscreenClick={() => { // Call toggleFullScreen directly here
                const element = ganttContainerRef.current;
                if (element) {
                    if (!document.fullscreenElement) {
                        if (element.requestFullscreen) {
                            element.requestFullscreen();
                        } else if (element.mozRequestFullScreen) {
                            element.mozRequestFullScreen();
                        } else if (element.webkitRequestFullscreen) {
                            element.webkitRequestFullscreen();
                        } else if (element.msRequestFullscreen) {
                            element.msRequestFullscreen();
                        }
                    } else {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        } else if (document.msExitFullScreen) {
                            document.msExitFullScreen();
                        }
                    }
                }
            }}
        >
            <div ref={ganttContainerRef} className={`h-full w-full flex flex-col ${isFullScreen ? (isDarkMode ? 'bg-gray-900' : 'bg-color-bg-primary') : ''}`}>
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <button onClick={handlePrevMonth}
                            className={`p-2 rounded-full transition-colors
                                        ${isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h3 className={`text-lg font-bold text-center flex-grow ${isDarkMode ? 'text-white' : 'text-color-text-primary'}`}>
                        {format(currentViewDate, 'MMMM', { locale: fr })} {format(currentViewDate, 'yyyy')}
                    </h3>
                    <button onClick={handleNextMonth}
                            className={`p-2 rounded-full transition-colors
                                        ${isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                <div className="overflow-x-auto custom-scrollbar pb-4 flex-grow">
                    <div className="inline-grid gap-1.5" style={{
                        gridTemplateColumns: `minmax(150px, 1fr) repeat(${totalDaysInPeriod}, minmax(30px, 1fr))`,
                        minHeight: `${sortedPeople.length * 48 + (sortedPeople.length ? 40 : 0)}px`
                    }}>
                        <div className={`sticky left-0 z-20 p-2 font-bold text-sm border-r border-color-border-primary
                                        ${isDarkMode ? 'bg-color-bg-secondary text-slate-400' : 'bg-color-bg-secondary text-color-text-secondary'}`}>
                            {t('team_member', 'Membre Équipe')}
                        </div>
                        {daysHeader.map((day, index) => (
                            <div key={index}
                                className={`flex flex-col items-center justify-center p-1 border-b border-color-border-primary text-xs font-semibold
                                            ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-color-bg-tertiary text-color-text-secondary'}
                                            ${day.isToday ? (isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100/50') : ''}`}>
                                <span className={isDarkMode ? 'text-slate-400' : 'text-color-text-primary'}>{day.dayOfWeek}</span>
                                <span className={isDarkMode ? 'text-slate-400' : 'text-color-text-primary'}>{day.date}</span>
                            </div>
                        ))}

                        {sortedPeople.length > 0 ? (
                            sortedPeople.map(person => (
                                <React.Fragment key={person}>
                                    <div className={`sticky left-0 z-10 p-2 font-semibold text-sm border-r border-color-border-primary border-t
                                                    ${isDarkMode ? 'bg-color-bg-secondary text-white border-slate-700/50' : 'bg-color-bg-secondary text-color-text-primary border-color-border-primary'} flex items-center`}>
                                        {person}
                                    </div>
                                    <div
                                        className={`relative h-12 border-b border-color-border-primary
                                                    ${isDarkMode ? 'bg-slate-800/20' : 'bg-color-bg-primary'} cursor-pointer`}
                                        style={{ gridColumn: `span ${totalDaysInPeriod}` }}
                                        onClick={() => onAddTask({ date: startDate.toISOString(), person: person })}
                                    >
                                        {(tasksByPerson[person] || [])
                                            .map(task => (
                                                <GanttTaskBar
                                                    key={task.id}
                                                    task={task}
                                                    totalDaysInPeriod={totalDaysInPeriod}
                                                    startDate={startDate}
                                                    t={t}
                                                    onEditTask={handleEditTask}
                                                    onValidateTask={handleValidateTask}
                                                />
                                            ))
                                        }
                                    </div>
                                </React.Fragment>
                            ))
                        ) : (
                            <div className={`sticky left-0 z-10 p-4 text-sm text-center
                                            ${isDarkMode ? 'bg-color-bg-secondary text-slate-400' : 'bg-color-bg-secondary text-color-text-secondary'}`}
                                style={{ gridColumn: `span ${totalDaysInPeriod + 1}` }}>
                                {t('no_gantt_tasks', 'Aucune tâche dans le planning. Ajoutez-en une pour voir votre FLOW !')}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-4 text-center flex-shrink-0">
                    <motion.button
                        onClick={() => onAddTask({ date: startDate.toISOString() })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="main-action-button bg-gradient-to-r from-pink-500 to-violet-500 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        {t('add_gantt_task', 'Ajouter une tâche au Planning')}
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
});

export default GanttChartPlanning;