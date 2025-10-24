import Head from 'next/head';
import { useTranslation } from 'react-i18next'; // Still imported
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function TermsPage() {
  const { t } = useTranslation('common'); // Keeping this for consistency or future re-enablement
  const pageTitle = 'Conditions d\'Utilisation'; // Hardcoded

  return (
    <>
      <Head>
        <title>{pageTitle} - NocaFLOW</title>
      </Head>
      <div className="bg-color-bg-primary text-color-text-primary min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto py-24 px-6 glass-card p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-color-text-primary">{pageTitle}</h1>
          <p className="text-color-text-secondary"><strong>Dernière mise à jour :</strong> 23 juin 2025</p> {/* Hardcoded */}

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-color-text-primary">1. Acceptation des conditions</h2> {/* Hardcoded */}
          <p className="text-color-text-secondary">
            En accédant et en utilisant le service NocaFLOW, vous acceptez d'être lié par ces Conditions. Si vous n'êtes pas d'accord, n'utilisez pas le service. {/* Hardcoded */}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-color-text-primary">2. Description du service</h2> {/* Hardcoded */}
          <p className="text-color-text-secondary">
            NocaFLOW est une plateforme de gestion de productivité. Le service est fourni "en l'état" et "selon la disponibilité". {/* Hardcoded */}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-color-text-primary">3. Comptes utilisateurs</h2> {/* Hardcoded */}
          <p className="text-color-text-secondary">
            Vous êtes responsable de la sécurité de votre compte et de votre mot de passe. Vous ne devez pas partager vos identifiants. Toute activité survenant sous votre compte est de votre responsabilité. {/* Hardcoded */}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-red-500">4. Limitation de responsabilité</h2> {/* Hardcoded */}
          <p className="border-l-4 border-red-500 pl-4 italic text-color-text-secondary">
            <strong>AVERTISSEMENT DE L'AI : La clause suivante est un exemple EXTRÊMEMENT générique. Sa validité juridique est quasi-nulle sans l'avis d'un avocat.</strong><br/> {/* Hardcoded */}
            En aucun cas, NocaFLOW, son créateur ou ses affiliés ne pourront être tenus responsables de tout dommage direct, indirect, fortuit, spécial ou consécutif, y compris, mais sans s'y limiter, les dommages pour perte de profits, de clientèle, d'utilisation, de données ou d'autres pertes intangibles, résultant de l'utilisation ou de l'incapacité d'utiliser le service, de l'accès non autorisé ou de l'altération de vos transmissions ou de vos données, ou de toute autre matière relative au service. Cette limitation de responsabilité s'applique dans toute la mesure permise par la loi applicable. {/* Hardcoded */}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-red-500">5. Politique de remboursement</h2> {/* Hardcoded */}
          <p className="border-l-4 border-red-500 pl-4 italic text-color-text-secondary">
            <strong>AVERTISSEMENT DE L'AI : De même, la validité de cette clause dépend des lois sur la protection des consommateurs de votre pays.</strong><br/> {/* Hardcoded */}
            Tous les achats d'abonnements sont définitifs et non remboursables. Aucun remboursement ou crédit ne sera accordé pour les périodes d'abonnement partiellement utilisées, les rétrogradations, ou pour les périodes où votre compte est resté ouvert mais non utilisé. {/* Hardcoded */}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-color-text-primary">6. Droit applicable</h2> {/* Hardcoded */}
          <p className="text-color-text-secondary">
            Ces conditions seront régies et interprétées conformément aux lois du pays [VOTRE PAYS/ÉTAT], sans tenir compte de ses dispositions en matière de conflit de lois. {/* Hardcoded */}
          </p>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
}
