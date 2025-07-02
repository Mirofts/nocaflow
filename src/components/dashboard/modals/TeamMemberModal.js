// src/components/dashboard/modals/TeamMemberModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Importez Image de next/image
import { ModalWrapper } from './ModalWrapper';

const TeamMemberModal = ({ mode, member, onSave, onDelete, onClose, t }) => {
    const [name, setName] = useState(member?.name || '');
    const [role, setRole] = useState(member?.role || '');
    const [email, setEmail] = useState(member?.email || '');
    const [avatar, setAvatar] = useState(member?.avatar || '/images/default-avatar.png');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !role.trim() || !email.trim()) return;

        const memberData = {
            id: member?.id || `member-${Date.now()}`,
            name: name.trim(),
            role: role.trim(),
            email: email.trim(),
            avatar: avatar,
        };
        onSave(memberData);
        onClose();
    };

    const handleDelete = () => {
        if (member && window.confirm(t('confirm_delete_member', 'Êtes-vous sûr de vouloir supprimer ce membre ?'))) {
            onDelete(member.id);
            onClose();
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {mode === 'add' ? (
                    // PlusCircle Icon SVG
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                ) : (
                    // Edit Icon SVG
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                )}
                {mode === 'add' ? t('add_member_title', 'Ajouter un membre') : t('edit_member_title', 'Modifier le membre')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                    <Image src={avatar} alt="Member Avatar" width={80} height={80} className="rounded-full object-cover border-2 border-pink-500" />
                </div>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('member_name_placeholder', 'Nom du membre...')} className="form-input" required />
                <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder={t('member_role_placeholder', 'Rôle...')} className="form-input" required />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('member_email_placeholder', 'Email...')} className="form-input" required />

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 main-action-button"
                >
                    {mode === 'add' ? t('add_member_button', 'Ajouter le membre') : t('save_changes', 'Sauvegarder les changements')}
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
                        {t('delete_member_button', 'Supprimer le membre')}
                    </motion.button>
                )}
            </form>
        </ModalWrapper>
    );
};

export default TeamMemberModal;