// pages/features.js
import Head from 'next/head';
import { LayoutKanban, MessagesSquare, FolderKanban, CreditCard, Clock, Palette, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Imports for i18n
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Le composant FeaturesPage reçoit `onLoginClick` et `onRegisterClick` via les props de _app.js
export default function FeaturesPage({ onLoginClick, onRegisterClick }) {
  const { user, isGuestMode } = useContext(AuthContext) || {};
  const { t } = useTranslation('common');

  const FADE_UP_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 20, mass: 0.5 } },
  };

  const features = [
    { icon: FolderKanban, key: 'portals' },
    { icon: LayoutKanban, key: 'projects' }, 
    { icon: MessagesSquare, key: 'messaging' },
    { icon: CreditCard, key: 'billing' },
    { icon: Clock, key: 'time' },
    { icon: Palette, key: 'branding' },
    { icon: Zap, key: 'integrations' },
    { icon: ShieldCheck, key: 'security' },
  ];

  return (
    <>
      <Head><title>{t('features', 'Fonctionnalités')} - NocaFLOW</title></Head>
      <div className="min-h-screen text-white pt-40 pb-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tighter animated-gradient-text pink-gradient-text">{t('features_title')}</h1>
            <p className="text-xl text-slate-400 mt-4 max-w-2xl mx-auto">{t('features_subtitle')}</p>
        </motion.div>
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.key} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className={`p-6 rounded-2xl flex items-start gap-5 border hover:border-pink-500/50 cursor-pointer transition-all ${ i % 3 === 0 ? 'bg-slate-800/20 border-slate-700' : i % 3 === 1 ? 'bg-pink-900/10 border-pink-900/50' : 'bg-purple-900/10 border-purple-900/50' }`}>
              <div className="text-pink-400 mt-1 flex-shrink-0"><feature.icon size={28} /></div>
              <div>
                <h3 className="text-xl font-bold text-white">{t(`feature_${feature.key}_name`)}</h3>
                <p className="text-slate-300 mt-2 leading-relaxed">{t(`feature_${feature.key}_desc`)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="text-center mt-12">
          <button
            onClick={onRegisterClick}
            className="bg-pink-500 text-white px-6 py-3 rounded hover:bg-pink-600 transition">
            {t('create_account', 'Créer un compte')}
          </button>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}