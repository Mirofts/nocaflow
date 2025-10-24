// src/pages/join.js
import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '@/context/AuthContext'; // Utilisez l'AuthContext

export default function JoinPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { token, name, avatar } = router.query; // Récupère le token, nom et avatar
  const { login } = useContext(AuthContext); // Utilisez la fonction de login du contexte

  const [message, setMessage] = useState(t('checking_invitation', 'Vérification de l\'invitation en cours...'));
  const [error, setError] = useState(false);
  const [memberInfo, setMemberInfo] = useState({ name: name, avatar: avatar });

  useEffect(() => {
    if (!token) {
      setMessage(t('invalid_or_missing_token', 'Lien d\'invitation invalide ou manquant.'));
      setError(true);
      return;
    }

    const acceptInvitation = async () => {
      try {
        const response = await fetch('/api/accept-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          setMessage(t('invitation_accepted', 'Invitation acceptée ! Connexion automatique...'));
          // Utilisez le customToken retourné par le backend pour connecter l'utilisateur Firebase
          await login(result.customToken, true); // Supposons que votre fonction login peut prendre un customToken
                                                  // ou créez une nouvelle fonction loginWithCustomToken dans AuthContext
          router.push('/dashboard'); // Rediriger vers le dashboard après connexion
        } else {
          setMessage(result.error || t('failed_to_accept_invitation', 'Échec de l\'acceptation de l\'invitation.'));
          setError(true);
        }
      } catch (err) {
        console.error("Error accepting invitation:", err);
        setMessage(t('an_error_occurred_processing', 'Une erreur est survenue lors du traitement de votre invitation.'));
        setError(true);
      }
    };

    acceptInvitation();
  }, [token, router, t, login]); // Dépendances pour useEffect

  return (
    <>
      <Head>
        <title>{t('invitation_title', 'Invitation NocaFLOW')}</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-color-bg-primary text-color-text-primary p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <img src="/images/nocaflow-logo.svg" alt="NocaFLOW Logo" className="mx-auto h-16 mb-4" />
          <h1 className="text-3xl font-bold">{t('welcome_to_nocaflow', 'Bienvenue sur NocaFLOW !')}</h1>
          {memberInfo.name && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {memberInfo.avatar && (
                <Image src={memberInfo.avatar} alt="Avatar" width={64} height={64} className="rounded-full object-cover" />
              )}
              <p className="text-xl font-semibold">{t('hello_name', 'Bonjour, {{name}} !', { name: memberInfo.name })}</p>
            </div>
          )}
          <p className={`text-lg ${error ? 'text-red-400' : 'text-slate-300'}`}>{message}</p>
          {!error && (
            <div className="mt-6">
              <svg className="animate-spin h-10 w-10 text-pink-500 mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {error && (
            <button onClick={() => router.push('/')} className="btn-primary mt-6">
              {t('go_to_homepage', 'Retour à l\'accueil')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {

    },
  };
}
export async function getServerSideProps() {
  return { props: {} };
}
