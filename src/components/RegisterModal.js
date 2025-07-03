// components/RegisterModal.js
import React, { useState, useContext } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Building, Linkedin } from 'lucide-react';

import { auth, db, storage } from '../lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/router';

// Composant GoogleIcon (inchangé)
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

// Composant IconInput (ajusté pour utiliser form-input)
const IconInput = ({ icon, className = '', ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-color-text-secondary">{icon}</div> {/* Couleur ajustée */}
        <input {...props} className={`form-input pl-10 ${className}`} /> {/* Utilisation de form-input */}
    </div>
);

// Composant Checkbox (ajusté pour utiliser variables de couleur)
const Checkbox = ({ label, className = '', ...props }) => (
  <label className={`flex items-center gap-3 text-sm text-color-text-secondary cursor-pointer ${className}`}> {/* Couleur ajustée */}
    <input
      type="checkbox"
      {...props}
      className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 border-color-border-input bg-color-bg-input-field transition-colors" // Ajusté pour les variables
    />
    {label}
  </label>
);

export default function RegisterModal({ t, onClose, onSwitchToLogin }) {
  const { refreshUser } = useContext(AuthContext);
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarFile: null,
    previewAvatarUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const userDocRef = doc(db, 'users', user.uid);
    let photoURL = user.photoURL || null;

    if (additionalData.avatarFile) {
      setLoading(true); // Garder loading à true pendant l'upload d'avatar
      try {
        const avatarRef = ref(storage, `avatars/${user.uid}/${additionalData.avatarFile.name}`);
        const uploadResult = await uploadBytes(avatarRef, additionalData.avatarFile);
        photoURL = await getDownloadURL(uploadResult.ref);
        console.log("Avatar uploaded to:", photoURL);
      } catch (uploadError) {
        console.error("Error uploading avatar during registration:", uploadError);
        setError("Échec du téléchargement de l'avatar. Veuillez réessayer.");
        setLoading(false); // Réinitialiser loading en cas d'échec de l'upload
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
    } finally {
        setLoading(false); // S'assure que loading est toujours réinitialisé à la fin de createUserDocument
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
      onClose();
      router.push('/dashboard');
    } catch (err) {
      console.error("Email registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Cette adresse e-mail est déjà utilisée.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
        // setLoading est déjà géré dans createUserDocument ou directement ici si pas d'avatar
        // et qu'il n'y a pas d'erreur, pour éviter de le remettre à false prématurément si l'upload échoue.
        if (!formData.avatarFile || error) { // Si pas d'avatar ou s'il y a déjà une erreur, on peut réinitialiser
            setLoading(false);
        }
        // Si l'upload d'avatar est en cours, setLoading sera réinitialisé dans createUserDocument
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
      onClose();
      router.push('/dashboard');
    } catch (err) {
      console.error("Google Sign-In error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
          setError("La fenêtre de connexion Google a été fermée.");
      } else if (err.code === 'auth/cancelled-popup-request') {
          setError("La requête de connexion Google a été annulée.");
      } else {
          setError("Erreur lors de la connexion avec Google. Veuillez réessayer.");
      }
    } finally {
        // setLoading est déjà géré dans createUserDocument ou directement ici si pas d'avatar
        if (!formData.avatarFile || error) {
            setLoading(false);
        }
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000]" // Z-index ajusté
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
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-color-text-secondary hover:bg-color-bg-hover hover:text-color-text-primary transition-colors"> {/* Couleurs ajustées */}
                <X className="w-6 h-6"/>
            </button>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tighter animated-gradient-text pink-gradient-text text-color-text-primary">{t('register_title')}</h1> {/* Ajout de text-color-text-primary */}
                <p className="text-lg text-color-text-secondary mt-2">{t('register_subtitle')}</p> {/* Couleur ajustée */}
            </div>
            
            <div className="space-y-3">
              <button onClick={handleGoogleSignIn} type="button" className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors" disabled={loading}>
                  <GoogleIcon />
                  <span>{t('register_with_google')}</span>
              </button>
              <button type="button" disabled className="w-full flex items-center justify-center gap-3 bg-[#0077B5] text-white font-semibold py-2.5 rounded-lg transition-colors opacity-50 cursor-not-allowed">
                  <Linkedin className="w-5 h-5"/>
                  <span>{t('register_with_linkedin')}</span>
              </button>
            </div>

            <div className="flex items-center my-4">
                <hr className="w-full border-color-border-primary"/> {/* Couleur ajustée */}
                <span className="px-2 text-color-text-tertiary text-sm">{t('or_separator')}</span> {/* Couleur ajustée */}
                <hr className="w-full border-color-border-primary"/> {/* Couleur ajustée */}
            </div>
            
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IconInput name="firstname" onChange={handleInputChange} icon={<User className="w-5 h-5" />} type="text" placeholder={t('register_firstname')} required disabled={loading} />
                <IconInput name="lastname" onChange={handleInputChange} icon={<User className="w-5 h-5" />} type="text" placeholder={t('register_lastname')} required disabled={loading} />
              </div>
              <IconInput name="company" onChange={handleInputChange} icon={<Building className="w-5 h-5" />} type="text" placeholder={t('register_company')} disabled={loading} />
          
              <div>
                  <label htmlFor="avatarUpload" className="block text-color-text-secondary text-sm mb-1"> {/* Couleur ajustée */}
                      {t('register_avatar_upload') || 'Télécharger un avatar (Optionnel)'}
                  </label>
                  <div className="flex items-center gap-4">
                      <input
                          type="file"
                          id="avatarUpload"
                          name="avatarFile"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="block w-full text-sm text-color-text-tertiary
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-violet-50 file:text-violet-700
                              hover:file:bg-violet-100"
                          disabled={loading}
                      />
                      {formData.previewAvatarUrl && (
                          <Image
                              src={formData.previewAvatarUrl}
                              alt="Aperçu de l'avatar"
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                          />
                      )}
                  </div>
                  {error && error.includes("avatar") && <p className="text-red-400 text-sm mt-1">{error}</p>}
              </div>

              <IconInput name="email" onChange={handleInputChange} icon={<Mail className="w-5 h-5" />} type="email" placeholder={t('login_email')} required disabled={loading} />
              <IconInput name="password" onChange={handleInputChange} icon={<Lock className="w-5 h-5" />} type="password" placeholder={t('login_password')} required disabled={loading} />
              <IconInput name="confirmPassword" onChange={handleInputChange} icon={<Lock className="w-5 h-5" />} type="password" placeholder={t('register_confirm_password')} required disabled={loading} />
              
              <div className="space-y-3 pt-2">
                <Checkbox label={t('checkbox_age')} required disabled={loading} />
                <Checkbox label={t('checkbox_terms')} required disabled={loading} />
              </div>
              
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button type="submit" disabled={loading} className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-md text-lg !mt-6 disabled:opacity-50 disabled:animate-none">
                {loading ? 'Création...' : t('register_button')}
              </button>
            </form>
            <div className="text-center mt-4">
                <p className="text-color-text-secondary text-sm"> {/* Couleur ajustée */}
                    {t('already_account') || "Déjà un compte ?"} <span onClick={onSwitchToLogin} className="text-pink-500 cursor-pointer hover:text-pink-400 transition-colors">{t('login')}</span>
                </p>
            </div>
        </motion.div>
    </motion.div>
  );
}