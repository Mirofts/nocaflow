// components/dashboard/TaskItem.js
import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isPast, isToday, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';

export const TaskItem = ({ task, onToggle, onDelete, onEdit, t }) => {
    const { isDarkMode } = useTheme();

    const priorityMap = {
        urgent: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M12 11.5a3 3 0 1 0 0 7 3 3 0 0 0 0-7Z"/><path d="M12 2C8.68 2 6 4.68 6 8a6 6 0 0 0 5.09 5.92c.32.32.69.64 1.11.9L22 22 20 20l-3.51-3.51A6 6 0 0 0 12 2Z"/></svg> },
        normal: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg> },
        cold: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M2 12h20"/><path d="M12 2V22"/><path d="m4 16 1.4-1.4A4.5 4.5 0 0 1 8.8 12c.7-.7 1.5-1 2.3-1.2l.9-.1C13 10.5 14 10 14 9a2 2 0 0 0-2-2c-.7 0-1.4.2-2 .5L8 6"/><path d="m20 8-1.4 1.4A4.5 4.5 0 0 1 15.2 12c-.7.7-1.5 1-2.3 1.2l-.9.1C11 13.5 10 14 10 15a2 2 0 0 0 2 2c.7 0-1.4-.2-2-.5L16 18"/></svg> }
    };

    const deadline = task.deadline ? parseISO(task.deadline) : null;
    const isDeadlineValid = deadline && isValid(deadline);
    const deadlineColor = isDeadlineValid && isPast(deadline) && !isToday(deadline) && !task.completed 
        ? 'text-red-400' 
        : isDeadlineValid && isToday(deadline) && !task.completed 
        ? 'text-amber-400' 
        : 'text-color-text-secondary'; 

    return(
        <div className="futuristic-card flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-color-bg-hover group">
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => onToggle(task.id)} 
              className={`form-checkbox h-5 w-5 text-pink-500 rounded focus:ring-pink-500 cursor-pointer flex-shrink-0
                         ${isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-color-border-input bg-color-bg-input-field'}`}
            />
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">{priorityMap[task.priority]?.icon || priorityMap.normal.icon}</div>
            <div className="flex-grow min-w-0">
                <p className={`truncate text-sm ${task.completed ? 'line-through text-color-text-tertiary' : 'text-color-text-primary'}`}>{task.title}</p>
                {isDeadlineValid && <span className={`block text-xs mt-0.5 ${deadlineColor}`}>{t('deadline', 'Échéance')}: {format(deadline,'dd/MM/yy', {locale:fr})}</span>}
            </div>
            <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(task)} 
                  className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-color-bg-hover'}`} 
                  title={t('edit', 'Modifier')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-color-text-secondary"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                </button>
                <button 
                  onClick={() => onDelete(task.id)} 
                  className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-red-500/80 hover:text-red-500' : 'hover:bg-red-100 text-red-500 hover:text-red-600'}`} 
                  title={t('delete', 'Supprimer')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        </div>
    );
};