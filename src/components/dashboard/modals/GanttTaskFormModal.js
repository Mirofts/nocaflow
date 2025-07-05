// src/components/dashboard/modals/GanttTaskFormModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';
import { format, parseISO, isValid } from 'date-fns';

// Couleurs pour le Gantt Chart (doivent correspondre à celles définies dans GanttChartPlanning.js)
// Re-defined here for the modal, assuming it's not imported directly from GanttChartPlanning
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

const GanttTaskFormModal = ({ initialData = {}, onSave, onClose, allStaffMembers = [], allClients = [], t }) => {
    // --- STANDARDIZED STATE FOR GANTT TASKS ---
    // The data model GanttChartPlanning expects: { id, title, person, startDate, endDate, color, completed }
    const [title, setTitle] = useState(initialData.title || '');
    const [person, setPerson] = useState(initialData.person || ''); // 'person' combines staff and client
    const [startDate, setStartDate] = useState(
        initialData.startDate && isValid(parseISO(initialData.startDate)) 
            ? format(parseISO(initialData.startDate), 'yyyy-MM-dd') 
            : format(new Date(), 'yyyy-MM-dd')
    );
    const [endDate, setEndDate] = useState(
        initialData.endDate && isValid(parseISO(initialData.endDate))
            ? format(parseISO(initialData.endDate), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd')
    );
    const [color, setColor] = useState(initialData.color || 'blue');
    const [completed, setCompleted] = useState(initialData.completed || false); // Add completed status
    const [isNewPerson, setIsNewPerson] = useState(false); // To toggle between select and input for 'person'

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !person.trim() || !startDate || !endDate) {
            alert(t('gantt_form_error_message', 'Veuillez remplir tous les champs obligatoires.'));
            return;
        }

        const taskData = {
            id: initialData.id || `gantt-${Date.now()}`,
            title: title.trim(),
            person: person.trim(),
            startDate: startDate,
            endDate: endDate,
            color: color,
            completed: completed, // Include completed status
        };
        onSave(taskData);
        onClose();
    };

    // Combine all potential people (staff and clients) for the dropdown
    const allPeople = useMemo(() => {
        const staffNames = Array.isArray(allStaffMembers) ? allStaffMembers.map(m => m.name) : [];
        const clientNames = Array.isArray(allClients) ? allClients.map(c => c.name) : [];
        const uniquePeople = [...new Set([...staffNames, ...clientNames])];
        return uniquePeople.sort();
    }, [allStaffMembers, allClients]);

    // Check if the current 'person' is not in the predefined list, implying a new person
    useEffect(() => {
        if (person && !allPeople.includes(person)) {
            setIsNewPerson(true);
        } else {
            setIsNewPerson(false);
        }
    }, [person, allPeople]);

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg> {/* Icon for Gantt/Planning */}
                {initialData.id ? t('edit_gantt_task_title', 'Modifier la tâche Planning') : t('add_gantt_task_title', 'Ajouter une tâche Planning')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="taskTitle" className="block text-slate-300 text-sm mb-1 font-medium">{t('gantt_task_title_label', 'Titre de la tâche')}</label>
                    <input id="taskTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('gantt_task_title_placeholder', 'Titre de la tâche...')} className="form-input" required />
                </div>

                {/* Person selection / input */}
                <div>
                    <label htmlFor="person" className="block text-slate-300 text-sm mb-1 font-medium">{t('gantt_person_label', 'Personne assignée')}</label>
                    {!isNewPerson ? (
                        <div className="relative">
                            <select
                                id="person"
                                value={person}
                                onChange={e => setPerson(e.target.value)}
                                className="form-input appearance-none pr-10"
                                required
                            >
                                <option value="">{t('select_person_placeholder', 'Sélectionner une personne...')}</option>
                                {allPeople.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button type="button" onClick={() => setIsNewPerson(true)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-xs text-pink-400 hover:underline">
                                {t('add_new', 'Nouvelle ?')}
                            </button>
                        </div>
                    ) : (
                        <input type="text" value={person} onChange={e => setPerson(e.target.value)} placeholder={t('new_person_name_placeholder', 'Nom de la nouvelle personne...')} className="form-input" required />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-slate-300 text-sm mb-1 font-medium">{t('start_date', 'Date de début')}</label>
                        <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" required />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-slate-300 text-sm mb-1 font-medium">{t('end_date', 'Date de fin')}</label>
                        <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" required />
                    </div>
                </div>

                {/* Color picker */}
                <div>
                    <label className="block text-slate-300 text-sm mb-1 font-medium">{t('gantt_color', 'Couleur')}</label>
                    <div className="grid grid-cols-5 gap-2">
                        {GanttColors.map(c => (
                            <div 
                                key={c.value}
                                className={`h-8 w-8 rounded-full cursor-pointer border-2 transition-all ${c.class} ${color === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                                onClick={() => setColor(c.value)}
                                title={c.name}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Completed Checkbox */}
                {initialData.id && ( // Only show if editing an existing task
                    <div>
                        <label htmlFor="completed" className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                            <input
                                id="completed"
                                type="checkbox"
                                checked={completed}
                                onChange={e => setCompleted(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-pink-500 rounded border-slate-600 bg-slate-700 focus:ring-pink-500 cursor-pointer"
                            />
                            {t('gantt_task_completed', 'Tâche terminée')}
                        </label>
                    </div>
                )}

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-bold py-3 rounded-lg text-lg text-white pulse-button bg-gradient-to-r from-pink-500 to-violet-500 main-action-button"
                >
                    {initialData.id ? t('save_changes', 'Sauvegarder les changements') : t('add_gantt_task_button', 'Ajouter la tâche')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default GanttTaskFormModal;