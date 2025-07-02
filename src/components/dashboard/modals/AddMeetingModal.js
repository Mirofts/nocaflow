// src/components/dashboard/modals/AddMeetingModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';

const AddMeetingModal = ({ onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(new Date(), 'HH:mm'));
    const [attendees, setAttendees] = useState('');
    const [sendEmail, setSendEmail] = useState(false);
    const [timezone, setTimezone] = useState('');
    const [googleMeetLink, setGoogleMeetLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !date.trim() || !time.trim()) return;

        onSave({
            title: title.trim(),
            dateTime: `${date}T${time}:00`,
            attendees: attendees.split(',').map(a => a.trim()).filter(a => a),
            sendEmail: sendEmail,
            timezone: timezone.trim(),
            googleMeetLink: googleMeetLink.trim() || 'https://meet.google.com/new', // Default link
        });
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg>
                {t('add_meeting_title', 'Ajouter une nouvelle réunion')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('meeting_title_placeholder', 'Titre de la réunion...')}
                    className="form-input"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="meetingDate" className="block text-slate-300 text-sm mb-2 font-medium">{t('date', 'Date')}</label>
                        <input
                            id="meetingDate"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="meetingTime" className="block text-slate-300 text-sm mb-2 font-medium">{t('time', 'Heure')}</label>
                        <input
                            id="meetingTime"
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                </div>
                <input
                    type="text"
                    value={attendees}
                    onChange={e => setAttendees(e.target.value)}
                    placeholder={t('attendees_placeholder', 'Participants (emails séparés par des virgules)...')}
                    className="form-input"
                />
                <input
                    type="text"
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    placeholder={t('timezone_placeholder', 'Fuseau horaire (ex: Europe/Paris)...')}
                    className="form-input"
                />
                <input
                    type="url"
                    value={googleMeetLink}
                    onChange={e => setGoogleMeetLink(e.target.value)}
                    placeholder={t('google_meet_link_placeholder', 'Lien Google Meet (optionnel)...')}
                    className="form-input"
                />
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="sendEmail"
                        checked={sendEmail}
                        onChange={e => setSendEmail(e.target.checked)}
                        className="form-checkbox"
                    />
                    <label htmlFor="sendEmail" className="text-slate-300 text-sm">{t('send_email_invitation', 'Envoyer une invitation par email')}</label>
                </div>
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold py-3 rounded-lg text-lg main-action-button"
                >
                    {t('schedule_meeting', 'Planifier la réunion')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default AddMeetingModal;