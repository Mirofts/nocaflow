// src/components/dashboard/modals/InvoiceListModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const InvoiceListModal = ({ invoices = [], onEdit, onDelete, onClose, t }) => {
    
    return (
        <ModalWrapper onClose={onClose} size="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Toutes les factures</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar p-2">
                {Array.isArray(invoices) && invoices.length > 0 ? (
                    invoices.map(invoice => (
                        <div key={invoice.id} className="futuristic-card flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg gap-4">
                            <div className="flex-grow">
                                <p className="font-bold text-white">{invoice.invoiceNumber} - {invoice.clientInfo?.name}</p>
                                <p className="text-sm text-slate-400">
                                    Émise le: {invoice.issueDate} | Échéance: {invoice.dueDate}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="text-right">
                                    <p className="font-bold text-white">{(parseFloat(invoice.totalAmount) || 0).toFixed(2)} €</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 
                                        invoice.status === 'Draft' ? 'bg-slate-500/20 text-slate-400' :
                                        'bg-amber-500/20 text-amber-400'}`}>
                                        {invoice.status}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {/* Le bouton Edit appelle la fonction onEdit passée en prop */}
                                    <button onClick={() => onEdit(invoice)} title="Modifier" className="p-2 hover:bg-slate-700 rounded-full text-blue-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>
                                    </button>
                                    {/* Le bouton Delete appelle la fonction onDelete passée en prop */}
                                    <button onClick={() => onDelete(invoice.id)} title="Supprimer" className="p-2 hover:bg-slate-700 rounded-full text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center p-8 text-sm text-slate-500">Aucune facture à afficher.</p>
                )}
            </div>
            <div className="mt-6 text-center">
                <motion.button onClick={onClose} whileHover={{ scale: 1.02 }} className="main-button-secondary w-full">Fermer</motion.button>
            </div>
        </ModalWrapper>
    );
};

export default InvoiceListModal;