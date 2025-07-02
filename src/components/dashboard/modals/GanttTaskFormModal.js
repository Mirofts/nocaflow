// src/components/dashboard/modals/GanttTaskFormModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';
import { format, parseISO } from 'date-fns';

// Couleurs pour le Gantt Chart (définies globalement ou importées si utilisées ailleurs)
const GanttColors = [
    { name: 'Pink', class: 'bg-pink-500', value: 'pink' },
    { name: 'Red', class: 'bg-red-500', value: 'red' },
    { name: 'Violet', class: 'bg-violet-500', value: 'violet' },
    { name: 'Blue', class: 'bg-blue-500', value: 'blue' },
    { name: 'Cyan', class: 'bg-cyan-500', value: 'cyan' },
    { name: 'Green', class: 'bg-green-500', value: 'green' },
    { name: 'Amber', class: 'bg-amber-500', value: 'amber' },
    { name: 'Gray', class: 'bg-gray-500', value: 'gray' },
];

const GanttTaskFormModal = ({ initialData = {}, onSave, onClose, allStaffMembers, allClients, t }) => {
    const [name, setName] = useState(initialData.name || '');
    const [startDate, setStartDate] = useState(initialData.startDate ? format(parseISO(initialData.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(initialData.endDate ? format(parseISO(initialData.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    const [assignedTo, setAssignedTo] = useState(initialData.assignedTo || '');
    const [client, setClient] = useState(initialData.client || '');
    const [progress, setProgress] = useState(initialData.progress || 0);
    const [color, setColor] = useState(initialData.color || 'blue');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !startDate || !endDate) return;

        const taskData = {
            id: initialData.id || `gantt-${Date.now()}`,
            name: name.trim(),
            startDate: startDate,
            endDate: endDate,
            assignedTo: assignedTo,
            client: client,
            progress: Number(progress),
            color: color,
        };
        onSave(taskData);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {initialData.id ? t('edit_gantt_task_title', 'Modifier la tâche Gantt') : t('add_gantt_task_title', 'Ajouter une tâche Gantt')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('task_name_placeholder', 'Nom de la tâche...')} className="form-input" required />

                <div>
                    <label htmlFor="startDate" className="block text-slate-300 text-sm mb-2 font-medium">{t('start_date', 'Date de début')}</label>
                    <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" required />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-slate-300 text-sm mb-2 font-medium">{t('end_date', 'Date de fin')}</label>
                    <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" required />
                </div>

                <div>
                    <label htmlFor="assignedTo" className="block text-slate-300 text-sm mb-2 font-medium">{t('assigned_to', 'Assigné à')}</label>
                    <select id="assignedTo" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="form-input">
                        <option value="">{t('select_member', 'Sélectionner un membre')}</option>
                        {Array.isArray(allStaffMembers) && allStaffMembers.map(member => (
                            <option key={member.id} value={member.name}>{member.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="client" className="block text-slate-300 text-sm mb-2 font-medium">{t('client', 'Client')}</label>
                    <select id="client" value={client} onChange={e => setClient(e.target.value)} className="form-input">
                        <option value="">{t('select_client', 'Sélectionner un client')}</option>
                        {Array.isArray(allClients) && allClients.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="progress" className="block text-slate-300 text-sm mb-2 font-medium">{t('progress', 'Progression')} (%)</label>
                    <input id="progress" type="number" value={progress} onChange={e => setProgress(e.target.value)} min="0" max="100" className="form-input" />
                </div>

                <div>
                    <label className="block text-slate-300 text-sm mb-2 font-medium">{t('color', 'Couleur')}</label>
                    <div className="flex flex-wrap gap-2">
                        {GanttColors.map((c) => (
                            <motion.button
                                key={c.value}
                                type="button"
                                onClick={() => setColor(c.value)}
                                className={`w-8 h-8 rounded-full border-2 ${color === c.value ? `border-white shadow-lg` : 'border-transparent'} ${c.class}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            />
                        ))}
                    </div>
                </div>

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg main-action-button"
                >
                    {initialData.id ? t('save_changes', 'Sauvegarder les changements') : t('add_task', 'Ajouter la tâche')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default GanttTaskFormModal;