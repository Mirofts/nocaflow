// src/pages/pricing.js
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo } from 'react';

export default function PricingPage() {
  const { t } = useTranslation('common'); // Ou 'pricing' si vous avez un namespace spécifique pour cette page

  // Exemple de données pour les plans tarifairesconst pricingPlans = useMemo(() => [
  {
    name: t('plan_basic_title', 'Basique'),
    price: '0 €',
    period: t('plan_period_month', '/ mois'),
    features: [
      t('plan_feature_task_management', 'Gestion de tâches basique'),
      t('plan_feature_1_project', '1 projet'),
      t('plan_feature_guest_mode', 'Mode invité'),
      t('plan_feature_email_support', 'Support par e-mail'),
    ],
    buttonText: t('plan_button_start_free', 'Commencer Gratuitement'),
    buttonLink: '/register',
    isFree: true,
  },
  {
    name: t('plan_pro_title', 'Pro'),
    price: '29 €',
    period: t('plan_period_month', '/ mois'),
    features: [
      t('plan_feature_all_basic', 'Toutes les fonctionnalités Basiques'),
      t('plan_feature_unlimited_projects', 'Projets illimités'),
      t('plan_feature_team_access', 'Accès équipe (jusqu\'à 5 membres)'),
      t('plan_feature_priority_support', 'Support prioritaire'),
      t('plan_feature_custom_domain', 'Domaine personnalisé'),
    ],
    buttonText: t('plan_button_get_started', 'Démarrer'),
    buttonLink: '/register?plan=pro',
    isPopular: true,
  },
  {
    name: t('plan_enterprise_title', 'Entreprise'),
    price: t('plan_price_contact', 'Contactez-nous'),
    period: '',
    features: [
      t('plan_feature_all_pro', 'Toutes les fonctionnalités Pro'),
      t('plan_feature_unlimited_members', 'Membres illimités'),
      t('plan_feature_dedicated_manager', 'Manager de compte dédié'),
      t('plan_feature_onboarding_training', 'Formation et intégration'),
      t('plan_feature_advanced_analytics', 'Analyses avancées'),
    ],
    buttonText: t('plan_button_contact_sales', 'Contacter les Ventes'),
    buttonLink: '/contact',
    isFree: false,
  },
], [t]);

  return (
    <>
      <Head>
        <title>{t('pricing_page_title', 'Tarifs - NocaFLOW')}</title>
        <meta
          name="description"
          content={t(
            'pricing_meta_description',
            "Découvrez les plans tarifaires de NocaFLOW et choisissez celui qui correspond le mieux à vos besoins."
          )}
        />
      </Head>

      <div className="py-12 bg-color-bg-primary text-color-text-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('pricing_heading', 'Trouvez le Plan Parfait pour Votre Équipe')}
          </h1>
          <p className="text-xl text-color-text-secondary max-w-3xl mx-auto">
            {t('pricing_subheading', 'Des solutions flexibles pour toutes les tailles d\'entreprise, du freelance aux grandes équipes.')}
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} plan={plan} t={t} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Composant pour une carte de plan tarifaire
const PricingCard = ({ plan, t }) => {
  return (
    <div className={`glass-card p-8 flex flex-col items-center text-center ${plan.isPopular ? 'border-2 border-violet-500 shadow-lg' : ''}`}>
      {plan.isPopular && (
        <span className="absolute -top-3 px-3 py-1 text-xs font-semibold bg-violet-500 text-white rounded-full">
          {t('plan_most_popular', 'Le plus populaire')}
        </span>
      )}
      <h3 className="text-2xl font-bold mb-4 text-color-text-primary">{plan.name}</h3>
      <div className="text-5xl font-extrabold text-violet-600 dark:text-pink-400 mb-6">
        {plan.price}
        {plan.period && <span className="text-lg font-normal text-color-text-secondary">{plan.period}</span>}
      </div>
      <ul className="text-color-text-secondary mb-8 space-y-3 text-left w-full">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link href={plan.buttonLink} className={`mt-auto w-full px-6 py-3 rounded-full text-lg font-semibold transition-colors ${
        plan.isFree
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
          : plan.isPopular
          ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'
          : 'bg-gray-200 dark:bg-gray-700 text-color-text-primary hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}>
        {plan.buttonText}
      </Link>
    </div>
  );
};


export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'pricing'])), // Assurez-vous d'avoir un namespace 'pricing' si vous voulez des traductions spécifiques
    },
  };
}