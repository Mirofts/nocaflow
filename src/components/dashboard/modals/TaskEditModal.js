// src/components/dashboard/modals/TaskEditModal.js
import React, { useState, useEffect } from 'react'; // <-- L'import manquant est ici
import { ModalWrapper } from './ModalWrapper';
import { format, parseISO } from 'date-fns';

// On définit le même "priorityMap" que dans TaskItem.js pour la cohérence
const priorityMap = {
    urgent: {
        label: 'Urgent',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="text-white"><path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16"/></svg>
    },
    normal: {
        label: 'Normal',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>
    },
    cold: {
        label: 'Froid',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M22.5 16.4l-3.2-1.8 3.2-2.6c.7-.5.7-1.5 0-2-.7-.5-1.8-.5-2.5 0L16 11.8V7.5c0-1-.8-1.8-1.8-1.8h-4.4c-1 0-1.8.8-1.8 1.8v4.3L3.8 9.9c-.7-.5-1.8-.5-2.5 0-.7.5-.7 1.5 0 2l3.2 1.8-3.2 2.6c-.7.5-.7 1.5 0 2 .3.2.7.4 1.2.4s.9-.2 1.2-.4l4.2-3.4v4.3c0 1 .8 1.8 1.8 1.8h4.4c1 0 1.8-.8 1.8-1.8v-4.3l4.2 3.4c.3.2.7.4 1.2.4s.9-.2 1.2-.4c.7-.5.7-1.5 0-2z"/></svg>
    }
};

const priorityClasses = {
    urgent: 'bg-orange-500 text-white',
    normal: 'bg-sky-500 text-white',
    cold: 'bg-blue-400 text-white'
};

const TaskEditModal = ({ task, onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('normal');
    const [deadline, setDeadline] = useState('');
    
    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setPriority(task.priority || 'normal');
            setDeadline(task.deadline ? format(parseISO(task.deadline), 'yyyy-MM-dd') : '');
        }
    }, [task]);

    if (!task) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...task, title, priority, deadline: deadline || null });
        onClose();
    };

    return (
        <ModalWrapper title={t('edit_task_title', 'Modifier la tâche')} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label htmlFor="task-title" className="block text-sm font-medium text-color-text-secondary mb-2">
                        {t('task_title_label', 'Titre de la tâche')}
                    </label>
                    <input
                        type="text"
                        id="task-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 rounded-md bg-color-bg-input-field border border-color-border-input focus:ring-2 focus:ring-indigo-500 text-color-text-primary"
                        required
                    />
                </div>

                <div>
                    <span className="block text-sm font-medium text-color-text-secondary mb-2">
                        {t('priority_label', 'Priorité')}
                    </span>
                    <div className="flex justify-center items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1.5">
                        {Object.entries(priorityMap).map(([key, value]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setPriority(key)}
                                className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${
                                    priority === key ? priorityClasses[key] : 'text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {value.icon}
                                <span>{t(key, value.label)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="task-deadline" className="block text-sm font-medium text-color-text-secondary mb-2">
                        {t('deadline_label', 'Échéance')}
                    </label>
                    <input
                        id="task-deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full p-2 rounded-md bg-color-bg-input-field border border-color-border-input focus:ring-2 focus:ring-indigo-500 text-color-text-primary"
                    />
                </div>
                
                <div className="pt-4">
                    <button type="submit" className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg !mt-8 main-action-button">
                        {t('save_changes', 'Sauvegarder les changements')}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default TaskEditModal;