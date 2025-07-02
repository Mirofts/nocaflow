// src/components/dashboard/modals/AddDeadlineModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';

const AddDeadlineModal = ({ onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [description, setDescription] = useState('');
    const [client, setClient] = useState(''); // Pour lier la deadline à un client/projet

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !date.trim()) return;

        onSave({
            title: title.trim(),
            date: date,
            description: description.trim(),
            client: client.trim()
        });
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                {t('add_deadline_title', 'Ajouter une nouvelle échéance')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('deadline_title_placeholder', 'Titre de l\'échéance...')}
                    className="form-input"
                    required
                />
                <div>
                    <label htmlFor="deadlineDate" className="block text-slate-300 text-sm mb-2 font-medium">{t('date', 'Date')}</label>
                    <input
                        id="deadlineDate"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <input
                    type="text"
                    value={client}
                    onChange={e => setClient(e.target.value)}
                    placeholder={t('client_related', 'Client / Projet lié (optionnel)...')}
                    className="form-input"
                />
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={t('description_placeholder', 'Description (optionnel)...')}
                    className="form-input min-h-[80px]"
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-3 rounded-lg text-lg main-action-button"
                >
                    {t('add_deadline', 'Ajouter l\'échéance')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default AddDeadlineModal;