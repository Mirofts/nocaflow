// src/components/dashboard/modals/ClientFormModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';

const ClientFormModal = ({ mode, client, onSave, onDelete, onClose, t }) => {
    const [name, setName] = useState(client?.name || '');
    const [contactEmail, setContactEmail] = useState(client?.contactEmail || '');
    const [phone, setPhone] = useState(client?.phone || '');
    const [lastContact, setLastContact] = useState(client?.lastContact ? format(parseISO(client.lastContact), 'yyyy-MM-dd') : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !contactEmail.trim()) return;

        const clientData = {
            id: client?.id || `cl-${Date.now()}`,
            name: name.trim(),
            contactEmail: contactEmail.trim(),
            phone: phone.trim(),
            lastContact: lastContact || null,
        };
        onSave(clientData);
        onClose();
    };

    const handleDelete = () => {
        if (client && window.confirm(t('confirm_delete_client', 'Êtes-vous sûr de vouloir supprimer ce client ?'))) {
            onDelete(client.id);
            onClose();
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {mode === 'add' ? (
                    // UserPlus Icon SVG
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                ) : (
                    // Edit Icon SVG
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                )}
                {mode === 'add' ? t('add_client_title', 'Ajouter un client') : t('edit_client_title', 'Modifier le client')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('client_name_placeholder', 'Nom du client...')} className="form-input" required />
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder={t('client_email_placeholder', 'Email du client...')} className="form-input" required />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('client_phone_placeholder', 'Téléphone (optionnel)...')} className="form-input" />
                <div>
                    <label htmlFor="lastContact" className="block text-slate-300 text-sm mb-2 font-medium">{t('last_contact_date', 'Date du dernier contact')}</label>
                    <input id="lastContact" type="date" value={lastContact} onChange={e => setLastContact(e.target.value)} className="form-input" />
                </div>

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-teal-500 to-cyan-600 main-action-button"
                >
                    {mode === 'add' ? t('add_client_button', 'Ajouter le client') : t('save_changes', 'Sauvegarder les changements')}
                </motion.button>
                {mode === 'edit' && (
                    <motion.button
                        type="button"
                        onClick={handleDelete}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2 main-button-secondary"
                    >
                        {/* Trash2 Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        {t('delete_client_button', 'Supprimer le client')}
                    </motion.button>
                )}
            </form>
        </ModalWrapper>
    );
};

export default ClientFormModal;