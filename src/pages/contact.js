// pages/contact.js
import Head from 'next/head';
import { Mail, MapPin } from 'lucide-react';
import { motion } from "framer-motion";

import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


export default function ContactPage() {
  const { t } = useTranslation('common');
  const pageTitle = t('contact_us', 'Nous Contacter');

  return (
    <>
      <Head>
        <title>{pageTitle} - NocaFLOW</title>
      </Head>
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)] bg-color-bg-primary text-color-text-primary">
        <div className="text-center p-8 glass-card rounded-2xl shadow-lg"> {/* Appliquer glass-card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-5xl font-bold tracking-tighter animated-gradient-text pink-violet-gradient-text mb-4">{pageTitle}</h1>
              <p className="text-xl text-color-text-secondary mt-4 max-w-2xl mx-auto">
                {t('contact_page_desc', 'Une question, une suggestion ou un problème ? N\'hésitez pas à nous contacter.')}
              </p>

              <div className="mt-12 space-y-6 text-lg">
                <div className="flex items-center justify-center gap-3">
                    <Mail className="text-pink-400"/>
                    <a href="mailto:contact@nocaflow.com" className="text-color-text-primary hover:text-pink-400 transition-colors">contact@nocaflow.com</a>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <MapPin className="text-violet-400"/>
                    <span className="text-color-text-secondary">{t('contact_location', 'Basé à Paris, France')}</span>
                </div>
              </div>
            </motion.div>
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