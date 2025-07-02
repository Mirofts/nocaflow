// src/components/dashboard/modals/InvoiceListModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';

const InvoiceListModal = ({ invoices = [], onClose, t }) => {
    return (
        <ModalWrapper onClose={onClose} size="max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {/* FileText Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                {t('all_invoices_title', 'Toutes les factures')}
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar p-2">
                {Array.isArray(invoices) && invoices.length > 0 ? (
                    invoices.map(invoice => (
                        <div key={invoice.id} className="futuristic-card flex items-center justify-between p-3 rounded-lg">
                            <div>
                                <p className="font-bold text-white">{invoice.title}</p>
                                <p className="text-sm text-slate-400">{invoice.client} - {invoice.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white">{invoice.amount}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center p-8 text-sm text-slate-500">{t('no_invoices_to_display', 'Aucune facture à afficher.')}</p>
                )}
            </div>
            <div className="mt-6 text-center">
                <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="main-button-secondary w-full"
                >
                    {t('close', 'Fermer')}
                </motion.button>
            </div>
        </ModalWrapper>
    );
};

export default InvoiceListModal;