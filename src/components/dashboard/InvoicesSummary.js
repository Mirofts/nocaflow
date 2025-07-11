// src/components/dashboard/InvoicesSummary.js
import React, { useMemo } from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

const InvoicesSummary = ({ invoices = [], openInvoiceForm, openInvoiceList, t, className = '' }) => {
    const { isDarkMode } = useTheme();

    const stats = useMemo(() => {
        const paidThisYear = invoices
            .filter(inv => inv.status === 'Paid' && new Date(inv.issueDate).getFullYear() === new Date().getFullYear())
            .reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);

        const pendingTotal = invoices
            .filter(inv => inv.status !== 'Paid')
            .reduce((sum, inv) => sum + (parseFloat(inv.amountDue) || 0), 0);

        const nextPendingInvoice = invoices
            .filter(inv => inv.status !== 'Paid' && new Date(inv.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

        return { paidThisYear, pendingTotal, nextPendingInvoice };
    }, [invoices]);

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        } title={t('invoices_summary_title', 'Résumé des Factures')} className={className}>
            <div className="flex flex-col h-full justify-between">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary text-sm">{t('invoices_paid_this_year', 'Payé cette année')}</p>
                        <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.paidThisYear.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary text-sm">{t('invoices_pending_total', 'En attente')}</p>
                        <span className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{stats.pendingTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary text-sm">{t('invoices_next_pending', 'Prochaine échéance')}</p>
                        <span className="text-color-text-primary font-bold">
                            {stats.nextPendingInvoice 
                                ? `${stats.nextPendingInvoice.amountDue.toFixed(2)} € (${format(parseISO(stats.nextPendingInvoice.dueDate), 'dd/MM')})` 
                                : t('no_upcoming_invoice', 'Aucune')}
                        </span>
                    </div>
                </div>
                <div className="mt-auto space-y-2 pt-4">
                    <motion.button onClick={openInvoiceForm} whileHover={{ scale: 1.02 }} className="w-full main-action-button">
                        {t('new_invoice_button', 'Nouvelle Facture')}
                    </motion.button>
                    <motion.button onClick={openInvoiceList} whileHover={{ scale: 1.02 }} className="w-full main-button-secondary">
                        {t('view_all_invoices_button', 'Voir toutes les factures')}
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default InvoicesSummary;