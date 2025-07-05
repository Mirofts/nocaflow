// components/dashboard/Notepad.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardCard } from './DashboardCard';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import { initialMockData } from '../../lib/mockData';
import { useTheme } from '../../context/ThemeContext';

const Notepad = ({ uid, isGuest, onGuestUpdate, t, className = '' }) => {
    const initialNoteContent = initialMockData.notes;
    const [note, setNote] = useState(isGuest ? initialNoteContent : '');
    const [status, setStatus] = useState(t('ready', 'Prêt'));
    const timeoutRef = useRef(null);
    const hasTypedRef = useRef(false);
    const textareaRef = useRef(null);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        if (isGuest) {
            const savedGuestData = JSON.parse(localStorage.getItem('nocaflow_guest_data') || '{}');
            const savedGuestNotes = savedGuestData.notes !== undefined ? savedGuestData.notes : initialNoteContent;
            setNote(savedGuestNotes);
            setStatus(t('saved', 'Sauvegardé'));
            return;
        }
        if (!uid) return;

        const docRef = doc(db, 'userNotes', uid);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setNote(snap.data().content || '');
            } else {
                setNote('');
            }
            setStatus(t('saved', 'Sauvegardé'));
        }, (error) => {
            console.error("Error fetching user notes:", error);
            setStatus(t('error', 'Erreur'));
        });

        return () => unsubscribe();
    }, [uid, isGuest, t, initialNoteContent]);

    const handleChange = useCallback((content) => {
        if (!hasTypedRef.current && content !== initialNoteContent && content.length > 0) {
            hasTypedRef.current = true;
        }
        setNote(content);

        setStatus(t('editing', 'Édition...'));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            setStatus(t('saving', 'Sauvegarde...'));
            try {
                if (isGuest) {
                    onGuestUpdate(prev => ({ ...prev, notes: content }));
                } else if (uid) {
                    await setDoc(doc(db, 'userNotes', uid), { content }, { merge: true });
                }
                setTimeout(() => setStatus(t('saved', 'Sauvegardé')), 700);
            } catch (error) {
                console.error("Error saving note:", error);
                setStatus(t('error_saving', 'Erreur de sauvegarde'));
            }
        }, 1500);
    }, [isGuest, uid, onGuestUpdate, t, initialNoteContent]);

    const handleFocus = useCallback(() => {
        if (isGuest && !hasTypedRef.current && note === initialNoteContent) {
            setNote('');
        }
    }, [isGuest, note, initialNoteContent]);

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
        } title={t('bloc_note_title', 'Bloc-notes')} className={className}>
            <div className="flex flex-col h-full">
                <textarea
                    ref={textareaRef}
                    value={note}
                    onChange={e => handleChange(e.target.value)}
                    onFocus={handleFocus}
                    placeholder={t('notepad_placeholder_initial', 'Vos idées, vos pensées, votre génie...')}
                    className={`w-full flex-grow bg-transparent resize-none p-1 custom-scrollbar border-none focus:ring-0 focus:outline-none focus:border-transparent 
                               font-normal text-sm leading-relaxed ${isDarkMode ? 'text-orange-300' : 'text-violet-700'}`}
                />
                <motion.div
                    className="text-right text-xs mt-2 transition-opacity flex-shrink-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: status === t('saved', 'Sauvegardé') ? 1 : 0.5 }}
                    style={{ color: isDarkMode ? (status === t('saved', 'Sauvegardé') ? '#ec4899' : '#64748b') : (status === t('saved', 'Sauvegardé') ? '#A855F7' : '#718096') }}
                >
                    {status}
                </motion.div>
            </div>
        </DashboardCard>
    );
};

export default Notepad;