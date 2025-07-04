// pages/privacy.js
import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next'; // Still imported, but its usage is removed for problematic parts
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function PrivacyPage() {
  const { t } = useTranslation('common'); // Keeping this if 't' is used elsewhere, or for future re-enablement

  return (
    <>
      <Head>
        <title>Politique de Confidentialité - NocaFLOW</title> {/* Hardcoded */}
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-color-bg-primary text-color-text-primary">
        <div className="max-w-prose glass-card p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-color-text-primary">Politique de Confidentialité</h1> {/* Hardcoded */}
          <p className="mb-4 text-color-text-secondary">
            Cette Politique de Confidentialité décrit Nos politiques et procédures sur la collecte, l'utilisation et la divulgation de Vos informations lorsque Vous utilisez le Service et Vous informe de Vos droits en matière de confidentialité et de la manière dont la loi Vous protège. {/* Hardcoded */}
          </p>
          <h2 className="text-2xl font-semibold mb-3 text-color-text-primary">Collecte et Utilisation de Vos Données Personnelles</h2> {/* Hardcoded */}
          <h3 className="text-xl font-semibold mb-2 text-color-text-primary">Types de Données Collectées</h3> {/* Hardcoded */}
          <p className="mb-2 text-color-text-secondary">
            Lors de l'utilisation de Notre Service, Nous pouvons Vous demander de Nous fournir certaines informations personnellement identifiables qui peuvent être utilisées pour Vous contacter ou Vous identifier. Les informations personnellement identifiables peuvent inclure, sans s'y limiter : l'adresse e-mail, le prénom et le nom, le numéro de téléphone, les données d'utilisation. {/* Hardcoded */}
          </p>
          <p className="mt-4 text-color-text-secondary">
            Si vous avez des questions sur cette Politique de Confidentialité, Vous pouvez nous contacter : {/* Hardcoded */}
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>Par e-mail : privacy@nocaflow.com</li> {/* Hardcoded */}
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