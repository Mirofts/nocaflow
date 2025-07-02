// src/components/dashboard/modals/InvoiceFormModal.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';

const InvoiceFormModal = ({ isGuest, client = null, onAdd, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [invoiceClient, setInvoiceClient] = useState(client ? client.name : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isGuest) {
            alert(t('guest_feature_disabled_invoice', "L'ajout de factures est désactivé en mode invité. Veuillez vous inscrire !"));
            return;
        }
        if (!title.trim() || !amount.trim()) return;

        onAdd({
            id: `inv-${Date.now()}`,
            title: title.trim(),
            client: invoiceClient.trim(),
            amount: `${parseFloat(amount).toFixed(2)} €`,
            date: format(new Date(), 'dd/MM/yyyy'),
            status: 'Pending'
        });
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {/* DollarSign Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {t('create_invoice_title', 'Créer une nouvelle facture')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('invoice_title_placeholder', 'Titre de la facture...')} className="form-input" required />
                <input type="text" value={invoiceClient} onChange={e => setInvoiceClient(e.target.value)} placeholder={t('invoice_client_placeholder', 'Nom du client...')} className="form-input" required />
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t('invoice_amount_placeholder', 'Montant (€)...')} className="form-input" step="0.01" required />
                {isGuest && <p className="text-xs text-amber-400 text-center flex items-center gap-2">
                    {/* Info Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    {t('guest_feature_restricted', 'Fonctionnalité réservée aux membres inscrits.')}</p>}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isGuest ? 'bg-slate-600 cursor-not-allowed' : 'pulse-button bg-gradient-to-r from-green-500 to-teal-500'} main-action-button`}
                >
                    {t('create_invoice_button', 'Créer la facture')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

export default InvoiceFormModal;