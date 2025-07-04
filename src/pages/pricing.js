// src/pages/pricing.js
 import Head from 'next/head';
 import { useTranslation } from 'next-i18next';
 import { serverSideTranslations } from 'next-i18n/serverSideTranslations';
 import { useMemo } from 'react';
 import Link from 'next/link';
 

 export default function PricingPage() {
  const { t } = useTranslation('common');
 

  const pricingPlans = useMemo(() => [
  {
  name: 'Solo',
  price: '9$',
  period: t('per_month', '/month'),
  features: t('tier_solo_features', 'For freelancers\nUp to 5 active projects\nUp to 25 clients\n1 GB storage').split('\n'),
  buttonText: t('start', 'Get Started'),
  buttonLink: '/register',
  isFree: false,
  isPopular: false,
  },
  {
  name: 'Team',
  price: '49$',
  period: t('per_month', '/month'),
  features: t('tier_team_features', 'For small teams\nUnlimited projects\nUnlimited clients\nCustom branding\n10 GB storage').split('\n'),
  buttonText: t('start', 'Get Started'),
  buttonLink: '/register?plan=pro',
  isPopular: true,
  },
  {
  name: 'Business',
  price: '249$',
  period: t('per_month', '/month'),
  features: t('tier_business_features', 'For growing agencies\nCustom domain\nAPI & Integrations\nPriority support\nUnlimited storage').split('\n'),
  buttonText: t('start', 'Get Started'),
  buttonLink: '/register?plan=business',
  isFree: false,
  isPopular: false,
  },
  {
  name: 'Big group',
  price: '1999$',
  period: t('per_month', '/month'),
  features: t('tier_enterprise_features', 'Custom plan for large teams. SSO, advanced security, and dedicated support.').split('\n'),
  buttonText: t('contact_us', 'Contact Us'),
  buttonLink: '/contact',
  isFree: false,
  isPopular: false,
  },
  ], [t]);
 

  return (
  <>
  <Head>
  <title>Tarifs - NocaFLOW</title>
  <meta
  name="description"
  content="Découvrez les plans tarifaires de NocaFLOW et choisissez celui qui correspond le mieux à vos besoins."
  />
  </Head>
 

  <div className="py-12 bg-color-bg-primary text-color-text-primary">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
  <h1 className="text-4xl md:text-5xl font-bold mb-6">
  Un tarif simple et transparent.
  </h1>
  <p className="text-xl text-color-text-secondary max-w-3xl mx-auto">
  Choisissez le plan qui s'adapte à votre croissance. Sans frais cachés, sans surprise.
  </p>
 

  <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {pricingPlans.map((plan, index) => (
  <PricingCard key={index} plan={plan} t={t} />
  ))}
  </div>
  </div>
  </div>
  </>
  );
 }
 

 const PricingCard = ({ plan, t }) => {
  return (
  <div className={`glass-card p-8 flex flex-col items-center text-center relative overflow-hidden
  ${plan.isPopular ? 'border-2 border-violet-500 shadow-xl' : ''}`}>
  {plan.isPopular && (
  <span className="absolute top-0 transform translate-y-[-50%] px-3 py-1 text-xs font-semibold bg-violet-500 text-white rounded-full">
  {t('popular', 'Populaire')}
  </span>
  )}
  <h3 className="text-2xl font-bold mb-4 text-color-text-primary">{plan.name}</h3>
  <div className="text-5xl font-extrabold text-violet-600 dark:text-pink-400 mb-6">
  {plan.price}
  {plan.period && <span className="text-lg font-normal text-color-text-secondary">{plan.period}</span>}
  </div>
  <ul className="text-color-text-secondary mb-8 space-y-3 text-left w-full">
  {plan.features.map((feature, idx) => (
  <li key={idx} className="flex items-start">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  <span>{feature}</span>
  </li>
  ))}
  </ul>
  <Link href={plan.buttonLink} className={`mt-auto w-full px-6 py-3 rounded-full text-lg font-semibold transition-colors
  ${plan.name === 'Solo'
  ? 'main-button-secondary'
  : plan.isPopular
  ? 'main-action-button bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 pulse-button'
  : 'main-button-secondary'
  }`}>
  {plan.buttonText}
  </Link>
  </div>
  );
 };
 

 export async function getServerSideProps({ locale }) {
  return {
  props: {
  ...(await serverSideTranslations(locale, ['common', 'pricing'])),
  },
  };
 }