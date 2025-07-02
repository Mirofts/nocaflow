// src/components/dashboard/modals/UserNameEditModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // Assurez-vous que ce chemin est correct
import { useAuth } from '../../../context/AuthContext'; // Assurez-vous que ce chemin est correct
import { ModalWrapper } from './ModalWrapper';

const UserNameEditModal = ({ currentUser, onClose, t }) => {
    const { refreshUser } = useAuth();
    const [name, setName] = useState(currentUser?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError(t('name_empty_error', 'Le nom ne peut pas être vide.'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (currentUser && currentUser.uid) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userDocRef, {
                    displayName: name.trim()
                });
                if (refreshUser) {
                    await refreshUser();
                }
                onClose();
            } else {
                setError(t('user_not_found', 'Utilisateur non trouvé.'));
            }
        } catch (err) {
            console.error("Error updating user display name:", err);
            setError(t('update_name_error', 'Erreur lors de la mise à jour du nom.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {t('edit_user_name_title', 'Modifier votre nom')}
            </h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input text-center text-lg mb-4 w-full"
                    autoFocus
                    placeholder={t('your_name_placeholder', 'Votre nom')}
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50 main-action-button"
                >
                    {loading ? t('saving', 'Sauvegarde...') : t('save', 'Sauvegarder')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default UserNameEditModal;