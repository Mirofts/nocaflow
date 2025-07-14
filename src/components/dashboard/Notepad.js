// src/components/dashboard/Notepad.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardCard } from './DashboardCard';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Import dynamique pour ReactQuill, en s'assurant qu'il est chargé côté client
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Définition d'une variable qui sera assignée à l'instance de DOMPurify
// Elle sera initialement null côté serveur, puis l'instance DOMPurify côté client.
let domPurifyInstance = null; // Nommé différemment pour éviter toute confusion avec DOMPurify en tant que type/composant

// Helper pour générer un ID unique simple
const generateId = () => `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Donnée initiale pour un nouvel onglet
const createNewNote = (title = 'Nouvelle Note') => ({
    id: generateId(),
    title,
    content: ''
});

const Notepad = ({ uid, isGuest, onUpdateGuestData, t, className = '' }) => {
    const initialNotes = [createNewNote(t('default_note_title', 'Mes Idées'))];
    const [notes, setNotes] = useState(isGuest ? initialNotes : []);
    const [activeTabId, setActiveTabId] = useState(isGuest ? initialNotes[0]?.id : null);
    const [editingTabId, setEditingTabId] = useState(null);
    const [status, setStatus] = useState(t('ready', 'Prêt'));
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [noteToDeleteId, setNoteToDeleteId] = useState(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    // État pour savoir si DOMPurify est chargé et prêt à être utilisé
    const [isDOMPurifyReady, setIsDOMPurifyReady] = useState(false);

    const timeoutRef = useRef(null);
    const titleInputRef = useRef(null);
    const tabsContainerRef = useRef(null);
    const { isDarkMode } = useTheme();

    const quillModules = {
        toolbar: {
            container: [
                ['bold', 'underline', 'link'],
                [{ 'color': ["#fdb974", "#6B46C1", "#FFFFFF", "#F87171", "#60A5FA", "#34D399"] }],
            ],
        },
        clipboard: { matchVisual: false },
    };

    // NOUVEL EFFECT POUR INITIALISER DOMPURIFY CÔTÉ CLIENT
    useEffect(() => {
        // Cette vérification typeof window est cruciale pour le SSR.
        if (typeof window !== 'undefined' && !domPurifyInstance) {
            import('dompurify')
                .then(mod => {
                    domPurifyInstance = mod.default; // L'exportation par défaut de 'dompurify'
                    setIsDOMPurifyReady(true);
                    console.log("DOMPurify chargé et prêt !"); // Pour le débogage
                })
                .catch(err => {
                    console.error("Échec du chargement de DOMPurify:", err);
                    setIsDOMPurifyReady(false); // Marquer comme non prêt en cas d'erreur
                });
        } else if (domPurifyInstance) {
            // Si l'instance existe déjà (par exemple, après un Fast Refresh)
            setIsDOMPurifyReady(true);
        }
    }, []); // Dépendances vides pour que cela ne s'exécute qu'une fois au montage

    // Effect principal pour le chargement des notes (dépend maintenant de isDOMPurifyReady)
     useEffect(() => {
        if (!isDOMPurifyReady) return; // Attendre que DOMPurify soit prêt avant de charger/sanitiser

        if (isGuest) {
            const savedGuestData = JSON.parse(localStorage.getItem('nocaflow_guest_data') || '{}');
            const savedNotes = savedGuestData.notes && Array.isArray(savedGuestData.notes) && savedGuestData.notes.length > 0
                ? savedGuestData.notes
                : initialNotes;
            
            const sanitizedNotes = savedNotes.map(note => ({
                ...note,
                content: domPurifyInstance.sanitize(note.content) // Utiliser l'instance chargée
            }));
            setNotes(sanitizedNotes);

            if (!sanitizedNotes.some(n => n.id === activeTabId)) {
                setActiveTabId(sanitizedNotes[0]?.id || null);
            }
            setStatus(t('saved', 'Sauvegardé'));
            return;
        }
        if (!uid) return;

        const docRef = doc(db, 'userNotes', uid);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            let loadedNotes = [];
            if (snap.exists()) {
                const data = snap.data();
                if (data.notes && Array.isArray(data.notes) && data.notes.length > 0) {
                    loadedNotes = data.notes;
                } else {
                    loadedNotes = [createNewNote(t('default_note_title', 'Mes Idées'))];
                }
            } else {
                loadedNotes = [createNewNote(t('default_note_title', 'Mes Idées'))];
            }
            
            const sanitizedNotes = loadedNotes.map(note => ({
                ...note,
                content: domPurifyInstance.sanitize(note.content) // Utiliser l'instance chargée
            }));
            setNotes(sanitizedNotes);

            setActiveTabId(prevActiveId => {
                const activeNoteExists = sanitizedNotes.some(note => note.id === prevActiveId);
                if (!activeNoteExists) {
                    return sanitizedNotes[0]?.id || null;
                }
                return prevActiveId;
            });

            setStatus(t('saved', 'Sauvegardé'));
        }, (error) => {
            console.error("Error fetching user notes:", error);
            setStatus(t('error', 'Erreur'));
        });

        return () => unsubscribe();
    }, [uid, isGuest, t, isDOMPurifyReady]); // isDOMPurifyReady AJOUTÉ AUX DÉPENDANCES


    useEffect(() => {
        if (editingTabId && titleInputRef.current) titleInputRef.current.select();
    }, [editingTabId]);
    
    useEffect(() => {
        const checkScroll = () => {
            const el = tabsContainerRef.current;
            if (el) {
                const hasOverflow = el.scrollWidth > el.clientWidth;
                setCanScrollLeft(el.scrollLeft > 0);
                setCanScrollRight(hasOverflow && Math.ceil(el.scrollLeft) < (el.scrollWidth - el.clientWidth));
            }
        };
        const tabsEl = tabsContainerRef.current;
        checkScroll();
        tabsEl?.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        return () => {
            tabsEl?.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [notes]);

    const saveNotes = useCallback((notesToSave) => {
        // saveNotes sera appelé par debouncedSave, qui est conditionné par isDOMPurifyReady
        setStatus(t('saving', 'Sauvegarde...'));
        try {
            const sanitizedNotesForSave = notesToSave.map(note => ({
                ...note,
                // On utilise domPurifyInstance ici, qui est garanti d'être prêt
                content: domPurifyInstance.sanitize(note.content) 
            }));

            if (isGuest) onUpdateGuestData(prev => ({ ...prev, notes: sanitizedNotesForSave }));
            else if (uid) setDoc(doc(db, 'userNotes', uid), { notes: sanitizedNotesForSave }, { merge: true });
            
            setTimeout(() => setStatus(t('saved', 'Sauvegardé')), 700);
        } catch (error) { console.error("Error saving notes:", error); setStatus(t('error_saving', 'Erreur de sauvegarde')); }
    }, [isGuest, uid, onUpdateGuestData, t]);

    const debouncedSave = useCallback((updatedNotes) => {
        // Appeler debouncedSave seulement si DOMPurify est prêt
        if (!isDOMPurifyReady) {
            console.warn("DOMPurify n'est pas prêt, la sauvegarde est retardée/ignorée.");
            return;
        }
        setStatus(t('editing', 'Édition...'));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => saveNotes(updatedNotes), 1500);
    }, [saveNotes, t, isDOMPurifyReady]); // isDOMPurifyReady AJOUTÉ AUX DÉPENDANCES

    const handleContentChange = (content) => {
        const updatedNotes = notes.map(note => note.id === activeTabId ? { ...note, content } : note);
        setNotes(updatedNotes);
        debouncedSave(updatedNotes);
    };

    const handleAddNote = () => {
        const newNote = createNewNote(t('new_note_title', 'Note') + ` ${notes.length + 1}`);
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setActiveTabId(newNote.id);
        saveNotes(updatedNotes);
    };
    
    const handleDeleteNote = (idToDelete) => {
        if (notes.length <= 1) { alert(t('cannot_delete_last_note', 'Vous ne pouvez pas supprimer le dernier onglet.')); return; }
        setNoteToDeleteId(idToDelete);
        setIsConfirmModalOpen(true);
    };

    const executeDelete = () => {
        if (noteToDeleteId) {
            const updatedNotes = notes.filter(note => note.id !== noteToDeleteId);
            setNotes(updatedNotes);
            if (activeTabId === noteToDeleteId) setActiveTabId(updatedNotes[0]?.id || null);
            saveNotes(updatedNotes);
        }
        setIsConfirmModalOpen(false);
        setNoteToDeleteId(null);
    };

    const handleTitleChange = (newTitle) => {
        const updatedNotes = notes.map(note => note.id === editingTabId ? { ...note, title: newTitle } : note);
        setNotes(updatedNotes);
        debouncedSave(updatedNotes);
    };
    
    const handleTitleBlur = () => setEditingTabId(null);

    const scrollTabs = (direction) => {
        const container = tabsContainerRef.current;
        if (container) container.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    const activeNote = notes.find(note => note.id === activeTabId);
    
    return (
        <>
            <DashboardCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>}
                title={t('bloc_note_title', 'Bloc-notes')}
                className={`${className} notepad-card`}
                noContentPadding={true}
            >
                <div className="flex flex-col h-full">
                    <div className="relative flex items-center border-b border-color-border-primary p-2">
                        <AnimatePresence>
                            {canScrollLeft && (
                                <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={() => scrollTabs('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-color-bg-tertiary rounded-full shadow-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <div ref={tabsContainerRef} className="flex-grow flex items-center overflow-x-auto scrollbar-hide">
                            {notes.map((note, index) => (
                                <div key={note.id} onDoubleClick={() => setEditingTabId(note.id)} className={`flex-shrink-0 flex items-center justify-between text-sm px-4 py-2 cursor-pointer rounded-t-lg border-b-2 whitespace-nowrap ${activeTabId === note.id ? 'border-pink-500 text-color-text-primary bg-color-bg-tertiary' : 'border-transparent text-color-text-secondary hover:bg-color-bg-hover'}`}>
                                    {editingTabId === note.id ? (
                                        <input ref={titleInputRef} type="text" value={note.title} onChange={(e) => handleTitleChange(e.target.value)} onBlur={handleTitleBlur} onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()} className="bg-transparent border-0 focus:ring-0 p-0 m-0 w-28 text-sm" />
                                    ) : (
                                        <span onClick={() => setActiveTabId(note.id)} className="pr-2" title={note.title}>
                                            <span className="font-bold sm:hidden">{index + 1}</span>
                                            <span className="hidden sm:inline">{note.title}</span>
                                        </span>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="ml-2 p-0.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors" title={t('delete_note', 'Supprimer la note')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddNote} className="ml-2 p-2 rounded-md hover:bg-color-bg-hover text-color-text-secondary" title={t('add_new_note', 'Ajouter une note')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <AnimatePresence>
                            {canScrollRight && (
                                <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onClick={() => scrollTabs('right')} className="absolute right-8 top-1/2 -translate-y-1/2 z-10 p-1 bg-color-bg-tertiary rounded-full shadow-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-full flex-grow flex flex-col quill-container">
                        <ReactQuill
                            theme="snow"
                            value={activeNote?.content || ''}
                            onChange={handleContentChange}
                            modules={quillModules}
                            placeholder={t('notepad_placeholder_initial', 'Vos idées, vos pensées, votre génie...')}
                            className="flex-grow"
                        />
                    </div>
                    
                    <div className="text-right text-xs p-2 bg-color-bg-secondary border-t border-color-border-primary">
                        {status}
                    </div>
                </div>
            </DashboardCard>

            <ConfirmDeleteModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeDelete}
                title="Supprimer la note"
                message="Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible."
            />
        </>
    );
};

export default Notepad;