// pages/pricing.js
import Head from 'next/head';
import { Check, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // ✅ CORRECT



export default function PricingPage({ onLoginClick, onRegisterClick }) {
  const { user, isGuestMode } = useContext(AuthContext) || {};
  const { t } = useTranslation('common');
  const router = useRouter();


  const tiers = [
    {
      name: 'tier_solo_name',
      price: t('tier_solo_price'),
      featuresKey: 'tier_solo_features',
      style: 'tier-silver'
    },
    {
      name: 'tier_team_name',
      price: t('tier_team_price'),
      featuresKey: 'tier_team_features',
      style: 'tier-gold',
      featured: true
    },
    {
      name: 'tier_business_name',
      price: t('tier_business_price'),
      featuresKey: 'tier_business_features',
      style: 'tier-platinum'
    }
  ];

  const handleStart = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      router.push('/register?role=creator');
    }
  }

  return (
    <>
      <Head><title>{t('pricing')} - NocaFLOW</title></Head>
      <div className="min-h-screen text-white pt-40 pb-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tighter animated-gradient-text pink-gradient-text">{t('pricing_title')}</h1>
            <p className="text-xl text-slate-400 mt-4 max-w-2xl mx-auto">{t('pricing_subtitle')}</p>
        </motion.div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-8 rounded-2xl border-2 flex flex-col h-full relative transition-all duration-300 ${tier.style}`}
            >
              {tier.featured && <div className="absolute -top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg -rotate-12">{t('popular')}</div>}
              <h2 className="text-2xl font-bold text-center mt-4">{t(tier.name)}</h2>
              <p className="text-5xl font-bold my-6 text-center">{tier.price}<span className="text-lg font-medium text-slate-400">{t('per_month')}</span></p>
              <ul className="space-y-4 mt-2 mb-8 flex-grow">{t(tier.featuresKey, '').split('\n').map((feature, index) => ( <li key={index} className="flex items-start gap-3"><Check className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" /><span>{feature}</span></li> ))}</ul>
              <motion.button onClick={handleStart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full mt-auto px-8 py-3 font-bold rounded-lg cursor-pointer pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white">{t('start')}</motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-7xl mx-auto mt-8">
            <div className="p-8 rounded-2xl border-2 flex flex-col md:flex-row items-center gap-8 h-full relative transition-all duration-300 tier-platinum">
                 <div className="flex-shrink-0 text-purple-400"><Building size={48} /></div>
                 <div className="flex-grow text-center md:text-left">
                     <h2 className="text-2xl font-bold">{t('tier_enterprise_name')}</h2>
                     <p className="text-slate-300 mt-1">{t('tier_enterprise_features')}</p>
                 </div>
                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full md:w-auto mt-4 md:mt-0 flex-shrink-0 px-8 py-3 font-bold rounded-lg cursor-pointer bg-white text-black">{t('contact_us')}</motion.button>
            </div>
        </motion.div>

      </div>
    </>
  );
}
