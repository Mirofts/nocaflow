// src/components/dashboard/FlowLiveMessages/modals/NewDiscussionModal.js
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const NewDiscussionModal = ({
  showModal,
  onClose,
  onCreate,
  internalAvailableTeamMembers,
  currentFirebaseUid,
  findUserByIdOrEmail, // NOUVEAU : Fonction pour rechercher un utilisateur
  t
}) => {
    const [addMode, setAddMode] = useState('list'); // 'list', 'id', 'email'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Ajoute l'utilisateur actuel par défaut
        const currentUser = internalAvailableTeamMembers.find(m => m.uid === currentFirebaseUid);
        if (currentUser) {
            setSelectedParticipants([currentUser]);
        }
    }, [currentFirebaseUid, internalAvailableTeamMembers]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        const result = await findUserByIdOrEmail(searchTerm.trim(), addMode);
        if (result) {
            setSearchResults(result);
        } else {
            alert(t('user_not_found', 'Aucun utilisateur trouvé.'));
        }
        setIsLoading(false);
    };
    
    const addParticipant = (user) => {
        if (!selectedParticipants.some(p => p.uid === user.uid)) {
            setSelectedParticipants(prev => [...prev, user]);
        }
        setSearchTerm('');
        setSearchResults(null);
    };

    const removeParticipant = (userId) => {
        // Empêche de retirer l'utilisateur actuel
        if (userId === currentFirebaseUid) return;
        setSelectedParticipants(prev => prev.filter(p => p.uid !== userId));
    };

    const handleCreateDiscussion = () => {
        if (selectedParticipants.length < 1) {
            alert(t('add_at_least_one_participant', 'Veuillez ajouter au moins un participant.'));
            return;
        }
        // La logique de création utilise maintenant la liste complète des participants
        onCreate({
            name: groupName,
            participants: selectedParticipants,
        });
        onClose();
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4 text-white">{t('new_discussion_title', 'Nouvelle discussion')}</h3>
                
                {/* --- Sélecteur de méthode d'ajout --- */}
                <div className="mb-4 flex space-x-1 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
                    <button onClick={() => setAddMode('list')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${addMode === 'list' ? 'bg-pink-500' : 'hover:bg-slate-700'}`}>Depuis la liste</button>
                    <button onClick={() => setAddMode('id')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${addMode === 'id' ? 'bg-pink-500' : 'hover:bg-slate-700'}`}>Par ID</button>
                    <button onClick={() => setAddMode('email')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${addMode === 'email' ? 'bg-pink-500' : 'hover:bg-slate-700'}`}>Par Email</button>
                </div>

                {/* --- Section d'ajout --- */}
                {addMode === 'list' ? (
                    <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                        {internalAvailableTeamMembers.map(member => (
                            <div key={member.uid} onClick={() => addParticipant(member)} className="flex items-center p-2 rounded-md hover:bg-slate-700 cursor-pointer">
                                {/* ... Affichage du membre ... */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={`Entrez l'${addMode === 'id' ? 'ID' : 'email'}...`} className="form-input flex-grow" />
                        <button onClick={handleSearch} disabled={isLoading} className="main-button-secondary">{isLoading ? '...' : 'Chercher'}</button>
                    </div>
                )}

                {/* --- Affichage du résultat de la recherche --- */}
                {searchResults && (
                    <div className="p-2 my-2 bg-slate-700 rounded-md flex justify-between items-center">
                        <span>{searchResults.displayName} ({searchResults.customId || searchResults.email})</span>
                        <button onClick={() => addParticipant(searchResults)} className="text-green-400 text-sm font-bold">+</button>
                    </div>
                )}
                
                {/* --- Section des participants sélectionnés --- */}
                <div className="mt-4">
                    <label className="text-sm text-slate-400 mb-2 block">Participants</label>
                    <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700 min-h-[50px] flex flex-wrap gap-2">
                        {selectedParticipants.map(p => (
                            <div key={p.uid} className="flex items-center gap-2 bg-slate-700 rounded-full px-2 py-1">
                                <span className="text-sm text-white">{p.displayName}</span>
                                {p.uid !== currentFirebaseUid && (
                                    <button onClick={() => removeParticipant(p.uid)} className="text-red-400">&times;</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* --- Nom du groupe (si plus de 2 participants) --- */}
                {selectedParticipants.length > 2 && (
                    <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Nom du groupe (optionnel)" className="form-input mt-4"/>
                )}

                {/* --- Boutons d'action --- */}
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="main-button-secondary">Annuler</button>
                    <button onClick={handleCreateDiscussion} className="main-action-button bg-purple-500">Créer la discussion</button>
                </div>
            </motion.div>
        </div>
    );
};

export default NewDiscussionModal;