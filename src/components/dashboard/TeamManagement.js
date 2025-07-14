// components/dashboard/TeamManagement.js
import React, { useState, useEffect } from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
// ASSUREZ-VOUS QUE LA LIGNE CI-DESSOUS EST ABSOLUMENT SUPPRIMÉE OU COMMENTÉE
// import AddMemberModal from './AddMemberModal'; // <-- CETTE LIGNE DOIT ÊTRE SUPPRIMÉE OU COMMENTÉE !!

const TeamMemberItem = ({ member, t }) => {
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
                        src={member.avatar || '/images/avatars/default-avatar.jpg'} // Vérifiez que ce chemin existe
                        alt={member.name}
                        width={40}
                        height={40}
                        className={`rounded-full object-cover border ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
                    />
                    {member.status === 'pending' && (
                        <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full bg-amber-400 border-2 border-white dark:border-slate-700" title={t("pending_validation", "En attente de validation")}></span>
                    )}
                </div>
                <div>
                    <p className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{member.name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{member.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Icônes d’action à ajouter ici */}
            </div>
        </div>
    );
};

const TeamManagement = ({ members = [], t, openModal }) => { // openModal doit être une prop
    const [membersState, setMembersState] = useState(members || []);

    React.useEffect(() => {
        setMembersState(members);
    }, [members]);

    const unassignedMembers = membersState.filter(m => !m.groupId);

    return (
        <>
            <DashboardCard
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                }
                title={t('my_team', 'Mon Équipe')}
                className="h-full"
            >
                <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {t('unassigned_members', 'Membres non assignés')}
                        </h3>
                        <span className="text-pink-400 text-3xl font-extrabold">{unassignedMembers.length}</span>
                    </div>
                    <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                        {unassignedMembers.length > 0 ? (
                            unassignedMembers.map(member => (
                                <TeamMemberItem key={member.id} member={member} t={t} />
                            ))
                        ) : (
                            <p className="text-center p-8 text-sm text-slate-500 dark:text-slate-400">
                                {t('no_unassigned_members', 'Aucun membre non assigné.')}
                            </p>
                        )}
                    </div>
                    <div className="mt-4 flex-shrink-0">
                        <motion.button
                            onClick={() => openModal('teamMember', { mode: 'add' })} // C'est l'appel correct
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg text-white font-bold py-2 px-4 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 8v8"/>
                                <path d="M8 12h8"/>
                            </svg>
                            {t('add_member', 'Ajouter un membre')}
                        </motion.button>
                    </div>
                </div>
            </DashboardCard>
        </>
    );
};

export default TeamManagement;