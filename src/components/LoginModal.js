// src/components/LoginModal.js
import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
// CORRECTION DES CHEMINS D'IMPORTATION : Un seul '../' est suffisant car les deux sont dans le répertoire 'src'
import { auth, db } from '../lib/firebase';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next'; // Importez useTranslation ici

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export default function LoginModal({ t, onClose, onSwitchToRegister }) { // Recevez t ici
  const { refreshUser } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createUserDocument = async (user, isEmailLogin = false) => {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log("Creating new user document for:", user.uid);
        const nameParts = user.displayName ? user.displayName.split(' ') : ['', ''];
        const firstname = nameParts[0] || '';
        const lastname = nameParts.slice(1).join(' ') || '';

        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
          firstname: firstname,
          lastname: lastname,
          createdAt: new Date(),
        }, { merge: true });
        console.log("User document created.");
      } else if (isEmailLogin) {
        const userData = userDoc.data();
        if (!userData.displayName && user.email) {
          console.log("Updating display name for email login:", user.uid);
          await updateDoc(userDocRef, {
            displayName: user.email
          });
          console.log("Display name updated.");
        }
      }
    } catch (firebaseError) {
      console.error("Error in createUserDocument:", firebaseError);
      setError("Erreur lors de la création/mise à jour du profil utilisateur.");
      throw firebaseError;
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Email login successful for:", userCredential.user.email);
      await createUserDocument(userCredential.user, true);
      if (refreshUser) await refreshUser(userCredential.user);
      onClose();
      router.push('/dashboard');
    } catch (err) {
      console.error("Email login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(t('invalid_credentials', "Email ou mot de passe incorrect."));
      } else {
        setError(t('login_error', "Une erreur est survenue lors de la connexion. Veuillez réessayer."));
      }
    } finally {
      setLoading(false);
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
      await createUserDocument(result.user);
      if (refreshUser) await refreshUser(result.user);
      onClose();
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
      setLoading(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
        onClick={onClose}
    >
        <motion.div
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="glass-card p-8 rounded-2xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                <X className="w-6 h-6"/>
            </button>
            <div className="text-center">
                <h2 className="mt-2 text-3xl font-bold">{t('login_title')}</h2>
            </div>
            <form onSubmit={handleEmailLogin} className="mt-8 space-y-4">
                <button onClick={handleGoogleSignIn} type="button" className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg hover:bg-slate-200 transition-colors" disabled={loading}>
                    <GoogleIcon />
                    <span>{t('login_with_google')}</span>
                </button>
                <div className="flex items-center">
                    <hr className="w-full border-slate-700"/>
                    <span className="px-2 text-slate-500 text-sm">{t('or_separator')}</span>
                    <hr className="w-full border-slate-700"/>
                </div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('login_email')} className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 focus:ring-pink-500 focus:border-pink-500 transition" required/>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t('login_password')} className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-3 focus:ring-pink-500 focus:border-pink-500 transition" required/>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div className="text-right">
                    <a href="#" className="text-sm font-medium text-slate-400 hover:text-white">{t('forgot_password')}</a>
                </div>
                <button type="submit" disabled={loading} className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-md text-lg disabled:opacity-50 disabled:animate-none">
                  {loading ? t('logging_in', 'Connexion...') : t('login')}
                </button>
            </form>
            <div className="text-center mt-4">
                <p className="text-slate-400 text-sm">
                    {t('no_account') || "Pas encore de compte ?"} <span onClick={onSwitchToRegister} className="text-pink-500 cursor-pointer hover:text-pink-400 transition-colors">{t('register')}</span>
                </p>
            </div>
        </motion.div>
    </motion.div>
  );
}