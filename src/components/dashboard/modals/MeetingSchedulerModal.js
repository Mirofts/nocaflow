// src/components/dashboard/modals/MeetingSchedulerModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';

const MeetingSchedulerModal = ({ onSchedule, isGuest, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(new Date(), 'HH:mm'));
    const [attendees, setAttendees] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isGuest) {
            alert(t('guest_feature_disabled', "L'ajout de réunions est désactivé en mode invité. Veuillez vous inscrire pour profiter de toutes les fonctionnalités !"));
            return;
        }
        onSchedule({ id: `meeting-${Date.now()}`, createdAt: new Date().toISOString(), dateTime: `${date}T${time}:00`, title, attendees: (attendees || '').split(',').map(e => e.trim()) });
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {/* Video Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg>
                {t('schedule_meeting_title', 'Planifier une réunion')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder={t('meeting_title_placeholder', 'Titre de la réunion...')} className="form-input" required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="form-input"/>
                    <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="form-input"/>
                </div>
                {isGuest && <p className="text-xs text-amber-400 text-center flex items-center gap-2">
                    {/* Info Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    {t('guest_feature_restricted', 'Fonctionnalité réservée aux membres inscrits.')}</p>}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isGuest ? 'bg-slate-600 cursor-not-allowed' : 'pulse-button bg-gradient-to-r from-violet-600 to-indigo-600'} main-action-button`}
                >
                    {t('schedule', 'Planifier')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default MeetingSchedulerModal;