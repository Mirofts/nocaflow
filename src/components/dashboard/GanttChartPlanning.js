// src/components/dashboard/GanttChartPlanning.js
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
// DashboardCard is usually a wrapper, not directly used inside GanttChartPlanning for its UI
// import { DashboardCard } from './DashboardCard'; // This import might be unnecessary here

import { format, eachDayOfInterval, isSameDay, addDays, startOfMonth, endOfMonth, getDay, isWeekend, differenceInDays, isValid, parseISO, subMonths, addMonths, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import GanttTaskFormModal from './modals/GanttTaskFormModal';

const GanttColorsMap = {
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    gray: 'bg-gray-500',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600',
    teal: 'bg-teal-500',
    orange: 'bg-orange-500',
};

const isLightColor = (colorValue) => ['amber', 'cyan', 'green', 'teal', 'orange'].includes(colorValue);

const GanttChartPlanning = forwardRef(({ initialTasks, t, staffMembers, clients, className = '' }, ref) => { // Removed onAddTask, onSave as DashboardCard wraps it
    const [currentDate, setCurrentDate] = useState(new Date());
    const containerRef = React.useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false); // Managed by DashboardCard now
    const { isDarkMode } = useTheme();

    const [localTasks, setLocalTasks] = useState(initialTasks);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({});

    useEffect(() => {
        setLocalTasks(initialTasks);
    }, [initialTasks]);

    useImperativeHandle(ref, () => ({
        // This is still needed for DashboardCard to call it for fullscreen
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
        const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);

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

    const daysInView = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const viewStartDate = useMemo(() => startOfDay(daysInView[0]), [daysInView]);
    const viewEndDate = useMemo(() => startOfDay(daysInView[daysInView.length - 1]), [daysInView]);

    const totalDaysInMonth = daysInView.length; // This is correct, it will be 28, 29, 30, or 31

    const getTaskBarStyle = useCallback((task) => {
        const taskStart = isValid(parseISO(task.startDate)) ? startOfDay(parseISO(task.startDate)) : null;
        const taskEnd = isValid(parseISO(task.endDate)) ? startOfDay(parseISO(task.endDate)) : null;
        if (!taskStart || !taskEnd) return { display: 'none' };

        // Determine the actual start and end dates within the current view
        const effectiveStartDate = taskStart < viewStartDate ? viewStartDate : taskStart;
        const effectiveEndDate = taskEnd > viewEndDate ? viewEndDate : taskEnd;
        
        // If the task is completely outside the current view, hide it
        if (effectiveStartDate > effectiveEndDate || taskEnd < viewStartDate || taskStart > viewEndDate) {
            return { display: 'none' };
        }

        // Calculate offset from the beginning of the *viewable month*
        // The number of days from the start of the view (e.g., July 1st) to the task's effective start
        const startOffsetDays = differenceInDays(effectiveStartDate, viewStartDate);

        // Calculate the duration of the task *within the view*, inclusive of start and end days
        const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate) + 1;

        // Calculate left and width as percentages relative to the total days in view
        // The totalDaysInMonth is the actual number of days in the month (e.g., 31 for July)
        const left = (startOffsetDays / totalDaysInMonth) * 100;
        const width = (durationDays / totalDaysInMonth) * 100;
        
        return {
            left: `${left}%`,
            width: `${width}%`
        };
    }, [viewStartDate, viewEndDate, totalDaysInMonth]);


    const handlePrevMonth = useCallback(() => setCurrentDate(prev => subMonths(prev, 1)), []);
    const handleNextMonth = useCallback(() => setCurrentDate(prev => addMonths(prev, 1)), []);

    const allPeople = useMemo(() => {
        const staffNames = staffMembers?.map(m => m.name) || [];
        const clientNames = clients?.map(c => c.name) || [];
        const taskPeople = localTasks?.map(t => t.person).filter(Boolean) || [];
        return [...new Set([...staffNames, ...clientNames, ...taskPeople])].sort();
    }, [staffMembers, clients, localTasks]);

    const handleCellClick = useCallback((date, personName) => {
        if (personName) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            setModalData({
                startDate: formattedDate,
                endDate: formattedDate,
                person: personName,
            });
            setShowModal(true);
        }
    }, []);

    const handleModalSave = (task) => {
        setLocalTasks(prev => {
            if (task.id) {
                // Update existing task
                return prev.map(t => t.id === task.id ? task : t);
            } else {
                // Add new task with a temporary unique ID if none exists (important for React keys)
                return [...prev, { ...task, id: `gt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }];
            }
        });
        setShowModal(false);
    };

    return (
        // The outer div should not have the shadow/border/bg, as DashboardCard provides that
        // This component focuses purely on the Gantt chart content structure
        <div className={`relative flex flex-col h-full ${className}`}>
            {/* Header for Month Navigation and Add Task - MOVED TO DASHBOARDCARD */}

            <div className="overflow-auto flex-grow" ref={containerRef}>
                {/* min-w-[calc(10rem + var(--day-column-width) * 31)] - dynamically calculate minimum width
                    where 10rem is for 'Personne / Client' column and 31 is max days.
                    Let's use a base large min-width and let flex handle it for design aesthetic. */}
                <div className="min-w-[1400px] relative"> {/* Increased min-width for better spacing and to accommodate all days cleanly */}
                    {/* Date Header Row */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                        <div className="w-48 p-3 font-bold text-sm text-gray-700 dark:text-gray-200 flex-shrink-0">
                            {t('team_member', 'Personne / Client')}
                        </div>
                        {daysInView.map((day, i) => (
                            <div
                                key={i}
                                // flex-1 ensures even distribution, min-w prevents collapse on smaller screens
                                className={`flex-1 min-w-[40px] text-center text-xs p-3 border-l border-gray-100 dark:border-gray-600 transition-colors
                                            ${isWeekend(day) ? 'bg-gray-100 dark:bg-gray-700/60 text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                <div className="font-semibold">{format(day, 'EEE', { locale: fr })}</div> {/* Day of week */}
                                <div>{format(day, 'dd', { locale: fr })}</div> {/* Day number */}
                            </div>
                        ))}
                    </div>

                    {/* Task Rows */}
                    {allPeople.map((person, idx) => (
                        <div key={idx} className="flex relative border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <div className="w-48 p-3 text-sm truncate bg-white dark:bg-gray-800 sticky left-0 z-5 border-r border-gray-200 dark:border-gray-700 flex items-center">
                                {person}
                            </div>
                            {daysInView.map((day, j) => (
                                <div
                                    key={j}
                                    className={`flex-1 min-w-[40px] h-16 border-l border-gray-100 dark:border-gray-700 cursor-pointer transition-colors
                                                ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                                ${isWeekend(day) ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-blue-50 dark:hover:bg-gray-700/30'}`}
                                    onClick={() => handleCellClick(day, person)}
                                />
                            ))}
                            {localTasks.filter(t => t.person === person).map((task) => (
                                <motion.div
                                    key={task.id || `temp-${task.person}-${task.title}-${task.startDate}`} // Fallback key for robustness
                                    className={`absolute h-8 rounded-md px-3 text-xs font-medium flex items-center shadow-lg cursor-pointer transition-all duration-300 ease-out whitespace-nowrap overflow-hidden z-10
                                                ${GanttColorsMap[task.color] || 'bg-blue-500'} ${isLightColor(task.color) ? 'text-gray-900' : 'text-white'}`}
                                    style={getTaskBarStyle(task)}
                                    whileHover={{ scale: 1.02, zIndex: 12 }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent cell click
                                        setModalData(task);
                                        setShowModal(true);
                                    }}
                                >
                                    {task.title}
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <GanttTaskFormModal
                    initialData={modalData}
                    onSave={handleModalSave}
                    onClose={() => setShowModal(false)}
                    allStaffMembers={staffMembers}
                    allClients={clients}
                    t={t}
                />
            )}
        </div>
    );
});

GanttChartPlanning.displayName = 'GanttChartPlanning';
export default GanttChartPlanning;