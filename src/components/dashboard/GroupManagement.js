// src/components/dashboard/GroupManagement.js
import React, { useState, useEffect, useRef } from 'react';
import { DashboardCard } from './DashboardCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const MemberAvatar = ({ person, type }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: person.id,
        data: { type, person },
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={person.name} className="cursor-grab">
            <img 
                src={person.avatar || person.photoURL || '/images/avatars/default.png'} 
                alt={person.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-slate-600 ring-2 ring-slate-800"
            />
        </div>
    );
};

// Dans src/components/dashboard/GroupManagement.js

const GroupDropZone = ({ group, members, clients, onDeleteGroup, onRenameGroup, onGroupAction }) => {
    const { isOver, setNodeRef } = useDroppable({ id: group.id });
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(group.name);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (name.trim() && name.trim() !== group.name) {
            onRenameGroup(group.id, name.trim());
        } else {
            setName(group.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleRename();
        if (e.key === 'Escape') {
            setName(group.name);
            setIsEditing(false);
        }
    };

    const style = {
        backgroundColor: isOver ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
        border: isOver ? '1px dashed #ec4899' : '1px dashed var(--color-border-primary)',
        transition: 'all 0.2s ease-in-out',
    };

    const isEmpty = members.length === 0 && clients.length === 0;

    return (
        <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-2 gap-2">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        className="form-input text-sm p-1 w-full"
                    />
                ) : (
                    <h4 onDoubleClick={() => setIsEditing(true)} className="font-bold text-white cursor-pointer truncate" title={group.name}>
                        {group.name}
                    </h4>
                )}
                
                {/* NOUVEAU : Barre d'icônes d'action remplace le menu */}
                <div className="flex items-center flex-shrink-0 bg-slate-700/50 rounded-full p-1">
                    <button onClick={() => onGroupAction('addTask', group)} title="Ajouter une tâche de groupe" className="action-icon-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM12 18c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm-2-9h4v2h-4V9z"/></svg>
                    </button>
                    <button onClick={() => onGroupAction('addDeadline', group)} title="Ajouter une deadline de groupe" className="action-icon-button">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 13H3a1 1 0 0 1 0-2h18a1 1 0 0 1 0 2zm-9-9a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1z"/></svg>
                    </button>
                    <button onClick={() => onGroupAction('startDiscussion', group)} title="Démarrer une discussion de groupe" className="action-icon-button">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-4H6V6h12v2z"/></svg>
                    </button>
                    {group.id !== 'default' && (
                        <button onClick={() => onDeleteGroup(group.id)} title="Supprimer le groupe" className="action-icon-button text-red-500/70 hover:text-red-500">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    )}
                </div>
            </div>
            <div ref={setNodeRef} style={style} className="flex flex-wrap items-center gap-2 min-h-[56px] p-2 rounded-md">
                {isEmpty ? (
                    <div className="text-center text-xs text-slate-500 w-full">Glissez les avatars ici</div>
                ) : (
                    <>
                        {members.map(m => <MemberAvatar key={`member-${m.id}`} person={m} type="member" />)}
                        {clients.map(c => <MemberAvatar key={`client-${c.id}`} person={c} type="client" />)}
                    </>
                )}
            </div>
        </div>
    );
};

const GroupManagement = ({ groups, allMembers, allClients, onAddGroup, onDeleteGroup, onRenameGroup, onGroupAction, t }) => {
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
            icon={
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
                    {(groups || []).map(group => {
                        const groupMembers = allMembers.filter(m => m.groupId === group.id || (group.id === 'default' && !m.groupId));
                        const groupClients = allClients.filter(c => c.groupId === group.id || (group.id === 'default' && !c.groupId));
                        
                        return (
                            <GroupDropZone
                                key={group.id}
                                group={group}
                                members={groupMembers}
                                clients={groupClients}
                                onDeleteGroup={onDeleteGroup}
                                onRenameGroup={onRenameGroup}
                                onGroupAction={onGroupAction}
                            />
                        )
                    })}
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