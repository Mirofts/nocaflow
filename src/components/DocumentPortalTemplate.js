// components/DocumentPortalTemplate.js
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

const Stat = ({ value, label, icon }) => (
  <div className="text-center flex flex-col items-center gap-2">
    <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center">{icon}</div>
    <div><p className="text-xl font-bold text-white">{value}</p><p className="text-xs text-slate-400">{label}</p></div>
  </div>
);

const FeaturedPortalBadge = ({t}) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-bold text-pink-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        {t('badge_featured_portal')}
    </div>
);

export default function DocumentPortalTemplate({ portalData, t }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const handleCopyLink = () => { navigator.clipboard.writeText(window.location.href); setShowCopyTooltip(true); setTimeout(() => setShowCopyTooltip(false), 2000); };
  const handleShare = () => { if (navigator.share) { navigator.share({ title: `${portalData.documentTitle} by ${portalData.author.name}`, url: window.location.href, }); } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 20, mass: 0.5 } } };
  const formatSeconds = (seconds) => { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${minutes}m ${remainingSeconds}s`; }
  return (
    <div className="p-4 sm:p-8 text-white font-sans">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <motion.div initial="hidden" animate="visible" variants={itemVariants} className="flex items-center gap-6 text-left">
            <Image src={portalData.author.avatarUrl} alt={portalData.author.name} width={80} height={80} className="rounded-full border-4 border-slate-700 shadow-lg"/>
            <div><h1 className="text-3xl font-bold tracking-tight">{portalData.documentTitle}</h1><p className="text-md text-slate-400">par {portalData.author.name}</p></div>
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={{...itemVariants, transition: {delay: 0.2}}} className="flex items-center gap-4">
          {portalData.isFeatured && <FeaturedPortalBadge t={t} />}
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="action-icon-button group relative" aria-label={t('copy_link')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {showCopyTooltip && <motion.span initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 5}} className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">{t('copied')}</motion.span>}
            </button>
            <button onClick={handleShare} className="action-icon-button" aria-label={t('share_page')}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg></button>
          </div>
        </motion.div>
      </header>
      <motion.div initial="hidden" animate="visible" variants={{visible: {...itemVariants.visible, transition: {delay: 0.5}}}} className="bio-card p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4 tracking-tight text-white/90">{t('project_summary_title', 'Résumé du Projet')}</h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{portalData.summary}</p>
        <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-3 gap-4">
            <Stat value={portalData.viewCount} label={t('views_stat', 'Vues totales')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>} />
            <Stat value={formatSeconds(portalData.avgEngagementSeconds)} label={t('engagement_stat', 'Temps moyen')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>} />
            <Stat value={portalData.leadsCaptured} label={t('leads_stat', 'Leads capturés')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M19 12h-2c0-1.2-.7-2.1-1.7-2.7L9 6"/><path d="m2 14 4 4"/><path d="m7 22 4-4"/><path d="m10 18 3 3"/><path d="m13 15 4 4"/><path d="M22 21a2 2 0 0 0 0-4H10a2 2 0 0 0 0 4Z"/></svg>} />
        </div>
      </motion.div>
      <div className="space-y-12">
        <div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">{t('tasks_and_timeline_title', 'Tâches & Avancement')}</h2>
          <div className="space-y-2">
            {portalData.project.tasks.map(task => (<div key={task.id} className="review-card !p-4 flex justify-between items-center"><p className="font-medium text-slate-200">{task.title}</p><span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${task.status === 'complété' ? 'bg-green-500/10 text-green-300' : task.status === 'en cours' ? 'bg-blue-500/10 text-blue-300' : 'bg-slate-700/50 text-slate-400'}`}>{task.status === 'complété' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}{task.status === 'en cours' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}{task.status}</span></div>))}
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">{t('invoices_title', 'Factures & Paiement')}</h2>
          <div className="space-y-2">
            {portalData.invoices.map(invoice => (<div key={invoice.id} className="review-card !p-4 flex justify-between items-center"><div><p className="font-bold text-white">{invoice.id} - {invoice.amount}</p><p className="text-xs text-slate-400">{invoice.date}</p></div><span className={`px-3 py-1 text-xs font-bold rounded-full ${invoice.status === 'Payée' ? 'bg-green-500/10 text-green-300' : 'bg-orange-500/10 text-orange-300'}`}>{invoice.status}</span></div>))}
          </div>
        </div>
        <div>
            <h2 className="text-3xl font-bold mb-6 tracking-tight">{t('files_title', 'Fichiers & Livrables')}</h2>
            <div className="space-y-2">
              {portalData.files.map(file => (<a href={file.url} key={file.id} className="review-card !p-4 flex justify-between items-center hover:border-pink-500/50 transition-colors"><div className="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg><p className="font-medium text-slate-200">{file.name}</p></div><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></a>))}
            </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">{t('messages_title', 'Espace de discussion')}</h2>
          <div className="space-y-6">
            {portalData.messages.map((message, i) => (<motion.div key={i} className="flex items-start gap-4" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}><div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-pink-400">{message.avatarUrl ? <Image src={message.avatarUrl} alt={message.author} width={48} height={48} className="rounded-full" /> : message.avatarChar}</div><div className="flex-grow review-card !p-4 !rounded-xl"><div className="flex justify-between items-center"><h4 className="font-bold text-white">{message.author}</h4><p className="text-xs text-slate-500">{message.timestamp}</p></div><p className="text-slate-300 mt-2">{message.text}</p></div></motion.div>))}
            <div className="relative mt-4"><input type="text" placeholder="Écrire un message..." className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-12 py-3 focus:ring-pink-500 focus:border-pink-500 transition" /><button className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg></button></div>
          </div>
        </div>
      </div>
    </div>
  );
}