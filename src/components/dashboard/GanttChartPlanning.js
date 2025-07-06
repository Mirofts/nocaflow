// src/components/dashboard/GanttChartPlanning.js
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
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

const GanttChartPlanning = forwardRef(({ initialTasks, t, staffMembers, clients, onSaveTask, className = '' }, ref) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const containerRef = React.useRef(null);
    const { isDarkMode } = useTheme();

    // localTasks are directly derived from initialTasks now
    // This ensures initialTasks is the single source of truth from dashboard.js
    const localTasks = useMemo(() => initialTasks, [initialTasks]);

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({});

    useImperativeHandle(ref, () => ({
        toggleFullScreen: () => {
            // Ensure containerRef.current is the element you want to fullscreen
            // and that it's a direct result of a user gesture.
            // Logging to debug:
            console.log("toggleFullScreen called on GanttChartPlanning. currentRef:", containerRef.current);
            if (containerRef.current) {
                if (!document.fullscreenElement) {
                    containerRef.current.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                    });
                } else {
                    document.exitFullscreen();
                }
            } else {
                console.warn("Fullscreen containerRef is null, cannot toggle fullscreen.");
            }
        }
    }));

    const daysInView = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const viewStartDate = useMemo(() => startOfDay(daysInView[0]), [daysInView]);
    const viewEndDate = useMemo(() => startOfDay(daysInView[daysInView.length - 1]), [daysInView]);

    const totalDaysInViewSpan = useMemo(() => differenceInDays(viewEndDate, viewStartDate) + 1, [viewStartDate, viewEndDate]);

    const getTaskBarStyle = useCallback((task) => {
        const taskStart = isValid(parseISO(task.startDate)) ? startOfDay(parseISO(task.startDate)) : null;
        const taskEnd = isValid(parseISO(task.endDate)) ? startOfDay(parseISO(task.endDate)) : null;

        // Debugging invalid dates
        if (!taskStart) {
            console.error(`Task "${task.title}" has an invalid start date: "${task.startDate}"`);
            return { display: 'none' };
        }
        if (!taskEnd) {
            console.error(`Task "${task.title}" has an invalid end date: "${task.endDate}"`);
            return { display: 'none' };
        }

        const effectiveStartDate = taskStart < viewStartDate ? viewStartDate : taskStart;
        const effectiveEndDate = taskEnd > viewEndDate ? viewEndDate : taskEnd;
        
        // If the task is completely outside the current view, hide it
        if (effectiveStartDate > effectiveEndDate || taskEnd < viewStartDate || taskStart > viewEndDate) {
            // console.log(`Task "${task.title}" is outside view. Effective Start: ${format(effectiveStartDate, 'yyyy-MM-dd')}, Effective End: ${format(effectiveEndDate, 'yyyy-MM-dd')}, View Start: ${format(viewStartDate, 'yyyy-MM-dd')}, View End: ${format(viewEndDate, 'yyyy-MM-dd')}`);
            return { display: 'none' };
        }

        const startOffsetDays = differenceInDays(effectiveStartDate, viewStartDate);
        const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate) + 1; // +1 to include both start and end days

        const left = (startOffsetDays / totalDaysInViewSpan) * 100;
        const width = (durationDays / totalDaysInViewSpan) * 100;
        
        // Detailed console log for task bar positioning
        // console.log(`--- Task: ${task.title} ---`);
        // console.log(`Raw Dates: Start: ${task.startDate}, End: ${task.endDate}`);
        // console.log(`Parsed Dates: Start: ${format(taskStart, 'yyyy-MM-dd')}, End: ${format(taskEnd, 'yyyy-MM-dd')}`);
        // console.log(`View Range: ${format(viewStartDate, 'yyyy-MM-dd')} to ${format(viewEndDate, 'yyyy-MM-dd')}`);
        // console.log(`Effective Range: ${format(effectiveStartDate, 'yyyy-MM-dd')} to ${format(effectiveEndDate, 'yyyy-MM-dd')}`);
        // console.log(`Start Offset Days: ${startOffsetDays}, Duration Days: ${durationDays}`);
        // console.log(`Total Days in View Span: ${totalDaysInViewSpan}`);
        // console.log(`Calculated Style: Left: ${left.toFixed(2)}%, Width: ${width.toFixed(2)}%`);

        return {
            left: `${left}%`,
            width: `${width}%`
        };
    }, [viewStartDate, viewEndDate, totalDaysInViewSpan]);


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

    // This function now directly calls the prop passed from dashboard.js
    const handleModalSave = useCallback((task) => {
        onSaveTask(task); // Call the parent's save handler
        setShowModal(false);
    }, [onSaveTask]);


    return (
        <div className={`relative flex flex-col h-full ${className}`}>
            {/* Month Navigation and Add Task button - Moved here from DashboardCard for direct control */}
            <div className="flex items-center justify-center p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 sticky top-0">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label={t('previous_month', 'Mois précédent')}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <span className="text-sm font-semibold text-gray-800 dark:text-white mx-2">
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </span>
                <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label={t('next_month', 'Mois suivant')}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="ml-4 bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span>{t('add_task', 'Ajouter une tâche')}</span>
                </button>
            </div>

            <div className="overflow-auto flex-grow" ref={containerRef}>
                {/* min-width set dynamically to ensure all days fit, and allows horizontal scrolling */}
                {/* 192px (w-48 for person column) + (totalDaysInViewSpan * 40px/day for avg day width) */}
                <div className="relative" style={{ minWidth: `${192 + (totalDaysInViewSpan * 40)}px` }}>
                    {/* Date Header Row */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 sticky top-[48px] z-10"> {/* Adjusted top to clear month nav */}
                        <div className="w-48 p-2 font-bold text-sm text-gray-700 dark:text-gray-200 flex-shrink-0">
                            {t('team_member', 'Personne / Client')}
                        </div>
                        {daysInView.map((day, i) => (
                            <div
                                key={i}
                                className={`flex-1 min-w-[40px] text-center text-xs p-2 border-l border-gray-100 dark:border-gray-600 transition-colors
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
                            <div className="w-48 p-2 text-sm truncate bg-white dark:bg-gray-800 sticky left-0 z-5 border-r border-gray-200 dark:border-gray-700 flex items-center">
                                {person}
                            </div>
                            {daysInView.map((day, j) => (
                                <div
                                    key={j}
                                    className={`flex-1 min-w-[40px] h-10 border-l border-gray-100 dark:border-gray-700 cursor-pointer transition-colors`}
                                    // Height reduced to h-10 (40px)
                                    onClick={() => handleCellClick(day, person)}
                                >
                                    {isSameDay(day, new Date()) && (
                                        <div className="h-full bg-blue-50 dark:bg-blue-900/20" />
                                    )}
                                    {isWeekend(day) && !isSameDay(day, new Date()) && (
                                        <div className="h-full bg-gray-50 dark:bg-gray-700/50" />
                                    )}
                                    <div className="absolute inset-0 hover:bg-blue-50 dark:hover:bg-gray-700/30"></div> {/* Hover overlay */}
                                </div>
                            ))}
                            {localTasks.filter(t => t.person === person).map((task) => (
                                <motion.div
                                    key={task.id || `temp-${task.person}-${task.title}-${task.startDate}`} // Fallback key
                                    className={`absolute h-6 top-2 rounded-md px-2 text-xs font-medium flex items-center shadow-lg cursor-pointer transition-all duration-300 ease-out whitespace-nowrap overflow-hidden z-10
                                                ${GanttColorsMap[task.color] || 'bg-blue-500'} ${isLightColor(task.color) ? 'text-gray-900' : 'text-white'}`}
                                    // Height reduced to h-6 (24px)
                                    style={getTaskBarStyle(task)}
                                    whileHover={{ scale: 1.02, zIndex: 12 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
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
                    onSave={handleModalSave} // This now calls onSaveTask from dashboard.js
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