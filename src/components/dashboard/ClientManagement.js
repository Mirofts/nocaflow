// components/dashboard/ClientManagement.js
import React from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
// NOUVEAU : Imports pour le glisser-déposer
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';


const ClientItem = ({ client, onEditClient, onDeleteClient, onInvoiceForm, onClientInvoices, t }) => {
    const { isDarkMode } = useTheme();

    // NOUVEAU : On rend le composant "draggable"
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: client.id, // ID unique
        data: { type: 'client', person: client }, // Données pour savoir que c'est un client
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        // NOUVEAU : On applique les propriétés de dnd-kit à la div principale
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`p-3 flex items-center justify-between gap-3 group ${isDarkMode ? 'bg-slate-700' : 'bg-color-bg-tertiary border border-color-border-primary'} rounded-lg shadow-sm cursor-grab`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} text-color-text-primary`}>
                    {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-color-text-primary">{client.name}</p>
                    <p className="text-xs text-color-text-secondary">{client.contactEmail}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Actions pour le client */}
                <motion.button onClick={() => onClientInvoices(client)} title="Voir les factures" className="p-2 rounded-full hover:bg-emerald-500/20"><svg width="16" height="16" fill="currentColor" className="text-emerald-400" viewBox="0 0 16 16"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1"/></svg></motion.button>
                <motion.button onClick={() => onEditClient(client)} title="Modifier" className="p-2 rounded-full hover:bg-slate-600"><svg width="16" height="16" fill="currentColor" className="text-blue-400" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></motion.button>
                <motion.button onClick={() => onDeleteClient(client.id)} title="Supprimer" className="p-2 rounded-full hover:bg-red-500/20"><svg width="16" height="16" fill="currentColor" className="text-red-500" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></motion.button>
            </div>
        </div>
    );
};

// MODIFIÉ : Le composant principal est maintenant plus simple
const ClientManagement = ({ clients, onAddClient, onEditClient, onDeleteClient, onInvoiceForm, onClientInvoices, t }) => {

    // NOUVEAU : On filtre pour n'afficher que les clients non assignés
    const unassignedClients = (clients || []).filter(c => !c.groupId);

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        } title={t('my_clients', 'Mes Clients')} className="h-full">
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-color-text-primary">{t('unassigned_clients', 'Clients non assignés')}</h3>
                    <span className="text-pink-400 text-3xl font-extrabold">{unassignedClients.length}</span>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {unassignedClients.length > 0 ? (
                        unassignedClients.map(client => (
                            <ClientItem
                                key={client.id}
                                client={client}
                                onEditClient={onEditClient}
                                onDeleteClient={onDeleteClient}
                                onInvoiceForm={onInvoiceForm}
                                onClientInvoices={onClientInvoices}
                                t={t}
                            />
                        ))
                    ) : (
                        <p className="text-center p-8 text-sm text-color-text-secondary">{t('no_unassigned_clients', 'Aucun client non assigné.')}</p>
                    )}
                </div>
                <div className="mt-4 flex-shrink-0">
                    <motion.button
                        onClick={onAddClient}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg main-action-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        {t('add_client', 'Ajouter un client')}
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default ClientManagement;