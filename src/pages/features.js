// pages/features.js
import Head from 'next/head';
import {
  LayoutKanban,
  MessagesSquare,
  FolderKanban,
  CreditCard,
  Clock,
  Palette,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// i18n imports
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function FeaturesPage({ onLoginClick, onRegisterClick }) {
  const { user, isGuestMode } = useContext(AuthContext) || {};
  const { t } = useTranslation('common');

  const FADE_UP_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 50, damping: 20, mass: 0.5 },
    },
  };

  const features = [
    { icon: FolderKanban, key: 'portals' },
    { icon: LayoutKanban, key: 'projects' },
    { icon: MessagesSquare, key: 'chat' },
    { icon: CreditCard, key: 'payments' },
    { icon: Clock, key: 'productivity' },
    { icon: Palette, key: 'design' },
    { icon: ShieldCheck, key: 'security' },
    { icon: Zap, key: 'performance' },
  ];

  return (
    <>
      <Head>
        <title>{t('features.title')}</title>
      </Head>
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-8">{t('features.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-lg border bg-white shadow"
              initial="hidden"
              animate="visible"
              variants={FADE_UP_VARIANTS}
            >
              <feature.icon className="h-6 w-6 mb-4 text-gray-700" />
              <p className="text-lg font-semibold">
                {t(`features.${feature.key}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </>
  );
}

// Ajoute les traductions pour la page
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
