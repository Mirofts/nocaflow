// src/components/dashboard/TaskItem.js
import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isPast, isToday, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export const TaskItem = ({ task, onToggle, onDelete, onEdit, onAssignTeam, t }) => {

    const priorityMap = {
        urgent: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="text-orange-500"><path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16"/></svg>,
            style: 'font-bold text-orange-400'
        },
        normal: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>,
            style: ''
        },
        cold: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400"><path d="M22.5 16.4l-3.2-1.8 3.2-2.6c.7-.5.7-1.5 0-2-.7-.5-1.8-.5-2.5 0L16 11.8V7.5c0-1-.8-1.8-1.8-1.8h-4.4c-1 0-1.8.8-1.8 1.8v4.3L3.8 9.9c-.7-.5-1.8-.5-2.5 0-.7.5-.7 1.5 0 2l3.2 1.8-3.2 2.6c-.7.5-.7 1.5 0 2 .3.2.7.4 1.2.4s.9-.2 1.2-.4l4.2-3.4v4.3c0 1 .8 1.8 1.8 1.8h4.4c1 0 1.8-.8 1.8-1.8v-4.3l4.2 3.4c.3.2.7.4 1.2.4s.9-.2 1.2-.4c.7-.5.7-1.5 0-2z"/></svg>,
            style: 'text-color-text-secondary'
        }
    };

    const deadline = task.deadline ? parseISO(task.deadline) : null;
    const isDeadlineValid = deadline && isValid(deadline);
    const deadlineIsToday = isDeadlineValid && isToday(deadline) && !task.completed;
    const deadlineIsPast = isDeadlineValid && isPast(deadline) && !isToday(deadline) && !task.completed;
    
    const deadlineColor = deadlineIsPast ? 'text-red-400' : deadlineIsToday ? 'text-amber-400' : 'text-color-text-secondary';
    
    const handleTaskClick = () => {
        if (onToggle) {
            onToggle(task.id, !task.completed);
        }
    };

    return(
        // Le `div` principal est un `div` simple maintenant, sans les props `value` et `as` pour le drag-and-drop
        <div
            className={`futuristic-card flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                task.completed ? 'opacity-30' : 'hover:bg-color-bg-hover' // Opacité à 60% pour les tâches terminées
            }`}
            onClick={handleTaskClick}
        >
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                {priorityMap[task.priority]?.icon || priorityMap.normal.icon}
            </div>
            
            <div className="flex-grow min-w-0">
                <p className={`truncate text-sm ${
                    task.completed ? 'line-through text-color-text-tertiary' : 'text-color-text-primary'
                } ${priorityMap[task.priority]?.style}`}>
                    {task.title}
                </p>
                
                <div className="flex items-center gap-3 text-xs mt-1">
                    {isDeadlineValid && !task.completed && (
                        <span className={`flex items-center gap-1 ${deadlineColor}`}>
                            {deadlineIsToday && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>}
                            {t('deadline', 'Échéance')}: {format(deadline, 'dd/MM/yy', { locale: fr })}
                        </span>
                    )}

                    {task.completed && (
                        <span className="text-xs text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            {t('deletion_in_24h', 'Suppression dans 24h')}
                        </span>
                    )}
                </div>
            </div>

            <div 
              className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={() => onAssignTeam(task)} 
                  className="p-1.5 rounded-md transition-colors text-color-text-secondary hover:bg-color-bg-tertiary" 
                  title={t('assign_team', 'Assigner à l\'équipe')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </button>
                <button 
                  onClick={() => onEdit(task)} 
                  className="p-1.5 rounded-md transition-colors text-color-text-secondary hover:bg-color-bg-tertiary"
                  title={t('edit', 'Modifier')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/></svg>
                </button>
                <button 
                  onClick={() => onDelete(task.id)} 
                  className="p-1.5 rounded-md transition-colors text-red-500/80 hover:bg-red-500/10 hover:text-red-500"
                  title={t('delete', 'Supprimer')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        </div>
    );
};