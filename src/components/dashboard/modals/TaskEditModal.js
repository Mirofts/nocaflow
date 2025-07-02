// src/components/dashboard/modals/TaskEditModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';

const TaskEditModal = ({ task, onSave, onClose, t }) => {
    const [title, setTitle] = useState(task.title || '');
    const [priority, setPriority] = useState(task.priority || 'normal');
    const [deadline, setDeadline] = useState(task.deadline ? format(parseISO(task.deadline), 'yyyy-MM-dd') : '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        await onSave({ ...task, title: title.trim(), priority, deadline: deadline || null });
        setLoading(false);
        onClose();
    };

    const priorityOptions = [
        { id: 'urgent', text: t('priority_urgent', 'Urgent'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M12 11.5a3 3 0 1 0 0 7 3 3 0 0 0 0-7Z"/><path d="M12 2C8.68 2 6 4.68 6 8a6 6 0 0 0 5.09 5.92c.32.32.69.64 1.11.9L22 22 20 20l-3.51-3.51A6 6 0 0 0 12 2Z"/></svg>, color: 'red' },
        { id: 'normal', text: t('priority_normal', 'Normal'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>, color: 'sky' },
        { id: 'cold', text: t('priority_cold', 'Froid'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M2 12h20"/><path d="M12 2V22"/><path d="m4 16 1.4-1.4A4.5 4.5 0 0 1 8.8 12c.7-.7 1.5-1 2.3-1.2l.9-.1C13 10.5 14 10 14 9a2 2 0 0 0-2-2c-.7 0-1.4.2-2 .5L8 6"/><path d="m20 8-1.4 1.4A4.5 4.5 0 0 1 15.2 12c-.7.7-1.5 1-2.3 1.2l-.9.1C11 13.5 10 14 10 15a2 2 0 0 0 2 2c.7 0-1.4-.2-2-.5L16 18"/></svg>, color: 'slate' }
    ];

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('edit_task_title', 'Modifier la tâche')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="taskTitle" className="block text-slate-300 text-sm mb-2 font-medium">{t('task_title_label', 'Titre de la tâche')}</label>
                    <input id="taskTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
                </div>
                <div>
                    <label className="block text-slate-300 text-sm mb-2 font-medium">{t('priority_label', 'Priorité')}</label>
                    <div className="flex justify-center items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1.5">
                        {priorityOptions.map(opt => (
                            <button key={opt.id} type="button" onClick={() => setPriority(opt.id)} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${priority === opt.id ? `bg-${opt.color}-500 text-white shadow-lg` : 'text-slate-300 hover:bg-slate-700'}`}>
                                {opt.icon}{opt.text}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="taskDeadline" className="block text-slate-300 text-sm mb-2 font-medium">{t('deadline_label', 'Échéance')}</label>
                    <input id="taskDeadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="form-input" />
                </div>
                <button type="submit" disabled={loading} className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg !mt-8 disabled:opacity-50 main-action-button">
                    {loading ? t('saving', 'Sauvegarde...') : t('save_changes', 'Sauvegarder les changements')}
                </button>
            </form>
        </ModalWrapper>
    );
};

export default TaskEditModal;