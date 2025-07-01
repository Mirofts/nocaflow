// components/dashboard/InvoicesSummary.js
import React, { useState, useEffect, useCallback } from 'react'; // Re-verified: useCallback explicitly imported
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import { format, parseISO, isPast, isSameYear } from 'date-fns';
import { initialMockData } from '../../lib/mockData';
import { useTheme } from '../../context/ThemeContext';

// Déplacé parseDate en dehors du composant pour qu'il soit accessible
const parseDate = (dateString) => {
    // Check if dateString is already an ISO string (from Firebase)
    if (dateString.includes('T') && dateString.includes('Z')) {
        return parseISO(dateString);
    }
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // Month est 0-indexé
};

const InvoiceItem = ({ invoice, t }) => {
    const { isDarkMode } = useTheme();
    return (
        <div className={`p-3 flex items-center justify-between gap-3 ${isDarkMode ? 'bg-slate-700' : 'bg-color-bg-tertiary border border-color-border-primary'} rounded-lg shadow-sm`}>
            <div>
                <p className="font-bold text-color-text-primary text-sm">{invoice.title}</p>
                <p className="text-xs text-color-text-secondary">{invoice.client} - {invoice.date}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-color-text-primary">{invoice.amount}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${invoice.status === 'Paid'
                    ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                    : (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>
                    {invoice.status === 'Pending' ? t('invoice_pending', 'En attente') : t('invoice_paid', 'Payé')}
                </span>
            </div>
        </div>
    );
};

const InvoicesSummary = ({ openInvoiceForm, openInvoiceList, t, className = '' }) => {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({
        paidThisYear: 0,
        pendingTotal: 0,
        nextPendingInvoice: null,
    });
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const allInvoices = initialMockData.invoices;

        const paidThisYear = allInvoices
            .filter(inv => inv.status === 'Paid' && isSameYear(parseDate(inv.date), new Date()))
            .reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9,-]+/g, "").replace(',', '.')), 0);

        const pendingInvoices = allInvoices
            .filter(inv => inv.status === 'Pending');

        const pendingTotal = pendingInvoices
            .reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9,-]+/g, "").replace(',', '.')), 0);

        const now = new Date();
        const nextPendingInvoice = pendingInvoices
            .filter(inv => parseDate(inv.date).getTime() >= now.getTime())
            .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())[0];

        setInvoices(allInvoices);
        setStats({
            paidThisYear: paidThisYear,
            pendingTotal: pendingTotal,
            nextPendingInvoice: nextPendingInvoice,
        });
    }, []);


    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        } title={t('invoices_summary_title', 'Résumé des Factures')} className={className}>
            <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col mb-4 space-y-2 flex-grow">
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary text-sm">{t('invoices_paid_this_year', 'Factures payées cette année')} :</p>
                        <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-violet-700'}`}>{stats.paidThisYear.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary text-sm">{t('invoices_pending_total', 'Factures en attente de paiement')} :</p>
                        <span className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-blue-700'}`}>{stats.pendingTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-color-text-secondary text-sm">{t('invoices_next_pending', 'Prochaine facture en attente')} :</p>
                        <span className="text-color-text-primary font-bold">
                            {stats.nextPendingInvoice ? `${stats.nextPendingInvoice.amount} (${format(parseDate(stats.nextPendingInvoice.date), 'dd/MM')})` : t('no_upcoming_invoice', 'Aucune')}
                        </span>
                    </div>
                </div>
                <div className="mt-auto space-y-2 flex-shrink-0">
                    <motion.button
                        onClick={openInvoiceForm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 shadow-lg main-action-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        {t('new_invoice_button', 'Nouvelle Facture')}
                    </motion.button>
                    <motion.button
                        onClick={openInvoiceList}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 main-button-secondary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                        {t('view_all_invoices_button', 'Voir toutes les factures')}
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default InvoicesSummary;