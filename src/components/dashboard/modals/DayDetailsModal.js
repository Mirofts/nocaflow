// src/components/dashboard/modals/DayDetailsModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isToday, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalWrapper } from './ModalWrapper';

const DayDetailsModal = ({ data, onAddTask, onClose, t }) => {
    const { date, events } = data;

    const eventTypeMap = {
        meeting: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg>, label: t('event_meeting', 'Réunion') },
        task: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: t('event_task', 'Tâche') },
        project: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, label: t('event_project', 'Projet') },
    };

    const getEventType = (event) => {
        if (event.dateTime) return eventTypeMap.meeting;
        if (event.progress !== undefined) return eventTypeMap.project;
        return eventTypeMap.task;
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4 text-center capitalize">
                {isToday(date) ? t('today', "Aujourd'hui") : format(date, 'eeee dd MMMM', { locale: fr })}
            </h2>
            <p className="text-slate-400 text-center mb-6">{t('day_events_summary', 'Voici les événements prévus pour ce jour.')}</p>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {Array.isArray(events) && events.length > 0 ? events.map(event => {
                    const type = getEventType(event);
                    return (
                        <div key={event.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                            <div className="flex-shrink-0">{type.icon}</div>
                            <div>
                                <p className="font-bold text-white">{event.title || event.name}</p>
                                <p className="text-xs text-slate-400">
                                    {type.label}
                                    {event.dateTime && isValid(parseISO(event.dateTime)) ? ` ${t('at', 'à')} ${format(parseISO(event.dateTime), 'HH:mm')}` : ''}
                                    {event.deadline && isValid(parseISO(event.deadline)) ? ` ${t('until', 'jusqu\'au')} ${format(parseISO(event.deadline), 'dd/MM/yy')}` : ''}
                                </p>
                            </div>
                        </div>
                    );
                }) : <p className="text-slate-400 text-center py-4">{t('no_events_for_day', 'Aucun événement pour ce jour.')}</p>}
            </div>
            <motion.button
                onClick={() => { onClose(); onAddTask(date); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2.5 rounded-lg hover:from-pink-600 hover:to-violet-600 transition-all shadow-lg main-action-button"
            >
                {/* PlusCircle Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                {t('add_event_for_day', 'Ajouter un événement pour ce jour')}
            </motion.button>
        </ModalWrapper>
    );
};

export default DayDetailsModal;