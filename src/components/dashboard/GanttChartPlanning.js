// src/components/dashboard/GanttChartPlanning.js
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
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

const GanttChartPlanning = forwardRef(({ initialTasks, t, staffMembers, clients, onAddTask, onSave, className = '', noContentPadding = false }, ref) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const containerRef = React.useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { isDarkMode } = useTheme();

    const [localTasks, setLocalTasks] = useState(initialTasks);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({});

    useEffect(() => {
        setLocalTasks(initialTasks);
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

    const totalDaysInMonth = daysInView.length;
    // Define a fixed width for each day column to ensure all days fit and are consistently sized
    // 1200px (min-width) - 48px (person column width) = 1152px available for days
    // 1152px / 31 days approx = ~37px per day. Let's make it 40px for clarity and ensure it scales
    const dayColumnWidth = 40; // in pixels

    const getTaskBarStyle = useCallback((task) => {
        const taskStart = isValid(parseISO(task.startDate)) ? startOfDay(parseISO(task.startDate)) : null;
        const taskEnd = isValid(parseISO(task.endDate)) ? startOfDay(parseISO(task.endDate)) : null;
        if (!taskStart || !taskEnd) return { display: 'none' };

        const effectiveStartDate = taskStart < viewStartDate ? viewStartDate : taskStart;
        const effectiveEndDate = taskEnd > viewEndDate ? viewEndDate : taskEnd;
        
        if (effectiveStartDate > effectiveEndDate || taskEnd < viewStartDate || taskStart > viewEndDate) {
            return { display: 'none' };
        }

        const startOffsetDays = differenceInDays(effectiveStartDate, viewStartDate);
        const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate) + 1; // +1 to include both start and end days

        // Calculate left and width based on pixel values now, as columns have fixed pixel widths
        const left = startOffsetDays * dayColumnWidth;
        const width = durationDays * dayColumnWidth;
        
        return {
            left: `${left}px`,
            width: `${width}px`
        };
    }, [viewStartDate, viewEndDate, dayColumnWidth]);


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
                // Add new task with a temporary unique ID
                return [...prev, { ...task, id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }];
            }
        });
        setShowModal(false);
    };

    return (
        <div className={`relative flex flex-col ${className} bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden`}>
            {/* Header for Month Navigation and Add Task */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        aria-label="Previous Month"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {format(currentDate, 'MMMM yyyy', { locale: fr })}
                    </h2>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        aria-label="Next Month"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span>{t('add_task', 'Ajouter une tâche')}</span>
                </button>
            </div>

            <div className="overflow-auto flex-grow" ref={containerRef}>
                <div className="relative" style={{ minWidth: `${(allPeople.length > 0 ? 48 : 0) + (totalDaysInMonth * dayColumnWidth)}px` }}> {/* Dynamically set minWidth */}
                    {/* Date Header Row - Now fixed top and scrolls horizontally */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10"> {/* Changed top to 0 for sticky */}
                        <div className="w-48 p-3 font-bold text-sm text-gray-700 dark:text-gray-200 flex-shrink-0">
                            {t('team_member', 'Personne / Client')}
                        </div>
                        {daysInView.map((day, i) => (
                            <div
                                key={i}
                                className={`text-center text-xs p-3 border-l border-gray-100 dark:border-gray-600 flex-shrink-0`}
                                style={{ width: `${dayColumnWidth}px` }} // Fixed width for each day
                            >
                                <div className="font-semibold">{format(day, 'EEE', { locale: fr })}</div>
                                <div>{format(day, 'dd', { locale: fr })}</div>
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
                                    className={`h-16 border-l border-gray-100 dark:border-gray-700 cursor-pointer transition-colors flex-shrink-0`}
                                    style={{ width: `${dayColumnWidth}px` }} // Fixed width for each day
                                    onClick={() => handleCellClick(day, person)}
                                />
                            ))}
                            {localTasks.filter(t => t.person === person).map((task) => (
                                <motion.div
                                    key={task.id || `temp-${task.person}-${task.title}-${task.startDate}`} // Fallback key for safety
                                    className={`absolute h-8 rounded-md px-3 text-xs font-medium flex items-center shadow-lg cursor-pointer transition-all duration-300 ease-out whitespace-nowrap overflow-hidden z-10`} // Increased z-index
                                    style={getTaskBarStyle(task)}
                                    whileHover={{ scale: 1.02, zIndex: 12 }} // Higher z-index on hover
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setModalData(task);
                                        setShowModal(true);
                                    }}
                                    // Apply color class dynamically
                                    data-color={task.color} // Custom attribute for potential CSS targeting
                                    className={`${GanttColorsMap[task.color] || 'bg-blue-500'} ${isLightColor(task.color) ? 'text-gray-900' : 'text-white'}`}
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