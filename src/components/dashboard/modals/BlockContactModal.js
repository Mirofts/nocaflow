// src/components/dashboard/modals/BlockContactModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper'; // Assurez-vous que ce chemin est correct

const BlockContactModal = ({ showModal, onClose, onConfirm, contactName, isBlocked, t }) => {
    if (!showModal) return null;

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {isBlocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5"/><path d="M16 12H2"/><path d="M22 12h-2"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                )}
                {isBlocked ? t('unblock_title', 'Débloquer le contact') : t('block_title', 'Bloquer le contact')}
            </h2>
            <p className="text-center text-slate-300 mb-8 text-lg">
                {isBlocked ?
                    t('confirm_unblock', `Êtes-vous sûr de vouloir débloquer "${contactName}" ? Vous pourrez à nouveau lui envoyer des messages.`) :
                    t('confirm_block', `Êtes-vous sûr de vouloir bloquer "${contactName}" ? Vous ne pourrez plus lui envoyer de messages et ne recevrez plus les siens.`)
                }
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
                    className={`pulse-button px-5 py-2.5 rounded-lg text-white font-bold ${isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    {isBlocked ? t('unblock_confirm', 'Débloquer') : t('block_confirm', 'Bloquer')}
                </motion.button>
            </div>
        </ModalWrapper>
    );
};

export default BlockContactModal;