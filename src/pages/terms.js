import Head from 'next/head';
import { useTranslation } from 'react-i18next'; // ✅ CORRECT
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// Ligne supprimée : import { i18nConfig } from '../next-i18next.config'; // Cette ligne était déjà commentée/supprimée, bien !

export default function TermsPage() {
  const { t } = useTranslation('common');
  const pageTitle = t('terms', 'Conditions d\'Utilisation');

  return (
    <>
      <Head>
        <title>{pageTitle} - NocaFLOW</title>
      </Head>
      <div className="bg-color-bg-secondary">
        <div className="max-w-4xl mx-auto py-24 px-6 prose prose-invert prose-p:text-color-text-secondary prose-headings:text-color-text-primary">
          <h1>{pageTitle}</h1>
          <p><strong>{t('lÒast_update', 'Dernière mise à jour :')}</strong> 23 juin 2025</p>

          <h2>{t('terms_acceptance_title', '1. Acceptation des conditions')}</h2>
          <p>
            {t('terms_acceptance_desc', "En accédant et en utilisant le service NocaFLOW, vous acceptez d'être lié par ces Conditions. Si vous n'êtes pas d'accord, n'utilisez pas le service.")}
          </p>

          <h2>{t('terms_service_description_title', '2. Description du service')}</h2>
          <p>
            {t('terms_service_description_desc', "NocaFLOW est une plateforme de gestion de productivité. Le service est fourni \"en l'état\" et \"selon la disponibilité\".")}
          </p>

          <h2>{t('terms_user_accounts_title', '3. Comptes utilisateurs')}</h2>
          <p>
            {t('terms_user_accounts_desc', "Vous êtes responsable de la sécurité de votre compte et de votre mot de passe. Vous ne devez pas partager vos identifiants. Toute activité survenant sous votre compte est de votre responsabilité.")}
          </p>

          <h2 className="text-red-400">{t('terms_liability_title', '4. Limitation de responsabilité')}</h2>
          <p className="border-l-4 border-red-500 pl-4 italic">
            <strong>{t('terms_ai_warning', 'AVERTISSEMENT DE L\'AI : La clause suivante est un exemple EXTRÊMEMENT générique. Sa validité juridique est quasi-nulle sans l\'avis d\'un avocat.')}</strong><br/>
            {t('terms_liability_desc', "En aucun cas, NocaFLOW, son créateur ou ses affiliés ne pourront être tenus responsables de tout dommage direct, indirect, fortuit, spécial ou consécutif, y compris, mais sans s'y limiter, les dommages pour perte de profits, de clientèle, d'utilisation, de données ou d'autres pertes intangibles, résultant de l'utilisation ou de l'incapacité d'utiliser le service, de l'accès non autorisé ou de l'altération de vos transmissions ou de vos données, ou de toute autre question relative au service. Cette limitation de responsabilité s'applique dans toute la mesure permise par la loi applicable.")}
          </p>

          <h2 className="text-red-400">{t('terms_refund_title', '5. Politique de remboursement')}</h2>
          <p className="border-l-4 border-red-500 pl-4 italic">
            <strong>{t('terms_ai_warning_refund', 'AVERTISSEMENT DE L\'AI : De même, la validité de cette clause dépend des lois sur la protection des consommateurs de votre pays.')}</strong><br/>
            {t('terms_refund_desc', "Tous les achats d'abonnements sont définitifs et non remboursables. Aucun remboursement ou crédit ne sera accordé pour les périodes d'abonnement partiellement utilisées, les rétrogradations, ou pour les périodes où votre compte est resté ouvert mais non utilisé.")}
          </p>

          <h2>{t('terms_governing_law_title', '6. Droit applicable')}</h2>
          <p>
            {t('terms_governing_law_desc', "Ces conditions seront régies et interprétées conformément aux lois du pays [VOTRE PAYS/ÉTAT], sans tenir compte de ses dispositions en matière de conflit de lois.")}
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