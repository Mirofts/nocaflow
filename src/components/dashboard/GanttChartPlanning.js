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

const GanttChartPlanning = forwardRef(({ initialTasks, t, staffMembers, clients, className = '' }, ref) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const containerRef = React.useRef(null);
    const { isDarkMode } = useTheme();

    // localTasks are now directly managed by initialTasks prop, which comes from dashboard.js data
    const [localTasks, setLocalTasks] = useState(initialTasks);

    // Update localTasks when initialTasks prop changes
    useEffect(() => {
        setLocalTasks(initialTasks);
    }, [initialTasks]);

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({});

    useImperativeHandle(ref, () => ({
        toggleFullScreen: () => {
            // This function is called directly by DashboardCard's fullscreen button.
            // It needs to request fullscreen on a valid element.
            // Using containerRef.current ensures we try to fullscreen the scrollable area itself.
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

    // This useEffect is not strictly necessary for fullscreen functionality
    // but keeps track of the fullscreen state if needed elsewhere
    useEffect(() => {
        const handleFullscreenChange = () => {
            // This state isn't directly used for rendering the fullscreen button anymore,
            // as DashboardCard manages that based on its own internal state.
            // But it can be useful for other UI adjustments if needed.
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

        if (!taskStart || !taskEnd) {
            console.log(`Task ${task.title} has invalid dates: Start ${task.startDate}, End ${task.endDate}`);
            return { display: 'none' };
        }

        // Determine the actual start and end dates within the current view
        const effectiveStartDate = taskStart < viewStartDate ? viewStartDate : taskStart;
        const effectiveEndDate = taskEnd > viewEndDate ? viewEndDate : taskEnd;

        // If the task is completely outside the current view, hide it
        if (effectiveStartDate > effectiveEndDate || taskEnd < viewStartDate || taskStart > viewEndDate) {
            return { display: 'none' };
        }

        // Calculate offset from the beginning of the *viewable month*
        const startOffsetDays = differenceInDays(effectiveStartDate, viewStartDate);

        // Calculate the duration of the task *within the view*, inclusive of start and end days
        const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate) + 1;

        // Calculate left and width as percentages relative to the total days in view
        const left = (startOffsetDays / totalDaysInViewSpan) * 100;
        const width = (durationDays / totalDaysInViewSpan) * 100;
        
        // Console log for debugging new task positions
        // console.log(`Task: ${task.title}, Start: ${task.startDate}, End: ${task.endDate}`);
        // console.log(`viewStartDate: ${format(viewStartDate, 'yyyy-MM-dd')}, viewEndDate: ${format(viewEndDate, 'yyyy-MM-dd')}`);
        // console.log(`effectiveStartDate: ${format(effectiveStartDate, 'yyyy-MM-dd')}, effectiveEndDate: ${format(effectiveEndDate, 'yyyy-MM-dd')}`);
        // console.log(`startOffsetDays: ${startOffsetDays}, durationDays: ${durationDays}`);
        // console.log(`Calculated Left: ${left}%, Width: ${width}%`);

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
        // Filter out empty person names and ensure uniqueness
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

    // This function now just sends the task data to the parent
    const handleModalSave = useCallback((task) => {
        // We don't modify localTasks here directly for new tasks;
        // instead, we rely on the parent (dashboard.js) to manage the main state (data.ganttTasks)
        // and then pass the updated initialTasks prop down.
        // For existing tasks edited through the modal, we update localTasks for immediate visual feedback.
        setLocalTasks(prev => {
            if (task.id) {
                // If it's an existing task being edited
                return prev.map(t => t.id === task.id ? task : t);
            } else {
                // If it's a new task, it needs to be added via the parent's handler
                // We don't add it to localTasks here, as the parent will send it back via initialTasks prop
                // This scenario means the modal needs to trigger a parent function.
                // Re-think: The modal is shown *by* this component, so it should update local state first for responsiveness
                // and then trigger a parent save (if needed for persistence).
                // Let's add it to localTasks with a temp ID and let parent handle persistence with its own ID system.
                // The dashboard.js handleSaveGanttTask will ultimately provide the final ID.
                 return [...prev, { ...task, id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }];
            }
        });
        setShowModal(false);
    }, []);


    return (
        <div className={`relative flex flex-col h-full ${className}`}>
            {/* Month Navigation - Integrated with DashboardCard now */}
            <div className="flex items-center justify-center p-2">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <span className="text-sm font-semibold text-gray-800 dark:text-white mx-2">
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </span>
                <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
                <button onClick={() => setShowModal(true)} className="ml-4 bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span>{t('add_task', 'Ajouter une tâche')}</span>
                </button>
            </div>

            <div className="overflow-auto flex-grow border-t border-gray-200 dark:border-gray-700" ref={containerRef}>
                {/* min-width set to ensure all days fit, and allows horizontal scrolling */}
                <div className="relative" style={{ minWidth: `${48 * 4 + (totalDaysInViewSpan * 50)}px` }}> {/* Base Person Col + (Days * Avg Day Width) */}
                    {/* Date Header Row */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                        <div className="w-48 p-3 font-bold text-sm text-gray-700 dark:text-gray-200 flex-shrink-0">
                            {t('team_member', 'Personne / Client')}
                        </div>
                        {daysInView.map((day, i) => (
                            <div
                                key={i}
                                className={`flex-1 min-w-[50px] text-center text-xs p-3 border-l border-gray-100 dark:border-gray-600 transition-colors
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
                                    className={`flex-1 min-w-[50px] h-16 border-l border-gray-100 dark:border-gray-700 cursor-pointer transition-colors
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
                    onSave={handleModalSave} // Modal calls this, which then updates localTasks
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