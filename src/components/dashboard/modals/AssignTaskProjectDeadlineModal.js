// src/components/dashboard/modals/AssignTaskProjectDeadlineModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const AssignTaskProjectDeadlineModal = ({ member, onClose, t, allStaffMembers = [], userUid, currentUserName, onAddTask }) => {
    const [assignmentType, setAssignmentType] = useState('task');
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState(member?.name || currentUserName || '');
    const [loading, setLoading] = useState(false);

    const assignableStaff = (Array.isArray(allStaffMembers) ? allStaffMembers : []).filter(staffMember => staffMember.firebaseUid !== userUid);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);

        const assignmentData = {
            title: title.trim(),
            assignedTo: assignedTo,
            deadline: deadline || null,
        };

        if (assignmentType === 'task') {
            await onAddTask(assignmentData.title, 'normal', assignmentData.deadline);
            alert(t('task_assigned_success', `Tâche "${assignmentData.title}" assignée à ${assignedTo} et ajoutée !`));
        } else if (assignmentType === 'project') {
            alert(t('project_assignment_placeholder', `Attribution de projet à ${assignedTo} : "${assignmentData.title}" - Non implémentée.`));
        } else if (assignmentType === 'deadline') {
            alert(t('deadline_assignment_placeholder', `Attribution de deadline à ${assignedTo} : "${assignmentData.title}" - Non implémentée.`));
        }

        setLoading(false);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {/* Briefcase Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {t('assign_to', 'Assigner à')} {member?.name || currentUserName || 'cet utilisateur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-slate-300 text-sm mb-2 font-medium">{t('assignment_type', 'Type d\'attribution')}</label>
                    <div className="flex space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1.5">
                        <button type="button" onClick={() => setAssignmentType('task')} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${assignmentType === 'task' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}>
                            {/* CheckCircle Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            {t('task', 'Tâche')}
                        </button>
                        <button type="button" onClick={() => setAssignmentType('project')} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${assignmentType === 'project' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}>
                            {/* Briefcase Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                            {t('project', 'Projet')}
                        </button>
                        <button type="button" onClick={() => setAssignmentType('deadline')} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${assignmentType === 'deadline' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}>
                            {/* CalendarDays Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            {t('deadline', 'Deadline')}
                        </button>
                    </div>
                </div>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('assignment_title_placeholder', 'Titre de l\'attribution...')} className="form-input" required />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="form-input" />

                {/* Nouveau champ de sélection pour "Assigner à" */}
                <div>
                    <label className="block text-slate-300 text-sm mb-2 font-medium">{t('assign_to_label', 'Assigner à')}</label>
                    <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="form-input appearance-none pr-10"
                        required
                    >
                        <option value={currentUserName}>{currentUserName} ({t('me', 'Moi')})</option>
                        {(Array.isArray(assignableStaff) ? assignableStaff : []).map(member => (
                            <option key={member.firebaseUid} value={member.name}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        {/* ChevronDown SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>


                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-bold py-3 rounded-lg text-lg text-white pulse-button bg-gradient-to-r from-pink-500 to-violet-500 main-action-button"
                >
                    {loading ? t('assigning', 'Assignation...') : t('assign_button', 'Assigner')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default AssignTaskProjectDeadlineModal;