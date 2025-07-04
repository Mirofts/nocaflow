// src/pages/features.js
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function FeaturesPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('features_page_title', 'Fonctionnalités - NocaFLOW')}</title>
        <meta
          name="description"
          content={t(
            'features_meta_description',
            "Découvrez les puissantes fonctionnalités de NocaFLOW qui simplifient la gestion client et boostent votre productivité."
          )}
        />
      </Head>

      <div className="py-12 bg-color-bg-primary text-color-text-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('features_title', 'Une plateforme, tout votre travail.')} {/* Utilise features_title du fichier common.json */}
          </h1>
          <p className="text-xl text-color-text-secondary max-w-3xl mx-auto">
            {t('features_subtitle', 'Découvrez comment NocaFLOW centralise chaque aspect de votre collaboration client pour une productivité décuplée.')} {/* Utilise features_subtitle */}
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.39a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.74v.17a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>}
              title={t('feature_portals_name', 'Portails Clients Unifiés')}
              description={t('feature_portals_desc', 'Offrez à chaque client un espace unique, sécurisé, et à votre marque pour une expérience premium et centralisée.')}
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2v4"/><path d="M9 2v4"/><path d="M8 21h8"/><path d="M15 6H9"/></svg>}
              title={t('feature_projects_name', 'Gestion de Projets (Trello-like)')}
              description={t('feature_projects_desc', 'Tableaux Kanban, tâches, statuts, deadlines. Votre client voit le progrès en temps réel, plus de rapports nécessaires.')}
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              title={t('feature_messaging_name', 'Messagerie & Fichiers (Slack/Drive-like)')}
              description={t('feature_messaging_desc', 'Discussions contextuelles par projet et stockage de fichiers centralisé. Fini les décisions et documents perdus.')}
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>}
              title={t('feature_billing_name', 'Facturation & Paiements (Stripe-like)')}
              description={t('feature_billing_desc', 'Générez des factures professionnelles en un clic. Vos clients paient directement depuis leur portail, simplement et rapidement.')}
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              title={t('feature_time_name', 'Suivi du Temps & Rapports')}
              description={t('feature_time_desc', 'Suivez le temps passé sur les projets et générez des rapports d\'activité clairs pour justifier votre valeur.')}
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><path d="M12 20.94c1.5 0 2.85-.93 3.61-2.32l.5-.83a2 2 0 0 1 2.76-1.1Zm5.18-11.45L22 4"/><path d="M10.87 3a2 2 0 0 0-.5.23L5.67 5.72a2 2 0 0 0-1.1 1.74v.17c0 .82.31 1.6.88 2.22l5.06 5.06a2 2 0 0 0 2.22.88h.17a2 2 0 0 0 1.74-1.1L20.77 13.62a2 2 0 0 0 .23-.5Zm-.44 4.88 7.37 7.37"/><path d="m14.5 17-7.37-7.37"/></svg>}
              title={t('feature_branding_name', 'Branding & Personnalisation')}
              description={t('feature_branding_desc', 'Appliquez votre logo, vos couleurs, et même votre nom de domaine pour une expérience 100% à votre image.')}
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              title={t('feature_integrations_name', 'Intégrations & API')}
              description={t('feature_integrations_desc', 'Connectez NocaFLOW à vos outils préférés comme Calendly ou Zapier, et utilisez notre API pour des workflows sur mesure.')}
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M12 20.94c1.5 0 2.85-.93 3.61-2.32l.5-.83a2 2 0 0 1 2.76-1.1Zm5.18-11.45L22 4"/><path d="M10.87 3a2 2 0 0 0-.5.23L5.67 5.72a2 2 0 0 0-1.1 1.74v.17c0 .82.31 1.6.88 2.22l5.06 5.06a2 2 0 0 0 2.22.88h.17a2 2 0 0 0 1.74-1.1L20.77 13.62a2 2 0 0 0 .23-.5Zm-.44 4.88 7.37 7.37"/><path d="m14.5 17-7.37-7.37"/></svg>}
              title={t('feature_security_name', 'Sécurité & Rôles')}
              description={t('feature_security_desc', 'Gérez avec précision les accès de vos équipes et de vos clients avec des permissions avancées pour une sécurité sans compromis.')}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Composant simple pour une carte de fonctionnalité
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="glass-card p-6 flex flex-col items-center text-center">
      <div className="text-5xl mb-4">{icon}</div> {/* L'icône est maintenant un SVG */}
      <h3 className="text-2xl font-semibold mb-2 text-color-text-primary">{title}</h3>
      <p className="text-color-text-secondary">{description}</p>
    </div>
  );
};

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'features'])),
    },
  };
}