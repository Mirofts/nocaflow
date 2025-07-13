// components/dashboard/TeamManagement.js
import React from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';
// NOUVEAU : Imports pour le glisser-déposer
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const TeamMemberItem = ({ member, onEditMember, onDeleteMember, onQuickChat, onAssign, t }) => {
    const { isDarkMode } = useTheme();

    // NOUVEAU : On rend le composant "draggable"
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: member.id, // ID unique pour le glisser-déposer
        data: { type: 'member', person: member }, // On passe des données utiles
    });

    // Style pour le déplacement visuel de l'élément
    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1, // L'élément glissé devient semi-transparent
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        // NOUVEAU : On applique les propriétés de dnd-kit à la div principale
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`p-3 flex items-center justify-between gap-3 group ${isDarkMode ? 'bg-slate-700' : 'bg-color-bg-tertiary border border-color-border-primary'} rounded-lg shadow-sm cursor-grab`}>
            <div className="flex items-center gap-3">
                <Image
                    src={member.avatar || '/images/default-avatar.png'}
                    alt={member.name}
                    width={40}
                    height={40}
                    className={`rounded-full object-cover flex-shrink-0 border ${isDarkMode ? 'border-slate-600' : 'border-color-border-primary'}`}
                />
                <div>
                    <p className="font-bold text-color-text-primary">{member.name}</p>
                    <p className="text-xs text-color-text-secondary">{member.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Les boutons ne sont plus nécessaires sur l'élément qui est glissé, mais on les garde pour l'instant */}
                <motion.button onClick={() => onQuickChat(member)} /* ... */ > {/* ... svg ... */} </motion.button>
                <motion.button onClick={() => onAssign(member)} /* ... */ > {/* ... svg ... */} </motion.button>
                <motion.button onClick={() => onEditMember(member)} /* ... */ > {/* ... svg ... */} </motion.button>
                <motion.button onClick={() => onDeleteMember(member.id)} /* ... */ > {/* ... svg ... */} </motion.button>
            </div>
        </div>
    );
};

// MODIFIÉ : Le composant reçoit maintenant la liste complète des membres via les props
const TeamManagement = ({ members, onAddMember, onEditMember, onDeleteMember, onQuickChat, onAssign, t }) => {
    
    // NOUVEAU : On filtre pour n'afficher que les membres non assignés à un groupe
    const unassignedMembers = (members || []).filter(m => !m.groupId);

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        } title={t('my_team', 'Mon Équipe')} className="h-full">
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-color-text-primary">{t('unassigned_members', 'Membres non assignés')}</h3>
                    <span className="text-pink-400 text-3xl font-extrabold">{unassignedMembers.length}</span>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {unassignedMembers.length > 0 ? (
                        unassignedMembers.map(member => (
                            <TeamMemberItem
                                key={member.id}
                                member={member}
                                onEditMember={onEditMember}
                                onDeleteMember={onDeleteMember}
                                onQuickChat={onQuickChat}
                                onAssign={onAssign}
                                t={t}
                            />
                        ))
                    ) : (
                        <p className="text-center p-8 text-sm text-color-text-secondary">{t('no_unassigned_members', 'Aucun membre non assigné.')}</p>
                    )}
                </div>
                <div className="mt-4 flex-shrink-0">
                    <motion.button
                        onClick={onAddMember}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg main-action-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        {t('add_member', 'Ajouter un membre')}
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default TeamManagement;