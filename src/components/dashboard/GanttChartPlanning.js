// src/components/dashboard/GanttChartPlanning.js
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
// Ensure all necessary date-fns functions are imported
import { format, eachDayOfInterval, isSameDay, addDays, startOfMonth, endOfMonth, getDay, isWeekend, differenceInDays, isValid, parseISO, subMonths, addMonths, startOfDay } from 'date-fns';
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

// Helper function to determine if text should be dark based on background color
const isLightColor = (colorValue) => {
    return ['amber', 'cyan', 'green'].includes(colorValue);
};

const GanttChartPlanning = forwardRef(({ initialTasks, t, staffMembers, clients, onAddTask, onSave, className = '', noContentPadding = false }, ref) => {
    const [tasks, setTasks] = useState(initialTasks);
    const [currentDate, setCurrentDate] = useState(new Date()); // Represents the month currently displayed
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

    // Memoize the days in view for the current month - DECLARE THIS FIRST
    const daysInView = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    // Now, define viewStartDate and viewEndDate using daysInView
    const viewStartDate = daysInView[0];
    const viewEndDate = daysInView[daysInView.length - 1];

    // Normalize view start/end dates to start of local day for consistent comparison
    // Use the already defined viewStartDate and viewEndDate directly in dependencies.
    const viewStartDateNormalized = useMemo(() => startOfDay(viewStartDate), [viewStartDate]);
    const viewEndDateNormalized = useMemo(() => startOfDay(viewEndDate), [viewEndDate]);

    const totalDaysInMonth = daysInView.length; // This remains correct

    // Function to calculate style for each task bar accurately
    const getTaskBarStyle = useCallback((task) => {
        // Parse dates from task and normalize to start of local day
        const taskStart = startOfDay(parseISO(task.startDate));
        const taskEnd = startOfDay(parseISO(task.endDate));
        
        if (!isValid(taskStart) || !isValid(taskEnd)) {
            return { display: 'none' }; // Hide invalid tasks
        }

        // Clip task duration to the current view boundaries (also normalized)
        const effectiveStartDate = taskStart < viewStartDateNormalized ? viewStartDateNormalized : taskStart;
        const effectiveEndDate = taskEnd > viewEndDateNormalized ? viewEndDateNormalized : taskEnd;

        // If the clipped task is entirely outside the view, hide it
        // Or if it's an invalid interval after clipping
        if (effectiveStartDate > effectiveEndDate || effectiveStartDate > viewEndDateNormalized || effectiveEndDate < viewStartDateNormalized) {
            return { display: 'none' };
        }
        
        // Calculate position relative to the current month's start date (normalized)
        const startOffsetDays = differenceInDays(effectiveStartDate, viewStartDateNormalized);
        // Calculate duration: count includes both start and end day.
        const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate) + 1; 

        const left = (startOffsetDays / totalDaysInMonth) * 100;
        const width = (durationDays / totalDaysInMonth) * 100;

        // Clamp width to ensure it doesn't exceed the row and avoids overflow issues
        const clampedWidth = Math.min(width, 100 - left);

        return {
            left: `${left}%`,
            width: `${clampedWidth}%`,
        };
    }, [viewStartDateNormalized, viewEndDateNormalized, totalDaysInMonth]);


    // Month navigation handlers
    const handlePrevMonth = useCallback(() => {
        setCurrentDate(prev => subMonths(prev, 1)); // Go to previous month
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentDate(prev => addMonths(prev, 1)); // Go to next month
    }, []);

    // Prepare all unique people (staff + clients + any unique people from tasks)
    const allPeople = useMemo(() => {
        const staffNames = Array.isArray(staffMembers) ? staffMembers.map(m => m.name) : [];
        const clientNames = Array.isArray(clients) ? clients.map(c => c.name) : [];
        const taskPeople = Array.isArray(initialTasks) ? initialTasks.map(t => t.person).filter(Boolean) : [];
        const uniquePeople = [...new Set([...staffNames, ...clientNames, ...taskPeople])];
        return uniquePeople.sort();
    }, [staffMembers, clients, initialTasks]);

    // Handle cell click to add a new task
    const handleCellClick = useCallback((date, personName) => {
        // Only open modal if a person is associated with the row
        if (personName) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            onAddTask({
                startDate: formattedDate,
                endDate: formattedDate,
                person: personName
            });
        }
    }, [onAddTask]);


    return (
        <DashboardCard
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>
            }
            title={t('gantt_planning_title', 'Planification des Tâches d\'Équipe')}
            className={`relative flex flex-col ${className} ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
            noContentPadding={true}
        >
            {/* Header with Month Navigation */}
            <div className={`flex items-center justify-between p-4 flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'} border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
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

            {/* Main Planning Area - now the overflow is here */}
            <div className={`flex flex-col flex-1 overflow-auto custom-scrollbar`} ref={containerRef}>
                {/* Fixed Header Row for Days */}
                <div className={`grid gap-px sticky top-0 z-10`} style={{ gridTemplateColumns: `minmax(150px, 0.5fr) repeat(${totalDaysInMonth}, minmax(0, 1fr))` }}>
                    <div className={`p-2 font-bold text-sm ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-color-bg-secondary text-color-text-primary'} sticky left-0 z-20 border-b border-color-border-primary`}>
                        {t('team_member', 'Membre / Client')}
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

                {/* Task Rows for each person */}
                {allPeople.length > 0 ? (
                    allPeople.map((person, pIndex) => (
                        <div key={pIndex} className="grid gap-px relative" style={{ gridTemplateColumns: `minmax(150px, 0.5fr) repeat(${totalDaysInMonth}, minmax(0, 1fr))` }}>
                            <div className={`h-12 p-2 font-medium text-sm flex items-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-color-bg-primary text-color-text-primary'} sticky left-0 z-10 border-b border-color-border-primary`}>
                                <span className="truncate">{person}</span>
                            </div>
                            {daysInView.map((day, dIndex) => (
                                <div
                                    key={`${pIndex}-${dIndex}`}
                                    className={`h-12 p-2 border-b border-color-border-primary ${
                                        isWeekend(day) ? (isDarkMode ? 'bg-slate-800' : 'bg-gray-50') : (isDarkMode ? 'bg-gray-800' : 'bg-color-bg-primary')
                                    } ${isSameDay(day, new Date()) ? (isDarkMode ? 'bg-pink-500/10' : 'bg-violet-100') : ''}`}
                                    onClick={() => handleCellClick(day, person)} // Add onClick here
                                ></div>
                            ))}
                            {tasks
                                .filter(task => task.person === person)
                                .map((task, tIndex) => {
                                    const barStyle = getTaskBarStyle(task);
                                    const barColorClass = GanttColorsMap[task.color] || GanttColorsMap.blue;
                                    const textColorClass = isLightColor(task.color) ? 'text-black' : 'text-white';

                                    return (
                                        <motion.div
                                            key={task.id || tIndex}
                                            className={`absolute h-8 rounded-full px-2 text-xs font-semibold flex items-center shadow-md cursor-pointer ${barColorClass} ${textColorClass} ${task.completed ? 'opacity-50' : ''}`}
                                            style={{
                                                ...barStyle,
                                                top: `${10 + (tIndex % 2) * 20}%`, // Adjust top for stacking
                                                zIndex: 20
                                            }}
                                            whileHover={{ scale: 1.03, boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}
                                            title={`${task.title} (${format(parseISO(task.startDate), 'dd/MM', { locale: fr })} - ${format(parseISO(task.endDate), 'dd/MM', { locale: fr })})`}
                                            onClick={() => onAddTask(task)}
                                        >
                                            <span className="truncate">{task.title}</span>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-slate-500 py-10">
                        {t('no_gantt_tasks', 'Aucune tâche de planification à afficher.')}
                    </div>
                )}
                {allPeople.length === 0 && <div className="h-full"></div>}
            </div>

            {/* Add Task Button - moved outside the scrollable area but still within DashboardCard */}
            <div className={`p-4 border-t border-color-border-primary flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'}`}>
                <motion.button
                    onClick={() => onAddTask({})}
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