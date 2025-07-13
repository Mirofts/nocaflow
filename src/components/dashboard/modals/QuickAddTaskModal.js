// src/components/dashboard/modals/QuickAddTaskModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
// MODIFIÉ : On importe 'isValid' pour vérifier la date
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalWrapper } from './ModalWrapper';

const QuickAddTaskModal = ({ date, onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('task');
    const [loading, setLoading] = useState(false);

    // CORRECTION : On vérifie si la date est valide. Si non, on utilise la date du jour.
    const validDate = date && isValid(new Date(date)) ? new Date(date) : new Date();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);

        if (type === 'task') {
            // CORRECTION : On envoie un seul objet contenant toutes les informations
            onSave({
                title: title,
                priority: 'Normale', // On donne une priorité par défaut
                deadline: format(validDate, 'yyyy-MM-dd')
            });
        } else {
            alert(t('feature_not_implemented_here', `La fonctionnalité "${type}" n'est pas implémentée ici.`));
        }

        setLoading(false);
        onClose();
    };

    const eventTypeOptions = [
        { id: 'task', label: t('add_type_task', 'Tâche'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
        { id: 'note', label: t('add_type_note', 'Note'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> },
        { id: 'meeting', label: t('add_type_meeting', 'Réunion'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg> },
        { id: 'project-deadline', label: t('add_type_deadline', 'Deadline Projet'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    ];

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
                {t('add_event_title_for', 'Ajouter pour le')} {format(validDate, 'dd MMMM', { locale: fr })}
            </h2>

            <div className="mb-4 flex justify-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1.5">
                {eventTypeOptions.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setType(option.id)}
                        className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold
                                    ${type === option.id ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        {option.icon} {option.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('event_title_placeholder', 'Titre de l\'événement...')}
                    className="form-input mb-4"
                    required
                    autoFocus
                />
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 main-action-button"
                >
                    {loading ? t('adding', 'Ajout...') : t('add_event', 'Ajouter l\'événement')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default QuickAddTaskModal;