// src/components/dashboard/modals/AssignTeamModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const AssignTeamModal = ({ t, task, onSave, onClose, allStaffMembers = [] }) => {
    const [assignedMemberIds, setAssignedMemberIds] = useState(task.assignedTo || []);

    const handleMemberToggle = (memberId) => {
        setAssignedMemberIds(prev =>
            prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
        );
    };

    const handleSave = () => {
        onSave({ ...task, assignedTo: assignedMemberIds });
        onClose();
    };

    return (
        <ModalWrapper
            title={t('assign_task_to_team', 'Assigner la tâche')}
            onClose={onClose}
        >
            <div className="p-6">
                <p className="text-color-text-secondary mb-4">{t('select_members_for_task', 'Sélectionnez les membres à assigner à la tâche :')} <span className="font-bold text-color-text-primary">"{task.title}"</span></p>
                
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {allStaffMembers.length > 0 ? (
                        allStaffMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-color-bg-tertiary">
                                <div className="flex items-center gap-3">
                                    <img src={member.avatar || '/images/avatars/default.png'} alt={member.name} className="w-8 h-8 rounded-full"/>
                                    <span className="text-sm font-medium text-color-text-primary">{member.name}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={assignedMemberIds.includes(member.id)}
                                    onChange={() => handleMemberToggle(member.id)}
                                    className="form-checkbox h-5 w-5 text-indigo-600 bg-color-bg-input-field border-color-border-input rounded focus:ring-indigo-500"
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-color-text-secondary text-sm text-center py-4">{t('no_staff_members_available', 'Aucun membre d\'équipe disponible.')}</p>
                    )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="btn-secondary">{t('cancel', 'Annuler')}</button>
                    <button onClick={handleSave} className="btn-primary">{t('save_assignments', 'Enregistrer')}</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default AssignTeamModal;