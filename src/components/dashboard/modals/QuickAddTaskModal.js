// src/components/dashboard/modals/QuickAddTaskModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isValid, setHours, setMinutes, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalWrapper } from './ModalWrapper';

const QuickAddTaskModal = ({ date, onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('task'); // 'task' ou 'event'
    const [eventDate, setEventDate] = useState(format(date && isValid(new Date(date)) ? new Date(date) : new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState('10:00');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);

        const [hours, minutes] = time.split(':');
        const parsedDate = parse(eventDate, 'yyyy-MM-dd', new Date());
        const finalDateTime = setMinutes(setHours(parsedDate, hours), minutes);

        if (type === 'task') {
            onSave({
                title: title,
                priority: 'Normale',
                deadline: finalDateTime.toISOString()
            });
        } else { // Pour 'meeting' ou 'deadline'
            // Ici, vous pourriez appeler une autre fonction ou passer plus de données
            // Pour l'instant, on crée une tâche avec une priorité différente pour la distinguer
            onSave({
                title: title,
                priority: 'Haute', // Pour distinguer un événement
                deadline: finalDateTime.toISOString(),
                isEvent: true // Ajout d'un marqueur
            });
        }

        setLoading(false);
        onClose();
    };

    const eventTypeOptions = [
        { id: 'task', label: t('add_type_task', 'Tâche') },
        { id: 'event', label: t('add_type_event', 'Événement') },
    ];

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
                {t('add_new_item', 'Ajouter un élément')}
            </h2>

            <div className="mb-4 flex justify-center space-x-1 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
                {eventTypeOptions.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setType(option.id)}
                        className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold
                                    ${type === option.id ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('title_placeholder', 'Titre...')}
                    className="form-input"
                    required
                    autoFocus
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="eventDate" className="block text-slate-300 text-sm mb-1 font-medium">{t('date', 'Date')}</label>
                        <input
                            id="eventDate"
                            type="date"
                            value={eventDate}
                            onChange={e => setEventDate(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="eventTime" className="block text-slate-300 text-sm mb-1 font-medium">{t('time', 'Heure')}</label>
                        <input
                            id="eventTime"
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full main-action-button bg-gradient-to-r from-pink-500 to-violet-500 disabled:opacity-50"
                >
                    {loading ? t('adding', 'Ajout...') : t('add_item', 'Ajouter')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default QuickAddTaskModal;