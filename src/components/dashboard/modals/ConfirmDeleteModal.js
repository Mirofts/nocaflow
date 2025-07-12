// src/components/dashboard/modals/ConfirmDeleteModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <div className="text-center">
                {/* Icône d'avertissement */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-white mt-4" id="modal-title">
                    {title || 'Confirmer la suppression'}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-400">
                        {message || 'Êtes-vous sûr ? Cette action est irréversible.'}
                    </p>
                </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:col-start-2 sm:text-sm"
                    onClick={onConfirm}
                >
                    Supprimer
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-slate-700 text-base font-medium text-gray-200 hover:bg-slate-600 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={onClose}
                >
                    Annuler
                </motion.button>
            </div>
        </ModalWrapper>
    );
};

export default ConfirmDeleteModal;