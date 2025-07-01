// pages/privacy.js
import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// Ligne supprimée : import { i18nConfig } from '../next-i18next.config';

export default function PrivacyPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('privacy', 'Privacy Policy')}</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-prose text-gray-800 dark:text-gray-200">
          <h1 className="text-3xl font-bold mb-4">{t('privacy', 'Privacy Policy')}</h1>
          <p className="mb-4">
            {t('privacy_policy_intro', 'This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.')}
          </p>
          <h2 className="text-2xl font-semibold mb-3">{t('privacy_policy_data_collection', 'Collecting and Using Your Personal Data')}</h2>
          <h3 className="text-xl font-semibold mb-2">{t('privacy_policy_types_of_data', 'Types of Data Collected')}</h3>
          <p className="mb-2">
            {t('privacy_policy_personal_data', 'While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Usage Data.')}
          </p>
          {/* Add more sections as per your actual Privacy Policy content and use 't' for each paragraph/heading */}
          <p className="mt-4">
            {t('privacy_policy_contact_us', 'If you have any questions about this Privacy Policy, You can contact us:')}
            <ul>
              <li>{t('privacy_policy_contact_email', 'By email: privacy@nocaflow.com')}</li>
            </ul>
          </p>
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