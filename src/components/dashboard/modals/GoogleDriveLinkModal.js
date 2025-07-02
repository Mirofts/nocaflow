// src/components/dashboard/modals/GoogleDriveLinkModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const GoogleDriveLinkModal = ({ projectId, onSave, onClose, t }) => {
    const [link, setLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!link.trim()) return;
        onSave(projectId, link.trim());
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20z"/><path d="M12 2L1 22h22L12 2z"/></svg>
                {t('add_google_drive_link_title', 'Ajouter un lien Google Drive')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="url"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder={t('google_drive_url_placeholder', 'URL du dossier Google Drive...')}
                    className="form-input"
                    required
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-lg text-lg main-action-button"
                >
                    {t('save_link', 'Sauvegarder le lien')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default GoogleDriveLinkModal;