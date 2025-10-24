// components/dashboard/TeamManagement.js
import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const TeamMemberItem = ({ member, t, openModal, onDeleteMember, onStartChat }) => {
    const { isDarkMode } = useTheme();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: member.id,
        data: { type: 'member', person: member },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'transform 0.2s ease',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
             className={`p-3 flex items-center justify-between gap-3 group ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg shadow-sm`}>
            <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                    <Image
                        src={member.avatar || '/images/avatars/default-avatar.jpg'}
                        alt={member.name}
                        width={40}
                        height={40}
                        className={`rounded-full object-cover border ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
                    />
                    {/* --- NOUVEAU : Indicateur de présence (Online/Offline) --- */}
                    <span 
                        className={`absolute -bottom-1 -right-1 block h-4 w-4 rounded-full border-2 ${isDarkMode ? 'border-slate-700' : 'border-white'} ${member.isOnline ? 'bg-green-500' : 'bg-slate-500'}`}
                        title={member.isOnline ? t('online', 'En ligne') : t('offline', 'Hors ligne')}
                    ></span>
                </div>
                <div>
                    <p className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{member.name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{member.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                    onClick={() => openModal('teamMember', { mode: 'edit', member: member })}
                    title={t('edit_member', 'Modifier le membre')}
                    className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.74,3.02,20.98,6.26,7.5,19.75,4.25,16.5ZM22.4,4.85,21.15,6.1l-4.7-4.7L17.7,0A1.5,1.5,0,0,1,19.82,0l2.58,2.58A1.5,1.5,0,0,1,22.4,4.85ZM2.5,21.5a.5.5,0,0,0,.5.5l4.38-.93L3.43,17.12Z"/></svg>
                </motion.button>
                {/* --- MODIFIÉ : Le bouton de chat appelle onStartChat --- */}
                <motion.button
                    onClick={() => onStartChat(member)}
                    title={t('start_chat', 'Démarrer la conversation')}
                    className="p-2 rounded-full hover:bg-green-500/20 text-green-400"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-4H6V6h12v2z"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onDeleteMember(member.id)}
                    title={t('delete_member', 'Supprimer le membre')}
                    className="p-2 rounded-full hover:bg-red-500/20 text-red-500"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </motion.button>
            </div>
        </div>
    );
};

const TeamManagement = ({ members = [], t, openModal, onDeleteMember, onStartChat }) => {
    const [membersState, setMembersState] = useState(members || []);

    useEffect(() => {
        setMembersState(members);
    }, [members]);

    const allMembers = membersState;

    return (
        <DashboardCard
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            }
            title={t('my_team', 'Mon Équipe')}
            className="h-full"
        >
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('all_members', 'Tous les membres')}</h3>
                    <span className="text-pink-400 text-3xl font-extrabold">{allMembers.length}</span>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {allMembers.length > 0 ? (
                        allMembers.map(member => (
                            <TeamMemberItem
                                key={member.id}
                                member={member}
                                t={t}
                                openModal={openModal}
                                onDeleteMember={onDeleteMember}
                                onStartChat={onStartChat} // <-- Passer la nouvelle prop
                            />
                        ))
                    ) : (
                        <p className="text-center p-8 text-sm text-slate-500 dark:text-slate-400">{t('no_members_yet', 'Aucun membre dans l\'équipe.')}</p>
                    )}
                </div>
                <div className="mt-4 flex-shrink-0">
                    <motion.button
                        onClick={() => openModal('teamMember', { mode: 'add' })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg text-white font-bold py-2 px-4 rounded-lg"
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