// src/components/dashboard/GanttChartPlanning.js
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
// Ensure all necessary date-fns functions are imported
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
};

const isLightColor = (colorValue) => ['amber', 'cyan', 'green'].includes(colorValue);

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

    const getTaskBarStyle = useCallback((task) => {
        const taskStart = isValid(parseISO(task.startDate)) ? startOfDay(parseISO(task.startDate)) : null;
        const taskEnd = isValid(parseISO(task.endDate)) ? startOfDay(parseISO(task.endDate)) : null;
        if (!taskStart || !taskEnd) return { display: 'none' };

        const effectiveStartDate = taskStart < viewStartDate ? viewStartDate : taskStart;
        const effectiveEndDate = taskEnd > viewEndDate ? viewEndDate : taskEnd;
        if (effectiveStartDate > effectiveEndDate) return { display: 'none' };

        const startOffsetDays = differenceInDays(effectiveStartDate, viewStartDate);
        const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate) + 1;

        const left = (startOffsetDays / totalDaysInMonth) * 100;
        const width = (durationDays / totalDaysInMonth) * 100;
        return {
            left: `${left}%`,
            width: `${Math.min(width, 100 - left)}%`
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
        setLocalTasks(prev => [...prev, task]);
        setShowModal(false);
    };

    return (
        <div className={`relative flex flex-col ${className}`}>            
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700">
                    ➕ {t('add_task', 'Ajouter une tâche')}
                </button>
            </div>

            <div className="overflow-auto" ref={containerRef}>
                <div className="min-w-[1000px]">
                    <div className="flex border-b">
                        <div className="w-40 p-2 font-bold text-sm">{t('team_member', 'Personne')}</div>
                        {daysInView.map((day, i) => (
                            <div key={i} className="flex-1 text-center text-xs p-2">
                                {format(day, 'dd/MM', { locale: fr })}
                            </div>
                        ))}
                    </div>

                    {allPeople.map((person, idx) => (
                        <div key={idx} className="flex relative border-b">
                            <div className="w-40 p-2 text-sm truncate">{person}</div>
                            {daysInView.map((day, j) => (
                                <div key={j} className="flex-1 h-12 border-l hover:bg-blue-50" onClick={() => handleCellClick(day, person)} />
                            ))}
                            {localTasks.filter(t => t.person === person).map((task, tIdx) => (
                                <div
                                    key={task.id || `${person}-${tIdx}`}
                                    className={`absolute h-6 top-1 rounded px-2 text-xs font-semibold flex items-center shadow-md ${GanttColorsMap[task.color] || 'bg-blue-400'} ${isLightColor(task.color) ? 'text-black' : 'text-white'}`}
                                    style={getTaskBarStyle(task)}
                                >
                                    {task.title}
                                </div>
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
