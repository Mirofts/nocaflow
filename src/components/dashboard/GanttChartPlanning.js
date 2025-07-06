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
    const containerRef = React.useRef(null); // Ref for the scrollable container
    const chartAreaRef = React.useRef(null); // Ref for the actual chart content to fullscreen
    const { isDarkMode } = useTheme();

const [localTasks, setLocalTasks] = useState(initialTasks);

useEffect(() => {
    setLocalTasks(initialTasks);
}, [initialTasks]);

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({});

    useImperativeHandle(ref, () => ({
        toggleFullScreen: () => {
            console.log("GanttChartPlanning toggleFullScreen called. Target Ref:", chartAreaRef.current);
            const elementToFullscreen = chartAreaRef.current;

            if (elementToFullscreen) {
                if (!document.fullscreenElement) {
                    console.log("Attempting requestFullscreen on:", elementToFullscreen);
                    elementToFullscreen.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                    });
                } else {
                    console.log("Attempting exitFullscreen.");
                    document.exitFullscreen();
                }
            } else {
                console.warn("Fullscreen element (chartAreaRef.current) is null, cannot toggle fullscreen.");
            }
        }
    }));

    const daysInView = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
return eachDayOfInterval({ start, end }).map(startOfDay);
    }, [currentDate]);

    const viewStartDate = useMemo(() => startOfDay(daysInView[0]), [daysInView]);
    const viewEndDate = useMemo(() => startOfDay(daysInView[daysInView.length - 1]), [daysInView]);

    const totalDaysInViewSpan = useMemo(() => differenceInDays(viewEndDate, viewStartDate) + 1, [viewStartDate, viewEndDate]);

const getTaskBarStyle = useCallback((task) => {
    const parseDateUTC = (dateStr) => {
        const parts = dateStr.split('-');
        return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])); // mois = 0-indexed
    };

    const taskStart = task.startDate ? parseDateUTC(task.startDate) : null;
    const taskEnd = task.endDate ? parseDateUTC(task.endDate) : null;

    if (!taskStart || !taskEnd || isNaN(taskStart) || isNaN(taskEnd)) {
        console.error(`Task "${task.title}" (ID: ${task.id || 'new'}) has invalid dates.`);
        return { display: 'none' };
    }

    const effectiveStartDate = taskStart < viewStartDate ? viewStartDate : taskStart;
    const effectiveEndDate = taskEnd > viewEndDate ? viewEndDate : taskEnd;

    if (effectiveStartDate > effectiveEndDate || taskEnd < viewStartDate || taskStart > viewEndDate) {
        return { display: 'none' };
    }

    const startOffsetDays = differenceInDays(effectiveStartDate, viewStartDate);
    const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate) + 1;

const dayWidthPx = 40;
const left = 192 + startOffsetDays * dayWidthPx;
const width = durationDays * dayWidthPx;

return {
  left: `${left}px`,
  width: `${width}px`
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
            console.log(`Cell clicked: Date ${formattedDate}, Person ${personName}. Preparing modal for new task.`);
            setModalData({
                startDate: formattedDate,
                endDate: formattedDate,
                person: personName,
                title: '', // Ensure title is initialized
                color: 'blue' // Ensure a default color is set
            });
            setShowModal(true);
        }
    }, []);

    const handleModalSave = useCallback((task) => {
        console.log("handleModalSave (in GanttChartPlanning) triggered onSaveTask with:", task);
        onSaveTask(task); // IMPORTANT: Pass the task up to dashboard.js to update the main state
        setShowModal(false);
    }, [onSaveTask]);


    return (
        <div className={`relative flex flex-col h-full ${className}`}>
            {/* Month Navigation and Add Task button - NOW CONTROLLED BY THIS COMPONENT */}
            <div className="flex items-center justify-center p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-20 sticky top-0">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label={t('previous_month', 'Mois précédent')}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <span className="text-sm font-semibold text-gray-800 dark:text-white mx-2">
                    {/* FIX: Correct date-fns format string here */}
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
                    onClick={() => {
                        console.log("Add Task button clicked. Opening modal for new task.");
                        setModalData({ // Initialize all fields for a new task
                            startDate: format(currentDate, 'yyyy-MM-dd'),
                            endDate: format(currentDate, 'yyyy-MM-dd'),
                            person: '',
                            title: '',
                            color: 'blue' // Default color
                        });
                        setShowModal(true);
                    }}
                    className="ml-4 bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span>{t('add_task', 'Ajouter une tâche')}</span>
                </button>
            </div>

            <div className="overflow-auto flex-grow" ref={containerRef}> {/* This div handles the main scrolling */}
                <div className="relative" ref={chartAreaRef} style={{ minWidth: `${192 + (totalDaysInViewSpan * 40)}px` }}> {/* This is the element that will go fullscreen */}
                    {/* Date Header Row */}
                   <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-900 sticky top-[48px] z-30">
                        <div className="w-48 p-2 font-bold text-sm text-gray-700 dark:text-gray-200 flex-shrink-0">
                            {t('team_member', 'Personne / Client')}
                        </div>
                        {daysInView.map((day, i) => (
                            <div
                                key={i}
                                className={`flex-1 min-w-[40px] text-center text-xs p-2 border-l border-gray-100 dark:border-gray-600 transition-colors
                                            ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                            ${isWeekend(day) && !isSameDay(day, new Date()) ? 'bg-gray-100 dark:bg-gray-700/60 text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                <div className="font-semibold">{format(day, 'EEE', { locale: fr })}</div>
                                <div>{format(day, 'dd', { locale: fr })}</div>
                            </div>
                        ))}
                    </div>

                    {/* Task Rows */}
                    {allPeople.map((person, idx) => (
<div
  key={idx}
  className="flex relative border-b border-gray-200 dark:border-gray-700 last:border-b-0"
  style={{ minHeight: `${rowHeight}px` }}
>                            <div className="w-48 p-2 text-sm truncate bg-white dark:bg-gray-800 sticky left-0 z-5 border-r border-gray-200 dark:border-gray-700 flex items-center">
                                {person}
                            </div>
{daysInView.map((day, j) => (
  <div
    key={j}
    className={`flex-1 min-w-[40px] border-l border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-gray-700/30
                ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                ${isWeekend(day) && !isSameDay(day, new Date()) ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
    style={{ height: `${rowHeight}px` }}
    onClick={() => handleCellClick(day, person)}
  />
))}
     
{localTasks.map((task) => {
  const rowIndex = allPeople.findIndex(p => p === task.person);
  if (rowIndex === -1) return null;

  const taskTop = rowIndex * rowHeight + 2;

  return (
    <motion.div
      key={task.id || `temp-${task.person}-${task.title}-${task.startDate}`}
      className={`absolute h-6 rounded-md px-2 text-xs font-medium flex items-center shadow-lg cursor-pointer transition-all duration-300 ease-out whitespace-nowrap overflow-hidden z-10
        ${GanttColorsMap[task.color] || 'bg-blue-500'} ${isLightColor(task.color) ? 'text-gray-900' : 'text-white'}`}
      style={{ ...getTaskBarStyle(task), top: `${taskTop}px` }}
      whileHover={{ scale: 1.02, zIndex: 12 }}
      onClick={(e) => {
        e.stopPropagation();
        setModalData(task);
        setShowModal(true);
      }}
    >
      {task.title}
    </motion.div>
  );
})}



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