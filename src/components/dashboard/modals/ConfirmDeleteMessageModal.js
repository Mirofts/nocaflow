// src/components/dashboard/modals/ConfirmDeleteMessageModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper'; // Assurez-vous que ce chemin est correct

const ConfirmDeleteMessageModal = ({ showModal, onClose, onConfirm, t }) => {
    if (!showModal) return null;

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6m4-6v6M3 6h18M5 6l1.5-1.5A2 2 0 0 1 8 4h8a2 2 0 0 1 1.5.5L21 6M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>
                {t('confirm_delete_title', 'Confirmer la suppression')}
            </h2>
            <p className="text-center text-slate-300 mb-8 text-lg">
                {t('confirm_delete_message_text', 'Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.')}
            </p>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onClose}
                    className="main-button-secondary bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium"
                >
                    {t('cancel', 'Annuler')}
                </button>
                <motion.button
                    onClick={onConfirm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pulse-button bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold"
                >
                    {t('delete', 'Supprimer')}
                </motion.button>
            </div>
        </ModalWrapper>
    );
};

export default ConfirmDeleteMessageModal;