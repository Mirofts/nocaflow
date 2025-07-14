// src/components/dashboard/modals/ProjectFormModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const ProjectFormModal = ({ initialData, onSave, onDelete, allClients = [], allStaffMembers = [], onClose, t }) => {
    const [project, setProject] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        clientId: initialData?.clientId || null,
        teamIds: initialData?.teamIds || [],
        deadline: initialData?.deadline || '',
        progress: initialData?.progress || 0,
        totalAmount: initialData?.totalAmount || '',
        paidAmount: initialData?.paidAmount || '',
        nextPayment: initialData?.nextPayment || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    const handleTeamSelect = (memberId) => {
        setProject(prev => {
            const teamIds = prev.teamIds.includes(memberId)
                ? prev.teamIds.filter(id => id !== memberId)
                : [...prev.teamIds, memberId];
            return { ...prev, teamIds };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...project, id: initialData?.id });
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {initialData?.id ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2 custom-scrollbar">
                <input type="text" name="name" value={project.name} onChange={handleChange} placeholder="Nom du projet" className="form-input" required />
                <textarea name="description" value={project.description} onChange={handleChange} placeholder="Description courte du projet..." className="form-input" rows="3"></textarea>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Client</label>
                        <select name="clientId" value={project.clientId || ''} onChange={handleChange} className="form-input">
                            <option value="">Aucun client</option>
                            {allClients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Date d'échéance</label>
                        <input type="date" name="deadline" value={project.deadline} onChange={handleChange} className="form-input" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <input type="text" name="totalAmount" value={project.totalAmount} onChange={handleChange} placeholder="Montant Total (€)" className="form-input" />
                     <input type="text" name="paidAmount" value={project.paidAmount} onChange={handleChange} placeholder="Montant Payé (€)" className="form-input" />
                     <input type="text" name="nextPayment" value={project.nextPayment} onChange={handleChange} placeholder="Prochain paiement" className="form-input" />
                </div>

                <div>
                    <label className="text-sm text-slate-400 mb-2 block">Assigner à l'équipe</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                        {allStaffMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer" onClick={() => handleTeamSelect(member.id)}>
                                <input type="checkbox" id={`member-${member.id}`} checked={project.teamIds.includes(member.id)} readOnly className="form-checkbox" />
                                <img src={member.avatar || '/images/avatars/default.png'} alt={member.name} className="w-6 h-6 rounded-full"/>
                                <label htmlFor={`member-${member.id}`} className="text-white cursor-pointer">{member.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    {initialData?.id && (
                        <button type="button" onClick={() => onDelete(project.id)} className="main-button-secondary bg-red-600/20 text-red-400">Supprimer</button>
                    )}
                    <button type="button" onClick={onClose} className="main-button-secondary">Annuler</button>
                    <button type="submit" className="main-action-button bg-gradient-to-r from-pink-500 to-violet-500">
                        {initialData?.id ? 'Sauvegarder' : 'Créer le Projet'}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default ProjectFormModal;