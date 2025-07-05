// pages/register.js
import React, { useState, useContext } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Building, Linkedin } from 'lucide-react';
import { auth, storage } from '../lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext'; // Utilisez useAuth comme un hook
import { useRouter } from 'next/router';

// Imports for i18n
import { useTranslation } from 'react-i18next'; // ✅ CORRECT
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Composant pour l'icône Google (laissez tel quel)
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

// Composant pour l'input avec icône (laissez tel quel)
const IconInput = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        <input {...props} className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2 focus:ring-pink-500 focus:border-pink-500 transition" />
    </div>
);

// Composant Checkbox (laissez tel quel)
const Checkbox = ({ label, ...props }) => (
  <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer">
    <input type="checkbox" {...props} className="w-4 h-4 bg-slate-700 border-slate-600 rounded text-pink-500 focus:ring-pink-500" />
    {label}
  </label>
);

// Composant principal RegisterPage
export default function RegisterPage({ onLoginClick, onRegisterClick }) {
  const { t } = useTranslation('common');
  const { refreshUser } = useAuth(); // Utilisation directe du hook useAuth
  const router = useRouter(); // Appelé inconditionnellement
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarFile: null,
    previewAvatarUrl: ''
  }); // Appelé inconditionnellement
  const [error, setError] = useState(''); // Appelé inconditionnellement
  const [loading, setLoading] = useState(false); // Appelé inconditionnellement

  // Si refreshUser est absolument nécessaire et que le contexte est vide côté SSR,
  // on peut faire une vérification ici, mais après l'appel des hooks.
  // Cependant, useAuth devrait déjà retourner des fonctions par défaut pour le SSR.
  // if (!refreshUser) {
  //   return null;
  // }


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        avatarFile: file,
        previewAvatarUrl: URL.createObjectURL(file)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        avatarFile: null,
        previewAvatarUrl: ''
      }));
    }
  };
const createUserDocument = async (user, additionalData) => {
  const { getFirestore, setDoc, doc } = await import('firebase/firestore');
  const db = getFirestore();

  const userDocRef = doc(db, 'users', user.uid);
  let photoURL = user.photoURL || null;

  if (additionalData.avatarFile) {
    setLoading(true);
    try {
      const avatarRef = ref(storage, `avatars/${user.uid}/${additionalData.avatarFile.name}`);
      const uploadResult = await uploadBytes(avatarRef, additionalData.avatarFile);
      photoURL = await getDownloadURL(uploadResult.ref);
      console.log("Avatar uploaded to:", photoURL);
    } catch (uploadError) {
      console.error("Error uploading avatar during registration:", uploadError);
      setError("Échec du téléchargement de l'avatar. Veuillez réessayer.");
      setLoading(false);
      throw uploadError;
    }
  }

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || `${additionalData.firstname || ''} ${additionalData.lastname || ''}`.trim(),
    photoURL: photoURL,
    createdAt: new Date(),
    firstname: additionalData.firstname || '',
    lastname: additionalData.lastname || '',
    company: additionalData.company || ''
  };

  try {
    await setDoc(userDocRef, userData, { merge: true });
    console.log("User document created/updated in Firestore.");
  } catch (firestoreError) {
    console.error("Error creating/updating user document in Firestore:", firestoreError);
    setError("Erreur lors de la sauvegarde de votre profil. Veuillez réessayer.");
    throw firestoreError;
  }
};

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Email registration successful for:", userCredential.user.email);
      await createUserDocument(userCredential.user, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        company: formData.company,
        avatarFile: formData.avatarFile
      });
      if (refreshUser) await refreshUser(userCredential.user);
      onLoginClick();
      router.push('/dashboard');
    } catch (err) {
      console.error("Email registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t('email_already_in_use', "Cette adresse e-mail est déjà utilisée."));
      } else if (err.code === 'auth/weak-password') {
        setError(t('weak_password', "Le mot de passe doit contenir au moins 6 caractères."));
      } else {
        setError(t('registration_error', "Une erreur est survenue lors de l'inscription. Veuillez réessayer."));
      }
    } finally {
      if (!formData.avatarFile || error) {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign-In successful for:", result.user.email);
      const nameParts = result.user.displayName ? result.user.displayName.split(' ') : ['', ''];
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      await createUserDocument(result.user, {
          firstname,
          lastname,
          company: '',
          avatarFile: formData.avatarFile
      });
      if (refreshUser) await refreshUser(result.user);
      onLoginClick();
      router.push('/dashboard');
    } catch (err) {
      console.error("Google Sign-In error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
          setError(t('google_popup_closed', "La fenêtre de connexion Google a été fermée."));
      } else if (err.code === 'auth/cancelled-popup-request') {
          setError(t('google_request_cancelled', "La requête de connexion Google a été annulée."));
      } else {
          setError(t('google_signin_error', "Erreur lors de la connexion avec Google. Veuillez réessayer."));
      }
    } finally {
      if (!formData.avatarFile || error) {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>{t('register_title', "S'enregistrer")}</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-6 text-white text-center">
          {t('register_page_headline', "Inscrivez-vous pour démarrer !")}
        </h1>
        <p className="text-xl text-slate-400 mb-8 text-center max-w-2xl">
          {t('register_page_subheadline', "Commencez votre expérience NocaFLOW en créant votre compte.")}
        </p>
        <form onSubmit={handleEmailRegister} className="w-full max-w-md bg-slate-900/50 p-8 rounded-lg shadow-xl border border-slate-800 space-y-6">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="flex justify-center space-x-4 mb-6">
            <button type="button" onClick={handleGoogleSignIn} className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-semibold transition"><GoogleIcon /> {t('register_with_google')}</button>
          </div>

          <div className="text-center text-slate-400 mb-6">{t('or_separator')}</div>

          <div className="flex gap-4">
            <IconInput type="text" name="firstname" placeholder={t('register_firstname')} value={formData.firstname} onChange={handleInputChange} icon={<User className="w-5 h-5 text-slate-400" />} required />
            <IconInput type="text" name="lastname" placeholder={t('register_lastname')} value={formData.lastname} onChange={handleInputChange} icon={<User className="w-5 h-5 text-slate-400" />} required />
          </div>
          <IconInput type="text" name="company" placeholder={t('register_company')} value={formData.company} onChange={handleInputChange} icon={<Building className="w-5 h-5 text-slate-400" />} />
          <IconInput type="email" name="email" placeholder={t('login_email')} value={formData.email} onChange={handleInputChange} icon={<Mail className="w-5 h-5 text-slate-400" />} required />
          <IconInput type="password" name="password" placeholder={t('login_password')} value={formData.password} onChange={handleInputChange} icon={<Lock className="w-5 h-5 text-slate-400" />} required />
          <IconInput type="password" name="confirmPassword" placeholder={t('register_confirm_password')} value={formData.confirmPassword} onChange={handleInputChange} icon={<Lock className="w-5 h-5 text-slate-400" />} required />

          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {formData.previewAvatarUrl ? (
                <Image src={formData.previewAvatarUrl} alt="Avatar Preview" width={80} height={80} objectFit="cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <label className="flex-grow bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md cursor-pointer text-center text-sm font-semibold transition">
              {t('register_avatar_upload')}
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
            </label>
          </div>

          <Checkbox label={t('checkbox_age', 'Je confirme avoir plus de 18 ans')} required />
          <Checkbox label={t('checkbox_terms', "J'ai lu et j'accepte les conditions d'utilisation")} required />

          <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? t('registering', 'Inscription...') : t('register_button', 'Créer mon compte')}
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            {t('already_account', 'Déjà un compte ?')} {' '}
            <button type="button" onClick={onLoginClick} className="text-pink-500 hover:underline">{t('login')}</button>
          </p>
        </form>
      </main>
    </>
  );
}

// PAS DE getStaticPaths POUR getServerSideProps
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    }
  };
}