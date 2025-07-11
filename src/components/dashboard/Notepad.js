// components/dashboard/Notepad.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardCard } from './DashboardCard';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// Helper pour générer un ID unique simple
const generateId = () => `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Donnée initiale pour un nouvel onglet
const createNewNote = (title = 'Nouvelle Note') => ({
    id: generateId(),
    title,
    content: ''
});

const Notepad = ({ uid, isGuest, onGuestUpdate, t, className = '' }) => {
    const initialNotes = [createNewNote(t('default_note_title', 'Mes Idées'))];
    const [notes, setNotes] = useState(isGuest ? initialNotes : []);
    const [activeTabId, setActiveTabId] = useState(isGuest ? initialNotes[0].id : null);
    const [editingTabId, setEditingTabId] = useState(null);

    const [status, setStatus] = useState(t('ready', 'Prêt'));
    const timeoutRef = useRef(null);
    const { isDarkMode } = useTheme();
    const titleInputRef = useRef(null);

    // Effet pour charger les notes depuis Firebase ou le localStorage
    useEffect(() => {
        if (isGuest) {
            const savedGuestData = JSON.parse(localStorage.getItem('nocaflow_guest_data') || '{}');
            const savedNotes = savedGuestData.notes && Array.isArray(savedGuestData.notes) && savedGuestData.notes.length > 0
                ? savedGuestData.notes
                : initialNotes;
            setNotes(savedNotes);
            if (!savedNotes.some(n => n.id === activeTabId)) {
                setActiveTabId(savedNotes[0]?.id || null);
            }
            setStatus(t('saved', 'Sauvegardé'));
            return;
        }
        if (!uid) return;

        const docRef = doc(db, 'userNotes', uid);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                // A. Check for the NEW array format
                if (data.notes && Array.isArray(data.notes) && data.notes.length > 0) {
                    setNotes(data.notes);
                // B. Check for the OLD string format and MIGRATE it
                } else if (data.content && typeof data.content === 'string') {
                    const migratedNote = createNewNote(t('migrated_note_title', 'Note Principale'));
                    migratedNote.content = data.content;
                    setNotes([migratedNote]);
                // C. If the document is empty or invalid, create a default note
                } else {
                    setNotes([createNewNote(t('default_note_title', 'Mes Idées'))]);
                }
            } else {
                // D. If the document doesn't exist at all, create a default note
                setNotes([createNewNote(t('default_note_title', 'Mes Idées'))]);
            }
            setStatus(t('saved', 'Sauvegardé'));
        }, (error) => {
            console.error("Error fetching user notes:", error);
            setStatus(t('error', 'Erreur'));
        });

        return () => unsubscribe();
    }, [uid, isGuest, t]);

    // Focus l'input quand on passe en mode édition de titre
    useEffect(() => {
        if (editingTabId && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [editingTabId]);

    // Fonction de sauvegarde générale
    const saveNotes = useCallback((notesToSave) => {
        setStatus(t('saving', 'Sauvegarde...'));
        try {
            if (isGuest) {
                onGuestUpdate(prev => ({ ...prev, notes: notesToSave }));
            } else if (uid) {
                setDoc(doc(db, 'userNotes', uid), { notes: notesToSave }, { merge: true });
            }
            setTimeout(() => setStatus(t('saved', 'Sauvegardé')), 700);
        } catch (error) {
            console.error("Error saving notes:", error);
            setStatus(t('error_saving', 'Erreur de sauvegarde'));
        }
    }, [isGuest, uid, onGuestUpdate, t]);

    // Déclencher la sauvegarde avec un délai
    const debouncedSave = useCallback((updatedNotes) => {
        setStatus(t('editing', 'Édition...'));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => saveNotes(updatedNotes), 1500);
    }, [saveNotes, t]);

    // Gestion du changement de contenu de la note active
    const handleContentChange = (content) => {
        const updatedNotes = notes.map(note =>
            note.id === activeTabId ? { ...note, content } : note
        );
        setNotes(updatedNotes);
        debouncedSave(updatedNotes);
    };

    // Ajout d'un nouvel onglet
    const handleAddNote = () => {
        const newNote = createNewNote(t('new_note_title', 'Note') + ` ${notes.length + 1}`);
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        setActiveTabId(newNote.id);
        saveNotes(updatedNotes); // Sauvegarde immédiate
    };

    // Suppression d'un onglet
    const handleDeleteNote = (idToDelete) => {
        if (notes.length <= 1) { // Empêche la suppression du dernier onglet
            alert(t('cannot_delete_last_note', 'Vous ne pouvez pas supprimer le dernier onglet.'));
            return;
        }
        const updatedNotes = notes.filter(note => note.id !== idToDelete);
        setNotes(updatedNotes);
        // Si l'onglet supprimé était l'onglet actif, on passe au premier onglet restant
        if (activeTabId === idToDelete) {
            setActiveTabId(updatedNotes[0]?.id || null);
        }
        saveNotes(updatedNotes); // Sauvegarde immédiate
    };

    // Gestion du changement de titre d'un onglet
    const handleTitleChange = (newTitle) => {
        const updatedNotes = notes.map(note =>
            note.id === editingTabId ? { ...note, title: newTitle } : note
        );
        setNotes(updatedNotes);
        debouncedSave(updatedNotes);
    };
    
    // Finaliser le renommage de l'onglet
    const handleTitleBlur = () => {
        setEditingTabId(null);
        // La sauvegarde est déjà gérée par handleTitleChange
    };

    // Note actuellement affichée
console.log('DEBUG: Type of notes prop is:', typeof notes, 'Is it an array?', Array.isArray(notes), 'Value:', notes);
const activeNote = notes.find(note => note.id === activeTabId);
    
    return (
        <DashboardCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>}
            title={t('bloc_note_title', 'Bloc-notes')}
            className={className}
        >
            <div className="flex flex-col h-full">
                {/* Barre d'onglets */}
                <div className="flex items-center border-b border-color-border-primary mb-2 overflow-x-auto custom-scrollbar-thin pb-1">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onDoubleClick={() => setEditingTabId(note.id)}
                            className={`flex items-center justify-between text-sm px-3 py-2 cursor-pointer rounded-t-lg border-b-2 whitespace-nowrap
                                ${activeTabId === note.id
                                    ? 'border-pink-500 text-color-text-primary bg-color-bg-tertiary'
                                    : 'border-transparent text-color-text-secondary hover:bg-color-bg-hover'}`}
                        >
                            {editingTabId === note.id ? (
                                <input
                                    ref={titleInputRef}
                                    type="text"
                                    value={note.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                                    className="bg-transparent border-0 focus:ring-0 p-0 m-0 w-24 text-sm"
                                />
                            ) : (
                                <span onClick={() => setActiveTabId(note.id)} className="pr-2" title={t('double_click_to_edit', 'Double-cliquez pour renommer')}>
                                    {note.title}
                                </span>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Empêche le double-clic de se déclencher
                                    handleDeleteNote(note.id);
                                }}
                                className="ml-2 p-0.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                                title={t('delete_note', 'Supprimer la note')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleAddNote}
                        className="ml-2 p-2 rounded-md hover:bg-color-bg-hover text-color-text-secondary"
                        title={t('add_new_note', 'Ajouter une note')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
                
                {/* Zone de texte */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTabId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full flex-grow flex flex-col"
                    >
                        <textarea
                            value={activeNote?.content || ''}
                            onChange={e => handleContentChange(e.target.value)}
                            placeholder={t('notepad_placeholder_initial', 'Vos idées, vos pensées, votre génie...')}
                            className={`w-full flex-grow bg-transparent resize-none p-1 custom-scrollbar border-none focus:ring-0 focus:outline-none focus:border-transparent 
                                       font-normal text-sm leading-relaxed ${isDarkMode ? 'text-orange-300' : 'text-violet-700'}`}
                        />
                    </motion.div>
                </AnimatePresence>
                
                {/* Statut */}
                <div className="text-right text-xs mt-2 transition-opacity flex-shrink-0" style={{ color: isDarkMode ? '#A855F7' : '#718096' }}>
                    {status}
                </div>
            </div>
        </DashboardCard>
    );
};

export default Notepad;