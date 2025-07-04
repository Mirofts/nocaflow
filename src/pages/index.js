// src/pages/index.js
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ArrowRight, Eye, LayoutDashboard, MessageSquare, Briefcase, FileText, CalendarDays, ClipboardCheck, Lightbulb, TrendingUp, Users, DollarSign, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

// Re-using and slightly adjusting existing variants
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 50, damping: 20, mass: 0.5 },
  },
};

// New variant for staggered children, slightly faster for lists
const STAGGER_CHILD_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

// Variant for features cards
const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 10 },
  },
};

export default function HomePage({ onLoginClick, onRegisterClick }) {
  const { t } = useTranslation('common');
  const { currentUser, loadingAuth, loginAsGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Exécuter la redirection uniquement côté client et après l'authentification
    // Cela évite un désalignement d'hydratation en SSR
    if (!loadingAuth && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, loadingAuth, router]);

  // Affiche un loader si l'authentification est en cours ou si l'utilisateur est déjà connecté (avant redirection)
  if (loadingAuth || currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-color-bg-primary">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-pink-500"></div>
      </div>
    );
  }

  // Handle guest login redirection
  const handleGuestLogin = () => {
    loginAsGuest(); // Potentially sets up guest user
    router.push('/dashboard'); // Redirect to dashboard immediately after initiating guest login
  };

  return (
    <>
      <Head>
        <title>{t('home_page_title', "NocaFLOW - Votre Système d'Exploitation Client Tout-en-Un")}</title>
        <meta
          name="description"
          content={t(
            'home_page_meta_description',
            "NocaFLOW est l'OS client tout-en-un pour les professionnels modernes. Arrêtez d'envoyer des PDFs, commencez à conclure des affaires."
          )}
        />
      </Head>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        // FIX: Removed `px-4` and used `w-screen` to ensure true fullscreen background
        className="relative min-h-screen w-screen flex flex-col items-center justify-center text-center pt-32 pb-20 overflow-hidden bg-purple-900"
      >
        {/* Fullscreen Video Background */}
        {/* FIX: Ensure video div also takes full width and height */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/realbg.mp4" type="video/mp4" />
            <source src="/realbg.webm" type="video/webm" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
          {/* Overlay for darker effect */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        {/* Content over the video, still constrained by max-w and centered */}
        <div className="relative z-10 flex flex-col items-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added back px for content padding */}
          <motion.div variants={FADE_UP_VARIANTS} className="text-center">
            {/* New Headline Structure */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-600 mb-2">
              La fin du chaos.
            </h1>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter animated-gradient-text light-gradient-text">
              Le début du FLOW.
            </h1>
          </motion.div>

          <motion.p
            variants={FADE_UP_VARIANTS}
            className="mt-6 text-xl md:text-2xl text-slate-300 max-w-4xl leading-relaxed"
          >
            {/* New Sub-headline with bold, white text */}
            Découvrez NocaFLOW, la solution tout-en-un où <strong className="text-white">l'innovation rencontre la fluidité</strong>. Unifiez <strong className="text-white">projets</strong>, <strong className="text-white">tchats</strong>, <strong className="text-white">fichiers</strong>, <strong className="text-white">factures</strong>, <strong className="text-white">calendrier</strong>, <strong className="text-white">notes</strong>, <strong className="text-white">meetings</strong>, et <strong className="text-white">listes de tâches</strong> dans un seul espace de travail conçu pour un <strong className="text-white">Flow ininterrompu</strong>. Accélérez votre productivité et transformez la complexité en simplicité.
          </motion.p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRegisterClick}
              className="pulse-button inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 shadow-lg"
            >
              {t('start', 'Commencer')} <ArrowRight size={20} />
            </button>

            <button
              onClick={handleGuestLogin} // Updated to directly call handleGuestLogin
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-slate-300 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors shadow-md"
            >
              <Eye size={20} /> {t('try_as_guest', 'Essayer en mode invité')}
            </button>
          </div>

          <motion.div variants={FADE_UP_VARIANTS} className="mt-8 text-slate-600 text-sm">
            <p>{t('no_credit_card', 'Pas de carte de crédit requise. Annulez à tout temps.')}</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Re-introduced Features Overview Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animated-gradient-text pink-violet-gradient-text"
          >
            {t('features_overview', 'Aperçu des Fonctionnalités')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto"
          >
            NocaFLOW n'est pas qu'un outil, c'est une philosophie : celle de la productivité sans friction. Plongez dans un écosystème où chaque module travaille en synergie pour un <strong className="text-white">Flow optimal</strong>.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: <LayoutDashboard size={40} className="text-violet-400" />, title: 'Dashboard Intuitif', description: 'Une vue d\'ensemble claire pour une gestion sans effort de toutes vos activités.' },
              { icon: <ClipboardCheck size={40} className="text-pink-400" />, title: 'Listes de Tâches Intelligentes', description: 'Organisez, priorisez et suivez vos tâches avec une efficacité inégalée.' },
              { icon: <MessageSquare size={40} className="text-blue-400" />, title: 'Messagerie Collaboratif (Flow Live Messages)', description: 'Communiquez en temps réel, transformez les discussions en actions en un clic.' },
              { icon: <Briefcase size={40} className="text-green-400" />, title: 'Gestion de Projets Avancée', description: 'De la planification Gantt aux échéances, maîtrisez chaque phase de vos projets.' },
              { icon: <FileText size={40} className="text-orange-400" />, title: 'Facturation et Suivi Client', description: 'Créez des factures professionnelles et suivez les paiements directement depuis l\'app.' },
              { icon: <CalendarDays size={40} className="text-yellow-400" />, title: 'Calendrier Synchronisé', description: 'Planifiez meetings, événements et deadlines avec une intégration parfaite.' },
              { icon: <Users size={40} className="text-cyan-400" />, title: 'Management d\'Équipe Centralisé', description: 'Gérez vos collaborateurs, attribuez des rôles et optimisez la collaboration.' },
              { icon: <Lightbulb size={40} className="text-purple-400" />, title: 'Bloc-notes Intelligent', description: 'Capturez vos idées, rédigez des notes structurées avec support Markdown.' },
              { icon: <Cloud size={40} className="text-emerald-400" />, title: 'Intégration Cloud (Google Drive)', description: 'Liez vos documents importants directement à vos projets pour un accès rapide.' },
            ].map((feature, index) => (
              <motion.div key={index} variants={CARD_VARIANTS} className="glass-card p-8 rounded-xl shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-300 ease-out border border-gray-700">
                {feature.icon}
                <h3 className="text-2xl font-semibold mt-4 mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-300 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Re-introduced Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animated-gradient-text violet-pink-gradient-text"
          >
            {t('testimonials', 'Ce que nos utilisateurs disent')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Découvrez l'impact réel de NocaFLOW à travers les témoignages de ceux qui l'utilisent chaque jour pour transformer leur productivité.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { name: 'Sarah L., CEO TechInnov', quote: 'NocaFLOW a révolutionné notre façon de travailler. Moins de chaos, plus de Flow. Indispensable !', avatar: '/images/avatars/avatar1.jpg' },
              { name: 'Marc D., Chef de Projet', quote: 'La gestion des tâches et des projets n\'a jamais été aussi fluide. Les intégrations sont parfaites.', avatar: '/images/avatars/avatar2.jpg' },
              { name: 'Émilie R., Consultante Freelance', quote: 'Un outil unique qui regroupe tout ce dont j\'ai besoin. Gain de temps énorme au quotidien.', avatar: '/images/avatars/avatar3.jpg' },
              { name: 'David C., Responsable Marketing', quote: 'La messagerie intégrée et la conversion en tâches, c\'est un game-changer pour notre équipe.', avatar: '/images/avatars/avatar4.jpg' },
              { name: 'Léa P., Gérante PME', quote: 'J\'apprécie la simplicité et la puissance. Notre facturation est enfin organisée.', avatar: '/images/avatars/avatar5.jpg' },
              { name: 'Tom F., Développeur Lead', quote: 'Le Gantt Chart est visuellement impressionnant et extrêmement utile pour le suivi. Top !', avatar: '/images/avatars/avatar6.jpg' },
            ].map((testimonial, index) => (
              <motion.div key={index} variants={STAGGER_CHILD_VARIANTS} className="glass-card p-6 rounded-xl shadow-xl flex flex-col items-center transform hover:scale-[1.02] transition-transform duration-200 ease-out border border-gray-800 backdrop-blur-sm">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-violet-500" />
                <p className="italic text-lg text-slate-200 mb-4">"{testimonial.quote}"</p>
                <p className="font-semibold text-pink-400">- {testimonial.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

       {/* Call to Action Section */}
      <section className="py-20 px-4 bg-purple-950 text-white text-center">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animated-gradient-text light-gradient-text"
          >
            Prêt à transformer votre productivité ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto"
          >
            Rejoignez des milliers de professionnels qui simplifient leur quotidien avec NocaFLOW.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.2 }}
            onClick={onRegisterClick}
            className="pulse-button inline-flex items-center justify-center gap-2 px-10 py-5 text-xl font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 shadow-2xl"
          >
            Démarrer Votre FLOW Gratuitement <ArrowRight size={24} />
          </motion.button>
        </div>
      </section>

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