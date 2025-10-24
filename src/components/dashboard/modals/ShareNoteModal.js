// src/components/dashboard/modals/ShareNoteModal.js
import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const ShareNoteModal = ({ note, contacts, onClose, t }) => {
    const [accessList, setAccessList] = useState(note?.accessList || []);
    const [loading, setLoading] = useState(false);

    const toggleAccess = (contactId) => {
        if (contactId === note.ownerId) return; // Ne pas autoriser la suppression du propriétaire
        
        setAccessList(currentList =>
            currentList.includes(contactId)
                ? currentList.filter(id => id !== contactId)
                : [...currentList, contactId]
        );
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const noteRef = doc(db, 'notes', note.id);
            await updateDoc(noteRef, { accessList: accessList });
            onClose();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du partage :", error);
            alert("Échec de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Partager la note "{note.title}"</h2>
            <p className="text-sm text-slate-400 mb-6">Sélectionnez les personnes qui peuvent voir cette note.</p>

            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {contacts.map(contact => {
                    const hasAccess = accessList.includes(contact.uid);
                    const isOwner = contact.uid === note.ownerId;
                    return (
                        <div 
                            key={contact.uid}
                            onClick={() => toggleAccess(contact.uid)}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${isOwner ? 'bg-slate-700/50 opacity-70' : hasAccess ? 'bg-purple-600/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                        >
<span className="font-medium text-white">{contact.displayName || contact.name || contact.email || 'Contact inconnu'}</span>                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${isOwner || hasAccess ? 'bg-purple-500 border-purple-400' : 'border-slate-500'}`}>
                                {(isOwner || hasAccess) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-3 mt-8">
                <button onClick={onClose} className="main-button-secondary">Annuler</button>
                <button onClick={handleSaveChanges} disabled={loading} className="main-action-button bg-purple-500">
                    {loading ? 'Sauvegarde...' : 'Sauvegarder les changements'}
                </button>
            </div>
        </ModalWrapper>
    );
};

export default ShareNoteModal;