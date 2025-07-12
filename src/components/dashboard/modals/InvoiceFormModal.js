// src/components/dashboard/modals/InvoiceFormModal.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ModalWrapper } from './ModalWrapper';
import { InvoicePreview } from './InvoicePreview';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const InvoiceFormModal = ({ authUser, initialDraft, onUpdateDraft, onAdd, onClose, t }) => {
    const [invoice, setInvoice] = useState(() => ({
        title: '',
        status: 'Draft',
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: '',
        clientInfo: { name: '', email: '', address: '', taxId: '' },
        lineItems: [{ id: Date.now(), description: '', quantity: 1, unitPrice: '0' }],
        currency: { code: 'EUR', symbol: '€' },
        vatRate: '20',
        depositRequested: '0',
        depositPaid: '0',
        notes: "Paiement à réception de la facture. Merci de votre confiance.",
        ...initialDraft
    }));
    
    const [companyInfo, setCompanyInfo] = useState(initialDraft?.companyInfo || {
        name: authUser?.displayName || "Votre Nom",
        address: "123 Rue de l'Exemple\n75001 Paris",
        email: authUser?.email || "contact@monentreprise.com",
        taxId: "FR123456789",
        logoUrl: authUser?.photoURL || null
    });
    
    const [invoiceLang, setInvoiceLang] = useState('fr');
    const [isPreviewing, setIsPreviewing] = useState(false);
    const isGuest = !authUser;

    const debouncedData = useDebounce({ invoice, companyInfo }, 1500);
    useEffect(() => {
        if (debouncedData && onUpdateDraft) onUpdateDraft(debouncedData);
    }, [debouncedData, onUpdateDraft]);

    useEffect(() => {
        const subtotal = invoice.lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0);
        const vatAmount = (subtotal * (parseFloat(invoice.vatRate) || 0)) / 100;
        const totalAmount = subtotal + vatAmount;
        const amountDue = totalAmount - (parseFloat(invoice.depositPaid) || 0);
        setInvoice(inv => ({ ...inv, subtotal, vatAmount, totalAmount, amountDue }));
    }, [invoice.lineItems, invoice.vatRate, invoice.depositPaid]);

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setCompanyInfo(prev => ({ ...prev, logoUrl: reader.result }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ ...invoice, companyInfo });
        if (onUpdateDraft) onUpdateDraft(null);
        onClose();
    };
    
    const handleChange = (e) => setInvoice(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCompanyInfoChange = (e) => setCompanyInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleClientChange = (e) => setInvoice(prev => ({ ...prev, clientInfo: { ...prev.clientInfo, [e.target.name]: e.target.value } }));
    const handleLineItemChange = (index, e) => {
        const lineItems = [...invoice.lineItems];
        lineItems[index][e.target.name] = e.target.value;
        setInvoice(prev => ({ ...prev, lineItems }));
    };
    const addLineItem = () => setInvoice(prev => ({...prev, lineItems: [...prev.lineItems, { id: Date.now(), description: '', quantity: 1, unitPrice: '0' }]}));
    const removeLineItem = (index) => {
        const lineItems = [...invoice.lineItems];
        lineItems.splice(index, 1);
        setInvoice(prev => ({ ...prev, lineItems }));
    };

    if (isPreviewing) {
        return (
            <ModalWrapper onClose={() => setIsPreviewing(false)} size="max-w-4xl">
                <InvoicePreview invoice={invoice} companyInfo={companyInfo} invoiceLang={invoiceLang} />
                <button onClick={() => setIsPreviewing(false)} className="main-button-secondary w-full mt-4">Retour à l'édition</button>
            </ModalWrapper>
        );
    }
    
    return (
        <ModalWrapper onClose={onClose} size="max-w-4xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Créer / Modifier une Facture</h2>
                <div className="flex items-center gap-4">
                    <select name="currency" value={invoice.currency.code} onChange={(e) => {
                        const C = {EUR: '€', USD: '$', JPY: '¥'}[e.target.value] || '€';
                        handleChange({ target: { name: 'currency', value: { code: e.target.value, symbol: C } } });
                    }} className="form-input w-32 bg-slate-700">
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="JPY">JPY (¥)</option>
                    </select>
                    <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => setInvoiceLang('fr')} className={`px-3 py-1 text-sm rounded-md ${invoiceLang === 'fr' ? 'bg-pink-600 text-white' : 'bg-slate-700'}`}>Français</button>
                        <button type="button" onClick={() => setInvoiceLang('en')} className={`px-3 py-1 text-sm rounded-md ${invoiceLang === 'en' ? 'bg-pink-600 text-white' : 'bg-slate-700'}`}>English</button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <fieldset className="border border-slate-700 p-4 rounded-lg space-y-2">
                        <legend>Vos Informations (Émetteur)</legend>
                        <input name="name" value={companyInfo.name} onChange={handleCompanyInfoChange} placeholder="Votre Nom / Société" className="form-input" />
                        <input name="taxId" value={companyInfo.taxId} onChange={handleCompanyInfoChange} placeholder="SIRET / N° de société" className="form-input" />
                        <textarea name="address" value={companyInfo.address} onChange={handleCompanyInfoChange} placeholder="Votre Adresse" className="form-input" rows="2"></textarea>
                        <input name="email" value={companyInfo.email} onChange={handleCompanyInfoChange} placeholder="Votre Email" className="form-input" />
                        <div>
                            <label className="text-xs text-slate-400">Logo</label>
                            <input type="file" onChange={handleLogoChange} accept="image/*" className="form-input file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200" />
                        </div>
                    </fieldset>
                    <fieldset className="border border-slate-700 p-4 rounded-lg space-y-2">
                        <legend>Informations Client (Récepteur)</legend>
                        <input name="name" value={invoice.clientInfo.name} onChange={handleClientChange} placeholder="Nom du client" className="form-input" required />
                        <input name="taxId" value={invoice.clientInfo.taxId} onChange={handleClientChange} placeholder="SIRET / N° de société client" className="form-input" />
                        <input name="email" value={invoice.clientInfo.email} onChange={handleClientChange} placeholder="Email du client" className="form-input" />
                        <textarea name="address" value={invoice.clientInfo.address} onChange={handleClientChange} placeholder="Adresse du client" className="form-input" rows="3"></textarea>
                    </fieldset>
                </div>
                 <fieldset className="border border-slate-700 p-4 rounded-lg">
                    <legend>Détails de la Facture</legend>
                    <input type="text" name="title" value={invoice.title || ''} onChange={handleChange} placeholder="Titre de la facture (ex: Création site web)" className="form-input mb-4" required />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" name="invoiceNumber" value={invoice.invoiceNumber} onChange={handleChange} placeholder="N° de Facture" className="form-input" />
                        <input type="date" name="issueDate" value={invoice.issueDate} onChange={handleChange} className="form-input" />
                        <input type="date" name="dueDate" value={invoice.dueDate} onChange={handleChange} className="form-input" />
                    </div>
                </fieldset>
                <fieldset className="border border-slate-700 p-4 rounded-lg">
                    <legend>Missions / Produits</legend>
                    {invoice.lineItems.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 mb-2">
                            <input type="text" name="description" value={item.description} onChange={e => handleLineItemChange(index, e)} placeholder="Description" className="form-input flex-grow" required />
                            <input type="number" name="quantity" value={item.quantity} onChange={e => handleLineItemChange(index, e)} placeholder="Qté" className="form-input w-20" required />
                            <input type="number" name="unitPrice" value={item.unitPrice} onChange={e => handleLineItemChange(index, e)} placeholder="P.U." className="form-input w-24" step="0.01" required />
                            <button type="button" onClick={() => removeLineItem(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full font-bold text-xl">&times;</button>
                        </div>
                    ))}
                    <button type="button" onClick={addLineItem} className="text-green-400 text-sm mt-2 font-semibold">+ Ajouter une ligne</button>
                </fieldset>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <textarea name="notes" value={invoice.notes} onChange={handleChange} placeholder="Notes, mentions légales..." className="form-input md:col-span-1" rows="4"></textarea>
                     <input type="number" name="depositRequested" value={invoice.depositRequested} onChange={handleChange} placeholder="Acompte demandé" className="form-input self-start" step="0.01" />
                     <input type="number" name="depositPaid" value={invoice.depositPaid} onChange={handleChange} placeholder="Acompte déjà perçu" className="form-input self-start" step="0.01" />
                </div>
                <fieldset className="border border-slate-700 p-4 rounded-lg">
                    <legend>Calcul</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-2 bg-slate-800 rounded"><label className="text-xs text-slate-400">Sous-total</label><p className="font-mono">{invoice.subtotal?.toFixed(2)} {invoice.currency.symbol}</p></div>
                        <div className="p-2 bg-slate-800 rounded flex items-center gap-2"><input type="number" name="vatRate" value={invoice.vatRate} onChange={handleChange} className="form-input p-0 bg-transparent border-none focus:ring-0 font-mono w-12" /><label className="text-xs text-slate-400">% TVA ({invoice.vatAmount?.toFixed(2)} {invoice.currency.symbol})</label></div>
                        <div className="p-2 bg-slate-800 rounded"><label className="text-xs text-slate-400">Total</label><p className="font-mono font-bold">{invoice.totalAmount?.toFixed(2)} {invoice.currency.symbol}</p></div>
                        <div className="p-2 rounded bg-pink-600/20 text-pink-300"><label className="text-xs">Solde Dû</label><p className="font-mono font-bold text-lg">{invoice.amountDue?.toFixed(2)} {invoice.currency.symbol}</p></div>
                    </div>
                </fieldset>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                     <button type="button" onClick={() => setIsPreviewing(true)} className="main-button-secondary w-full sm:w-auto">Aperçu</button>
                    <button type="submit" className="main-action-button w-full flex-grow">Enregistrer la Facture</button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default InvoiceFormModal;