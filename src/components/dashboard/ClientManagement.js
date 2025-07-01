// components/dashboard/ClientManagement.js
import React, { useState, useEffect, useCallback } from 'react'; // Re-verified: useCallback explicitly imported
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { initialMockData } from '../../lib/mockData';
import { useTheme } from '../../context/ThemeContext';

const ClientItem = ({ client, onEditClient, onDeleteClient, onInvoiceForm, onClientInvoices, t }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`p-3 flex items-center justify-between gap-3 group ${isDarkMode ? 'bg-slate-700' : 'bg-color-bg-tertiary border border-color-border-primary'} rounded-lg shadow-sm`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${isDarkMode ? 'bg-slate-700 text-color-text-primary' : 'bg-color-bg-tertiary text-color-text-primary'}`}>
                    {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-color-text-primary">{client.name}</p>
                    <p className="text-xs text-color-text-secondary">{client.contactEmail}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                    onClick={() => alert(t('link_project_alert', 'Fonctionnalité "Lier un projet" à ') + `${client.name}` + t('not_implemented', ' non implémentée.'))}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-sky-600 text-white' : 'hover:bg-sky-200 text-sky-600'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('link_project_tooltip', 'Lier un projet')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L9.54 5.46a5 5 0 0 0 .54 7.54Z"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L14.46 18.54a5 5 0 0 0-.54-7.54Z"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onClientInvoices(client)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-emerald-600 text-white' : 'hover:bg-emerald-200 text-emerald-600'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('view_invoices_tooltip', 'Voir les factures')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onInvoiceForm(client)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-yellow-600 text-white' : 'hover:bg-yellow-200 text-yellow-600'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('new_invoice_tooltip', 'Nouvelle facture')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onEditClient(client)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('edit', 'Modifier')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onDeleteClient(client.id)}
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

const ClientManagement = ({ onAddClient, onEditClient, onDeleteClient, onInvoiceForm, onClientInvoices, t }) => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        setClients(initialMockData.clients);
    }, []);

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        } title={t('my_clients', 'Mes Clients')} className="h-full">
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-color-text-primary">{t('total_clients', 'Clients Totaux')}</h3>
                    <span className="text-pink-400 text-3xl font-extrabold">{(clients || []).length}</span>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {clients.length > 0 ? (
                        clients.map(client => (
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
                        <p className="text-center p-8 text-sm text-color-text-secondary">{t('no_clients', 'Aucun client à afficher. Ajoutez-en un !')}</p>
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