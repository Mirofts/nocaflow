// src/components/dashboard/modals/InvoiceListModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { ModalWrapper } from './ModalWrapper';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoicePreview } from './InvoicePreview';

const InvoiceListModal = ({ invoices = [], onEdit, onDelete, onUpdateStatus, onClose, t }) => {

    const handleDownloadPDF = (invoice) => {
        const invoiceElement = document.createElement('div');
        invoiceElement.style.position = 'absolute';
        invoiceElement.style.left = '-9999px';
        invoiceElement.style.width = '210mm';
        document.body.appendChild(invoiceElement);

        const { createRoot } = require('react-dom/client');
        const root = createRoot(invoiceElement);
        root.render(<InvoicePreview invoice={invoice} companyInfo={invoice.companyInfo} invoiceLang={invoice.invoiceLang || 'fr'} />);

        setTimeout(() => {
            html2canvas(invoiceElement, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`facture-${invoice.invoiceNumber}.pdf`);
                document.body.removeChild(invoiceElement);
            });
        }, 500);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Draft':
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-5xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Toutes les factures</h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                {Array.isArray(invoices) && invoices.length > 0 ? (
                    invoices.map(invoice => (
                        <div key={invoice.id} className="futuristic-card flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg gap-4">
                            <div className="flex-grow">
                                <p className="font-bold text-white">{invoice.title || 'Facture sans titre'}</p>
                                <p className="text-sm text-slate-400">{invoice.invoiceNumber} - {invoice.clientInfo?.name}</p>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="text-right">
                                    <p className="font-bold text-white">{(parseFloat(invoice.totalAmount) || 0).toFixed(2)} {invoice.currency?.symbol || '€'}</p>
                                    <select 
                                        value={invoice.status} 
                                        onChange={(e) => onUpdateStatus(invoice.id, e.target.value)}
                                        className={`text-xs p-1 rounded border focus:ring-0 focus:outline-none ${getStatusColor(invoice.status)}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="Draft">Brouillon</option>
                                        <option value="Pending">En attente</option>
                                        <option value="Paid">Payée</option>
                                    </select>
                                </div>
                                <div className="flex items-center bg-slate-800 rounded-full p-1">
                                    <button onClick={() => onEdit(invoice)} title="Modifier" className="p-2 hover:bg-slate-700 rounded-full text-blue-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg>
                                    </button>
                                    <button onClick={() => handleDownloadPDF(invoice)} title="Télécharger en PDF" className="p-2 hover:bg-slate-700 rounded-full text-green-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>
                                    </button>
                                    <button onClick={() => alert("Fonctionnalité d'envoi par email à venir.")} title="Envoyer par email" className="p-2 hover:bg-slate-700 rounded-full text-purple-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/></svg>
                                    </button>
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