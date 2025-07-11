// src/components/dashboard/modals/InvoicePreview.js
import React from 'react';

// Dictionnaire pour les traductions
const labels = {
    fr: {
        invoice: 'FACTURE',
        billedTo: 'Facturé à :',
        invoiceNum: 'N°',
        issueDate: 'Date',
        dueDate: 'Échéance',
        description: 'Description',
        qty: 'Qté',
        unitPrice: 'Prix Unitaire',
        total: 'Total',
        subtotal: 'Sous-total',
        vat: 'TVA',
        deposit: 'Acompte Versé',
        amountDue: 'Solde Dû',
        notes: 'Notes'
    },
    en: {
        invoice: 'INVOICE',
        billedTo: 'Billed to:',
        invoiceNum: 'No.',
        issueDate: 'Date',
        dueDate: 'Due Date',
        description: 'Description',
        qty: 'Qty',
        unitPrice: 'Unit Price',
        total: 'Total',
        subtotal: 'Subtotal',
        vat: 'VAT',
        deposit: 'Deposit Paid',
        amountDue: 'Amount Due',
        notes: 'Notes'
    }
};

export const InvoicePreview = ({ invoice, companyInfo, invoiceLang = 'fr' }) => {
    const l = labels[invoiceLang]; // Sélectionne le bon dictionnaire de langue
    const asNumber = (value) => parseFloat(value) || 0;

    return (
        <div className="bg-white text-black p-8 rounded-lg max-w-4xl mx-auto font-sans text-sm">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{companyInfo.name}</h1>
                    <p className="whitespace-pre-wrap">{companyInfo.address}</p>
                    <p>{companyInfo.email}</p>
                    {/* NOUVEAU : Affichage du SIRET/Tax ID */}
                    {companyInfo.taxId && <p className="mt-1"><strong>SIRET/TIN:</strong> {companyInfo.taxId}</p>}
                </div>
                {/* NOUVEAU : Le logo s'affiche correctement */}
                {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="logo" className="w-32 h-auto max-h-24 object-contain"/>}
            </div>

            <div className="flex justify-between mb-8">
                <div>
                    <h2 className="font-bold mb-1">{l.billedTo}</h2>
                    <p>{invoice.clientInfo.name}</p>
                    <p className="whitespace-pre-wrap">{invoice.clientInfo.address}</p>
                    <p>{invoice.clientInfo.email}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold">{l.invoice}</h2>
                    <p><strong>{l.invoiceNum}:</strong> {invoice.invoiceNumber}</p>
                    <p><strong>{l.issueDate}:</strong> {invoice.issueDate}</p>
                    <p><strong>{l.dueDate}:</strong> {invoice.dueDate}</p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead className="bg-gray-200 text-left">
                    <tr>
                        <th className="p-2">{l.description}</th>
                        <th className="p-2 w-20 text-center">{l.qty}</th>
                        <th className="p-2 w-28 text-right">{l.unitPrice}</th>
                        <th className="p-2 w-28 text-right">{l.total}</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.lineItems.map(item => (
                        <tr key={item.id} className="border-b">
                            <td className="p-2">{item.description}</td>
                            <td className="p-2 text-center">{asNumber(item.quantity)}</td>
                            <td className="p-2 text-right">{asNumber(item.unitPrice).toFixed(2)} €</td>
                            <td className="p-2 text-right font-bold">{(asNumber(item.quantity) * asNumber(item.unitPrice)).toFixed(2)} €</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between"><p>{l.subtotal} :</p> <p>{asNumber(invoice.subtotal).toFixed(2)} €</p></div>
                    <div className="flex justify-between"><p>{l.vat} ({asNumber(invoice.vatRate)}%) :</p> <p>{asNumber(invoice.vatAmount).toFixed(2)} €</p></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><p>{l.total} :</p> <p>{asNumber(invoice.totalAmount).toFixed(2)} €</p></div>
                    <div className="flex justify-between text-gray-700"><p>{l.deposit} :</p> <p>-{asNumber(invoice.depositPaid).toFixed(2)} €</p></div>
                    <div className="flex justify-between font-bold text-lg bg-gray-200 p-2 rounded"><p>{l.amountDue} :</p> <p>{asNumber(invoice.amountDue).toFixed(2)} €</p></div>
                </div>
            </div>
            
            <div className="mt-8">
                <h3 className="font-bold">{l.notes} :</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
        </div>
    );
};