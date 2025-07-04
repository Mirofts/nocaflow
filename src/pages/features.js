// src/pages/features.js
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion } from 'framer-motion';
import { LayoutDashboard, MessageSquare, Briefcase, FileText, CalendarDays, ClipboardCheck, Lightbulb, TrendingUp, Users, DollarSign, Cloud } from 'lucide-react'; // Ensure all used icons are imported

// Reusing variants from index.js for consistency
const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 10 },
  },
};

export default function FeaturesPage() {
  const { t } = useTranslation('common');

  // Reusing the feature data structure from index.js
  const features = [
    { icon: <LayoutDashboard size={40} className="text-violet-400" />, title: 'Dashboard Intuitif', description: 'Une vue d\'ensemble claire pour une gestion sans effort de toutes vos activités.' },
    { icon: <ClipboardCheck size={40} className="text-pink-400" />, title: 'Listes de Tâches Intelligentes', description: 'Organisez, priorisez et suivez vos tâches avec une efficacité inégalée.' },
    { icon: <MessageSquare size={40} className="text-blue-400" />, title: 'Messagerie Collaboratif (Flow Live Messages)', description: 'Communiquez en temps réel, transformez les discussions en actions en un clic.' },
    { icon: <Briefcase size={40} className="text-green-400" />, title: 'Gestion de Projets Avancée', description: 'De la planification Gantt aux échéances, maîtrisez chaque phase de vos projets.' },
    { icon: <FileText size={40} className="text-orange-400" />, title: 'Facturation et Suivi Client', description: 'Créez des factures professionnelles et suivez les paiements directement depuis l\'app.' },
    { icon: <CalendarDays size={40} className="text-yellow-400" />, title: 'Calendrier Synchronisé', description: 'Planifiez meetings, événements et deadlines avec une intégration parfaite.' },
    { icon: <Users size={40} className="text-cyan-400" />, title: 'Management d\'Équipe Centralisé', description: 'Gérez vos collaborateurs, attribuez des rôles et optimisez la collaboration.' },
    { icon: <Lightbulb size={40} className="text-purple-400" />, title: 'Bloc-notes Intelligent', description: 'Capturez vos idées, rédigez des notes structurées avec support Markdown.' },
    { icon: <Cloud size={40} className="text-emerald-400" />, title: 'Intégration Cloud (Google Drive)', description: 'Liez vos documents importants directement à vos projets pour un accès rapide.' },
  ];

  return (
    <>
      <Head>
        {/* Hardcoding title and meta description for consistency with other pages,
            as per previous request to remove t() fallbacks for now. */}
        <title>Fonctionnalités - NocaFLOW</title>
        <meta
          name="description"
          content="Découvrez les puissantes fonctionnalités de NocaFLOW qui simplifient la gestion client et boostent votre productivité."
        />
      </Head>

      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 to-black text-white"> {/* Using section for better semantic HTML */}
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animated-gradient-text pink-violet-gradient-text"
          >
            {/* Hardcoded title */}
            Toutes les Fonctionnalités de NocaFLOW
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto"
          >
            {/* Hardcoded subtitle */}
            NocaFLOW centralise chaque aspect de votre collaboration client pour une productivité décuplée et un <strong className="text-white">Flow ininterrompu</strong>.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={CARD_VARIANTS} className="glass-card p-8 rounded-xl shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300 ease-out border border-gray-700">
                {feature.icon}
                <h3 className="text-2xl font-semibold mt-4 mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-300 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])), // Only 'common' is needed if all strings are hardcoded or moved there
    },
  };
}