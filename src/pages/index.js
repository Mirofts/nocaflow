import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
// import LanguageSwitcher from '../components/dashboard/LanguageSwitcher'; // <-- Suppression du LanguageSwitcher ici, car il est dans la Navbar globale

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 50, damping: 20, mass: 0.5 },
  },
};

// Modifiez la signature de la fonction pour accepter les props onLoginClick et onRegisterClick
export default function HomePage({ onLoginClick, onRegisterClick }) {
  const { t } = useTranslation('common');
  const { user, loadingAuth, loginAsGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && user) {
      router.push('/dashboard');
    }
  }, [user, loadingAuth, router]);

  if (loadingAuth || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-color-bg-primary">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-pink-500"></div>
      </div>
    );
  }

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

      {/* Supprimez le LanguageSwitcher ici, il est désormais dans la Navbar globale */}
      {/* <LanguageSwitcher className="absolute top-6 right-6 z-20" /> */}

      <motion.section
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        // pt-32 est déjà présent, pas besoin d'ajouter pt-16 supplémentaire
        className="relative min-h-[90vh] w-full flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 overflow-hidden bg-purple-500"
      >
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
            src="/realbg.mp4"
          ></video>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div variants={FADE_UP_VARIANTS} className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter animated-gradient-text dark-gradient-text">
              {t('main_headline', "Le Système d'Exploitation Client")}
            </h1>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter animated-gradient-text light-gradient-text mt-2 md:mt-4">
              {t('main_headline_2', 'Tout-en-Un pour Votre Business.')}
            </h1>
          </motion.div>

          <motion.p
            variants={FADE_UP_VARIANTS}
            className="mt-6 text-xl md:text-2xl text-slate-300 max-w-3xl"
            dangerouslySetInnerHTML={{ __html: t('sub_headline') }}
          />

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              // Utilisez la prop onRegisterClick reçue de _app.js
              onClick={onRegisterClick}
              className="pulse-button inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300"
            >
              {t('start', 'Commencer')} <ArrowRight size={20} />
            </button>

            <button
              onClick={loginAsGuest} // Gardez loginAsGuest, car c'est une action directe, pas une modal
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-slate-300 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <Eye size={20} /> {t('try_as_guest', 'Essayer en mode invité')}
            </button>
          </div>

          <motion.div variants={FADE_UP_VARIANTS} className="mt-8 text-slate-400 text-sm">
            <p>{t('no_credit_card', 'Pas de carte de crédit requise. Annulez à tout moment.')}</p>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            {t('features_overview', 'Aperçu des Fonctionnalités')}
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            {t('features_overview_description', 'Découvrez comment NocaFLOW simplifie votre gestion quotidienne avec des outils puissants et intégrés.')}
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            {t('testimonials', 'Ce que nos utilisateurs disent')}
          </h2>
        </div>
      </section>
    </>
  );
}

// Nous devons modifier `getStaticProps` dans index.js pour inclure `onLoginClick` et `onRegisterClick` dans `pageProps`.
// Cependant, `getStaticProps` ne peut pas inclure de fonctions.
// La solution est de passer ces fonctions de `_app.js` directement à `Component` via `pageProps`.

// Donc, pour que `HomePage` reçoive `onLoginClick` et `onRegisterClick`,
// le `_app.js` doit les passer explicitement à `Component`:
// <Component {...pageProps} onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
// OU vous pouvez créer un contexte pour les modales si elles sont très utilisées.

// Pour l'instant, je vais modifier getStaticProps pour refléter la signature de HomePage,
// mais sachez que les fonctions ne seront pas sérialisées si vous les passez directement ici.
// La meilleure pratique est de les passer via _app.js ou un Contexte.
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Les fonctions onLoginClick et onRegisterClick ne peuvent PAS être passées via getStaticProps.
      // Elles doivent être passées par _app.js ou un contexte.
      // Donc, nous les retirerons d'ici et nous nous assurerons que _app.js les transmet.
    },
  };
}