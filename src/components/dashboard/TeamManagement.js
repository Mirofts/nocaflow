// components/dashboard/TeamManagement.js
import React, { useState, useEffect, useCallback } from 'react'; // Ensure all hooks used are imported
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { initialMockData } from '../../lib/mockData';
import { useTheme } from '../../context/ThemeContext';

const TeamMemberItem = ({ member, onEditMember, onDeleteMember, onQuickChat, onAssign, t }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`p-3 flex items-center justify-between gap-3 group ${isDarkMode ? 'bg-slate-700' : 'bg-color-bg-tertiary border border-color-border-primary'} rounded-lg shadow-sm`}>
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
                <motion.button
                    onClick={() => onQuickChat(member)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-violet-600 text-white' : 'hover:bg-violet-200 text-violet-600'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('quick_chat_tooltip', 'Chat rapide')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9.3 9.3 0 0 1 4 16.1V15a9 9 0 0 1 12 0v1.1c0 2.2 2.7 3.9 4 5.9a2 2 0 0 0 2-2v-4.6c0-4.6-3.7-8.3-8.3-8.3S3 7.5 3 12c0 2.2 1.1 4.2 2.7 5.7L3.6 20.3c-.4.5-.1 1.3.5 1.5H19c.6-.2.9-.9.5-1.5l-1.9-2.6Z"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onAssign(member)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-pink-600 text-white' : 'hover:bg-pink-200 text-pink-600'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('assign_task_tooltip', 'Assigner tâche/projet')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onEditMember(member)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('edit', 'Modifier')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onDeleteMember(member.id)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-red-600 text-red-400 hover:text-white' : 'hover:bg-red-100 text-red-500 hover:text-red-600'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('delete', 'Supprimer')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </motion.button>
            </div>
        </div>
    );
};

const TeamManagement = ({ onAddMember, onEditMember, onDeleteMember, onQuickChat, onAssign, t }) => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        setMembers(initialMockData.staffMembers);
    }, []);

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        } title={t('my_team', 'Mon Équipe')} className="h-full">
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-color-text-primary">{t('total_members', 'Membres Totaux')}</h3>
                    <span className="text-pink-400 text-3xl font-extrabold">{(members || []).length}</span>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {(members || []).length > 0 ? (
                        (members || []).map(member => (
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
                        <p className="text-center p-8 text-sm text-color-text-secondary">{t('no_team_members', 'Aucun membre d\'équipe à afficher. Ajoutez-en un !')}</p>
                    )}
                </div>
                <div className="mt-4 flex-shrink-0">
                    <motion.button
                        onClick={() => onAddMember()}
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