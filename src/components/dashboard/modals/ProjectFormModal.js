// src/components/dashboard/modals/ProjectFormModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';

const ProjectFormModal = ({ initialData = {}, onSave, onDelete, onClose, isGuest, t }) => {
    const [name, setName] = useState(initialData.name || '');
    const [client, setClient] = useState(initialData.client || '');
    const [progress, setProgress] = useState(initialData.progress || 0);
    const [deadline, setDeadline] = useState(initialData.deadline ? format(parseISO(initialData.deadline), 'yyyy-MM-dd') : '');
    const [paidAmount, setPaidAmount] = useState(initialData.paidAmount || '');
    const [nextPayment, setNextPayment] = useState(initialData.nextPayment || '');
    const [totalAmount, setTotalAmount] = useState(initialData.totalAmount || '');
    const [staff, setStaff] = useState(initialData.staff || []);
    const [googleDriveLink, setGoogleDriveLink] = useState(initialData.googleDriveLink || '');


    const handleSubmit = (e) => {
        e.preventDefault();
        if (isGuest) {
            alert(t('guest_feature_disabled_project', "L'ajout/modification de projets est désactivé en mode invité. Veuillez vous inscrire !"));
            return;
        }
        if (!name.trim()) return;

        const projectData = {
            id: initialData.id || `proj-${Date.now()}`,
            createdAt: initialData.createdAt || new Date().toISOString(),
            name: name.trim(),
            client: client.trim(),
            progress: Number(progress),
            deadline: deadline || null,
            paidAmount: paidAmount.trim(),
            nextPayment: nextPayment.trim(),
            totalAmount: totalAmount.trim(),
            staff: staff,
            googleDriveLink: googleDriveLink.trim() || null
        };
        onSave(projectData);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {/* Briefcase Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {initialData.id ? t('edit_project_title', 'Modifier le projet') : t('create_project_title', 'Créer un nouveau projet')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={t('project_name_placeholder', 'Nom du projet...')} className="form-input" required />
                <input type="text" value={client} onChange={e=>setClient(e.target.value)} placeholder={t('client_name_placeholder', 'Nom du client...')} className="form-input" />

                {/* Champs supplémentaires pour le projet */}
                <div>
                    <label htmlFor="projectProgress" className="block text-slate-300 text-sm mb-2 font-medium">{t('progress', 'Progression')} (%)</label>
                    <input id="projectProgress" type="number" value={progress} onChange={e => setProgress(e.target.value)} min="0" max="100" className="form-input" />
                </div>
                <div>
                    <label htmlFor="projectDeadline" className="block text-slate-300 text-sm mb-2 font-medium">{t('deadline', 'Échéance')}</label>
                    <input id="projectDeadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="form-input" />
                </div>
                <input type="text" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder={t('paid_amount_placeholder', 'Déjà payé (€)...')} className="form-input" />
                <input type="text" value={nextPayment} onChange={e => setNextPayment(e.target.value)} placeholder={t('next_payment_placeholder', 'Prochain paiement (date ou montant)...')} className="form-input" />
                <input type="text" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder={t('total_amount_placeholder', 'Paiement global (€)...')} className="form-input" />
                <input type="url" value={googleDriveLink} onChange={e => setGoogleDriveLink(e.target.value)} placeholder={t('google_drive_link_placeholder', 'URL du dossier Google Drive')} className="form-input" />


                {isGuest && <p className="text-xs text-amber-400 text-center flex items-center gap-2">
                    {/* Info Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    {t('guest_feature_restricted', 'Fonctionnalité réservée aux membres inscrits.')}</p>}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isGuest ? 'bg-slate-600 cursor-not-allowed' : 'pulse-button bg-gradient-to-r from-pink-600 to-red-500'} main-action-button`}
                >
                    {initialData.id ? t('save_changes', 'Sauvegarder les changements') : t('create_project_button', 'Créer le Projet')}
                </motion.button>
                {initialData.id && ( // Bouton Supprimer en mode édition
                    <motion.button
                        type="button"
                        onClick={() => { if(window.confirm(t('confirm_delete_project', 'Êtes-vous sûr de vouloir supprimer ce projet ?'))) onDelete(initialData.id); onClose(); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2 main-button-secondary"
                    >
                        {/* Trash2 Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        {t('delete_project_button', 'Supprimer le Projet')}
                    </motion.button>
                )}
            </form>
        </ModalWrapper>
    );
};

export default ProjectFormModal;