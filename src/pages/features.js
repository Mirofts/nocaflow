// src/pages/features.js
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function FeaturesPage() {
  const { t } = useTranslation('common'); // Ou 'features' si vous avez un namespace spécifique pour cette page

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

      <div className="py-12 bg-color-bg-primary text-color-text-primary"> {/* bg-color-bg-primary et text-color-text-primary viennent de globals.css */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('features_heading', 'Nos Fonctionnalités')}
          </h1>
          <p className="text-xl text-color-text-secondary max-w-3xl mx-auto">
            {t('features_subheading', 'NocaFLOW est conçu pour simplifier chaque aspect de votre gestion client.')}
          </p>

          {/* Section d'exemples de fonctionnalités */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="💬" // Remplacez par une icône réelle si vous en avez
              title={t('feature_messaging_title', 'Messagerie en Temps Réel')}
              description={t('feature_messaging_desc', 'Communiquez instantanément avec vos clients et votre équipe grâce à notre système de chat intégré.')}
            />
            <FeatureCard
              icon="✅"
              title={t('feature_tasks_title', 'Gestion de Tâches Intelligente')}
              description={t('feature_tasks_desc', 'Organisez, attribuez et suivez toutes vos tâches avec des rappels et des priorités ajustables.')}
            />
            <FeatureCard
              icon="🗓️"
              title={t('feature_calendar_title', 'Calendrier et Planification')}
              description={t('feature_calendar_desc', 'Gérez vos réunions, deadlines et événements sur un calendrier clair et interactif.')}
            />
            <FeatureCard
              icon="📊"
              title={t('feature_projects_title', 'Suivi de Projets Avancé')}
              description={t('feature_projects_desc', 'Supervisez l’avancement de vos projets, budgets et équipes en temps réel.')}
            />
            <FeatureCard
              icon=" invoicing"
              title={t('feature_invoicing_title', 'Facturation Simplifiée')}
              description={t('feature_invoicing_desc', 'Créez, envoyez et suivez vos factures directement depuis votre tableau de bord.')}
            />
            <FeatureCard
              icon="🤝"
              title={t('feature_crm_title', 'Gestion des Clients et Équipes')}
              description={t('feature_crm_desc', 'Centralisez toutes les informations de vos clients et gérez efficacement les membres de votre équipe.')}
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
    <div className="glass-card p-6 flex flex-col items-center text-center"> {/* Utilise glass-card */}
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold mb-2 text-color-text-primary">{title}</h3>
      <p className="text-color-text-secondary">{description}</p>
    </div>
  );
};

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'features'])), // Assurez-vous d'avoir un namespace 'features' si vous voulez des traductions spécifiques
    },
  };
}