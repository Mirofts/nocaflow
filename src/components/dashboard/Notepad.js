// src/components/dashboard/Notepad.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import ShareNoteModal from './modals/ShareNoteModal';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
let domPurifyInstance = null;

const Notepad = ({ uid, isGuest, availableTeamMembers = [], clients = [], t, className = '' }) => {
    const [notes, setNotes] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [editingTabId, setEditingTabId] = useState(null);
    const [status, setStatus] = useState(t('ready', 'Prêt'));
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [noteToDeleteId, setNoteToDeleteId] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [noteToShare, setNoteToShare] = useState(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isDOMPurifyReady, setIsDOMPurifyReady] = useState(false);

    const timeoutRef = useRef(null);
    const titleInputRef = useRef(null);
    const tabsContainerRef = useRef(null);
    const { isDarkMode } = useTheme();
    const migrationHasRun = useRef(false);

    const quillModules = {
        toolbar: {
            container: [
                ['bold', 'underline', 'link'],
                [{ 'color': ["#fdb974", "#6B46C1", "#FFFFFF", "#F87171", "#60A5FA", "#34D399"] }],
            ],
        },
        clipboard: { matchVisual: false },
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && !domPurifyInstance) {
            import('dompurify').then(mod => {
                domPurifyInstance = mod.default;
                setIsDOMPurifyReady(true);
            }).catch(err => console.error("Échec du chargement de DOMPurify:", err));
        } else if (domPurifyInstance) {
            setIsDOMPurifyReady(true);
        }
    }, []);

useEffect(() => {
    if (isGuest || !uid || !isDOMPurifyReady) {
        // Gestion du mode invité (ne change pas)
        if(isGuest) {
            const guestNote = { id: 'guest_note', title: 'Note Invité', content: '', ownerId: 'guest', accessList: ['guest'] };
            setNotes([guestNote]);
            setActiveTabId(guestNote.id);
        }
        return;
    }

    let unsubscribe = () => {}; // Initialise une fonction de nettoyage vide

    const setupNotesListener = async () => {
        // Étape 1 : On tente la migration des anciennes notes (une seule fois)
        if (!migrationHasRun.current) {
            const oldNotesDocRef = doc(db, 'userNotes', uid);
            const oldNotesSnap = await getDoc(oldNotesDocRef);

            if (oldNotesSnap.exists() && oldNotesSnap.data().notes) {
                const batch = writeBatch(db);
                oldNotesSnap.data().notes.forEach(note => {
                    const newNoteRef = doc(collection(db, 'notes'));
                    batch.set(newNoteRef, {
                        title: note.title,
                        content: note.content || '',
                        ownerId: uid,
                        accessList: [uid],
                        createdAt: serverTimestamp()
                    });
                });
                batch.delete(oldNotesDocRef); // On supprime l'ancien document après la migration
                await batch.commit();
            }
            migrationHasRun.current = true; // On s'assure que la migration ne se relance pas
        }

        // Étape 2 : On écoute en temps réel la collection de notes partageables
        const notesQuery = query(collection(db, 'notes'), where("accessList", "array-contains", uid));
        
        unsubscribe = onSnapshot(notesQuery, (snapshot) => {
            const loadedNotes = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                content: domPurifyInstance.sanitize(doc.data().content || '')
            }));

            if (loadedNotes.length > 0) {
                setNotes(loadedNotes);
                // Garder l'onglet actif s'il existe toujours
                setActiveTabId(prevId => loadedNotes.some(n => n.id === prevId) ? prevId : loadedNotes[0].id);
            } else {
                 // Si l'utilisateur n'a aucune note après migration, on lui en crée une
                 addDoc(collection(db, 'notes'), {
                    title: t('default_note_title', 'Mes Idées'),
                    content: '',
                    ownerId: uid,
                    accessList: [uid],
                    createdAt: serverTimestamp()
                });
            }
            setStatus(t('saved', 'Sauvegardé'));
        }, (error) => {
            console.error("Error fetching notes:", error);
            setStatus(t('error', 'Erreur'));
        });
    };

    setupNotesListener();

    // La fonction de nettoyage qui sera appelée quand le composant est démonté
    return () => {
        unsubscribe();
    };
}, [uid, isGuest, t, isDOMPurifyReady]); // Dépendances du useEffect

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

    const debouncedSaveContent = useCallback((noteId, content) => {
        if (isGuest || !uid || !isDOMPurifyReady) return;
        setStatus(t('editing', 'Édition...'));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            setStatus(t('saving', 'Sauvegarde...'));
            try {
                const noteRef = doc(db, 'notes', noteId);
                await updateDoc(noteRef, { content: domPurifyInstance.sanitize(content) });
                setStatus(t('saved', 'Sauvegardé'));
            } catch (error) {
                console.error("Error saving note content:", error);
                setStatus(t('error_saving', 'Erreur de sauvegarde'));
            }
        }, 1500);
    }, [uid, isGuest, t, isDOMPurifyReady]);

    const handleContentChange = (content) => {
        if (!activeTabId) return;
        setNotes(prevNotes => prevNotes.map(note => note.id === activeTabId ? { ...note, content } : note));
        debouncedSaveContent(activeTabId, content);
    };

    const handleAddNote = async () => {
        if (isGuest || !uid) return;
        const newNoteData = {
            title: `${t('new_note_title', 'Note')} ${notes.length + 1}`,
            content: '',
            ownerId: uid,
            accessList: [uid],
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'notes'), newNoteData);
        setActiveTabId(docRef.id);
    };

    const handleDeleteNote = (idToDelete) => {
        if (notes.length <= 1) {
            alert(t('cannot_delete_last_note', 'Vous ne pouvez pas supprimer le dernier onglet.'));
            return;
        }
        setNoteToDeleteId(idToDelete);
        setIsConfirmModalOpen(true);
    };

    const executeDelete = async () => {
        if (noteToDeleteId && !isGuest) {
            try {
                await deleteDoc(doc(db, 'notes', noteToDeleteId));
                setNoteToDeleteId(null);
                setIsConfirmModalOpen(false);
            } catch (error) {
                console.error("Error deleting note:", error);
            }
        } else {
            setIsConfirmModalOpen(false);
        }
    };

    const handleTitleChange = (noteId, newTitle) => {
        setNotes(prevNotes => prevNotes.map(note => note.id === noteId ? { ...note, title: newTitle } : note));
        if (!isGuest && uid) {
            updateDoc(doc(db, 'notes', noteId), { title: newTitle });
        }
    };

    const handleTitleBlur = () => setEditingTabId(null);

    const scrollTabs = (direction) => {
        tabsContainerRef.current?.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    const openShareModal = (note) => {
        setNoteToShare(note);
        setIsShareModalOpen(true);
    };

    const activeNote = notes.find(note => note.id === activeTabId);
    const allContacts = useMemo(() => [...availableTeamMembers, ...clients], [availableTeamMembers, clients]);

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
                                <div key={note.id} onDoubleClick={() => !isGuest && setEditingTabId(note.id)} className={`flex-shrink-0 flex items-center justify-between text-sm px-4 py-2 cursor-pointer rounded-t-lg border-b-2 whitespace-nowrap ${activeTabId === note.id ? 'border-pink-500 text-color-text-primary bg-color-bg-tertiary' : 'border-transparent text-color-text-secondary hover:bg-color-bg-hover'}`}>
                                    {editingTabId === note.id ? (
                                        <input ref={titleInputRef} type="text" value={note.title} onChange={(e) => handleTitleChange(note.id, e.target.value)} onBlur={handleTitleBlur} onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()} className="bg-transparent border-0 focus:ring-0 p-0 m-0 w-28 text-sm" />
                                    ) : (
                                        <span onClick={() => setActiveTabId(note.id)} className="pr-2" title={note.title}>
                                            <span className="font-bold sm:hidden">{index + 1}</span>
                                            <span className="hidden sm:inline">{note.title}</span>
                                        </span>
                                    )}
                                    <div className="flex items-center ml-2 space-x-1">
                                        <button onClick={(e) => { e.stopPropagation(); openShareModal(note); }} className="p-0.5 rounded-full hover:bg-blue-500/20 text-slate-400 hover:text-blue-500 transition-colors" title={t('share_note', 'Partager la note')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="p-0.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors" title={t('delete_note', 'Supprimer la note')}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
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

            <AnimatePresence>
                {isShareModalOpen && noteToShare && (
                    <ShareNoteModal
                        note={noteToShare}
                        contacts={allContacts}
                        onClose={() => setIsShareModalOpen(false)}
                        t={t}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Notepad;