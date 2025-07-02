// src/components/dashboard/modals/GuestNameEditModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const GuestNameEditModal = ({ currentName, onSave, onClose, t }) => {
    const [name, setName] = useState(currentName);
    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {t('edit_guest_name_title', 'Modifier votre pseudo')}
            </h2>
            <form onSubmit={e => { e.preventDefault(); onSave(name); onClose(); }}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input text-center text-lg mb-6 w-full" autoFocus placeholder={t('guest_name_placeholder', 'Votre pseudo')} />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg main-action-button"
                >
                    {t('save', 'Sauvegarder')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default GuestNameEditModal;