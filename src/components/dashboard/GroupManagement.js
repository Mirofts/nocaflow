// src/components/dashboard/GroupManagement.js
import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
// NOUVEAU : Import pour la gestion des zones de dépôt
import { useDroppable } from '@dnd-kit/core';

// Petit composant pour afficher un avatar
const MemberAvatar = ({ person }) => (
    <div title={person.name}>
        <img 
            src={person.avatar || person.photoURL || '/images/avatars/default.png'} 
            alt={person.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-slate-600 ring-2 ring-slate-800"
        />
    </div>
);

// NOUVEAU : Le composant pour une zone de groupe qui peut recevoir des éléments
const GroupDropZone = ({ group, members, clients, onDeleteGroup }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: group.id,
    });

    const style = {
        // Change la couleur du fond quand on survole avec un avatar
        backgroundColor: isOver ? 'rgba(236, 72, 153, 0.1)' : undefined,
        transition: 'background-color 0.2s ease-in-out',
    };

    return (
        <div ref={setNodeRef} style={style} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-white">{group.name}</h4>
                {group.id !== 'default' && (
                    <button onClick={() => onDeleteGroup(group.id)} className="text-red-500 hover:text-red-400 text-xs transition-colors">Supprimer</button>
                )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-dashed border-slate-600 rounded-md">
                {members.map(m => <MemberAvatar key={m.id} person={m} />)}
                {clients.map(c => <MemberAvatar key={c.id} person={c} />)}
            </div>
        </div>
    );
};


const GroupManagement = ({ groups, allMembers, allClients, onAddGroup, onDeleteGroup, t }) => {
    const [newGroupName, setNewGroupName] = useState('');

    const handleAddGroup = (e) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            onAddGroup(newGroupName.trim());
            setNewGroupName('');
        }
    };

    return (
        <DashboardCard 
            icon={ // CORRECTION : Remplacement du commentaire par une vraie icône SVG
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            } 
            title="Mes Groupes" 
            className="h-full"
        >
            <div className="flex flex-col h-full">
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {(groups || []).map(group => (
                        <GroupDropZone
                            key={group.id}
                            group={group}
                            members={allMembers.filter(m => m.groupId === group.id)}
                            clients={allClients.filter(c => c.groupId === group.id)}
                            onDeleteGroup={onDeleteGroup}
                        />
                    ))}
                </div>
                <form onSubmit={handleAddGroup} className="mt-4 flex gap-2 flex-shrink-0">
                    <input 
                        type="text" 
                        value={newGroupName} 
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="Nom du nouveau groupe..."
                        className="form-input"
                    />
                    <button type="submit" className="main-button-secondary">Créer</button>
                </form>
            </div>
        </DashboardCard>
    );
};

export default GroupManagement;