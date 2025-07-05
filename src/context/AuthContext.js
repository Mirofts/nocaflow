// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Import getDoc
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/router';

export const AuthContext = createContext({
  currentUser: null,
  loadingAuth: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
  loginAsGuest: async () => {},
  refreshUser: async () => {},
});

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Commencer à true pour indiquer le chargement initial
  const router = useRouter(); // Utilisation de useRouter pour la redirection contextuelle

  // Fonction utilitaire pour créer ou mettre à jour le document utilisateur dans Firestore
  const createUserDocument = async (userAuth, additionalData = {}) => {
    if (!userAuth) return;

    const userRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userRef); // Utilisation de getDoc

    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL, uid } = userAuth;
      const createdAt = new Date();
      
      const firstName = additionalData.firstname || (displayName ? displayName.split(' ')[0] : '');
      const lastName = additionalData.lastname || (displayName ? displayName.split(' ').slice(1).join(' ') : '');

      try {
        await setDoc(userRef, {
          uid,
          displayName: displayName || `${firstName} ${lastName}`.trim() || email,
          email,
          photoURL: photoURL || null,
          firstname: firstName,
          lastname: lastName,
          company: additionalData.company || '',
          createdAt,
          ...additionalData, // Permet de fusionner d'autres données passées
        });
      } catch (error) {
        console.error("Error creating user document:", error);
      }
    } else {
        // Mettre à jour des champs si l'utilisateur existe déjà (par exemple, photoURL de Google si absent)
        const existingData = userSnapshot.data();
        if (userAuth.photoURL && !existingData.photoURL) {
            await updateDoc(userRef, { photoURL: userAuth.photoURL });
        }
        if (userAuth.displayName && !existingData.displayName) {
             await updateDoc(userRef, { displayName: userAuth.displayName });
        }
    }
  };

  // Met à jour l'état de l'utilisateur et gère Firestore
  const updateCurrentUserState = useCallback(async (userAuth) => {
    if (userAuth) {
      // Pour les utilisateurs non-guest, rafraîchir ou créer le document Firestore
      if (userAuth.uid !== 'guest_noca_flow') {
        await createUserDocument(userAuth);
        // Récupérer les données utilisateur complètes après la création/mise à jour
        const userDoc = await getDoc(doc(db, 'users', userAuth.uid));
        setCurrentUser({ ...userAuth, ...userDoc.data() });
      } else {
        // Gérer le mode invité
        setCurrentUser({
            uid: 'guest_noca_flow',
            displayName: localStorage.getItem('nocaflow_guest_name') || 'Visiteur Curieux',
            email: 'guest@nocaflow.com',
            photoURL: localStorage.getItem('nocaflow_guest_avatar') || '/images/avatars/default-avatar.jpg',
        });
      }
    } else {
      setCurrentUser(null);
    }
    setLoadingAuth(false); // Fin du chargement après la résolution de l'état de l'utilisateur
  }, []);

  // Surveille l'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      // Démarre le chargement avant de tenter de résoudre l'état de l'utilisateur
      setLoadingAuth(true); 
      await updateCurrentUserState(userAuth);
    });
    return unsubscribe;
  }, [updateCurrentUserState]);

  // Méthodes d'authentification

  const login = useCallback(async (email, password) => {
    setLoadingAuth(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await updateCurrentUserState(userCredential.user);
      return userCredential.user;
    } catch (error) {
      setLoadingAuth(false);
      throw error;
    }
  }, [updateCurrentUserState]);

  const register = useCallback(async (email, password, additionalData) => {
    setLoadingAuth(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(userCredential.user, additionalData); // Crée le document Firestore avec les données additionnelles
      await updateCurrentUserState(userCredential.user); // Met à jour l'état React avec les données complètes
      return userCredential.user;
    } catch (error) {
      setLoadingAuth(false);
      throw error;
    }
  }, [updateCurrentUserState, createUserDocument]);


  const logout = useCallback(async () => {
    setLoadingAuth(true);
    try {
      await signOut(auth);
      // Réinitialiser les données de l'invité en cas de déconnexion d'un invité
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nocaflow_guest_data');
        localStorage.removeItem('nocaflow_guest_name');
        localStorage.removeItem('nocaflow_guest_avatar');
      }
      setCurrentUser(null);
      setLoadingAuth(false);
      router.push('/'); // Rediriger vers la page d'accueil après déconnexion
    } catch (error) {
      setLoadingAuth(false);
      throw error;
    }
  }, [router]);

  const loginWithGoogle = useCallback(async () => {
    setLoadingAuth(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await updateCurrentUserState(result.user);
      return result.user;
    } catch (error) {
      setLoadingAuth(false);
      throw error;
    }
  }, [updateCurrentUserState]);

  const loginAsGuest = useCallback(async () => {
    setLoadingAuth(true);
    // Simuler un UID unique pour l'invité
    const guestUid = 'guest_noca_flow';
    if (typeof window !== 'undefined') {
        // Initialiser les données invitées si elles n'existent pas
        if (!localStorage.getItem('nocaflow_guest_data')) {
            localStorage.setItem('nocaflow_guest_data', JSON.stringify(initialMockData));
            localStorage.setItem('nocaflow_guest_name', initialMockData.user.displayName);
            localStorage.setItem('nocaflow_guest_avatar', initialMockData.user.photoURL);
        }
    }
    // Mettre à jour l'état du composant avec l'utilisateur invité
    setCurrentUser({
      uid: guestUid,
      displayName: localStorage.getItem('nocaflow_guest_name') || 'Visiteur Curieux',
      email: 'guest@nocaflow.com',
      photoURL: localStorage.getItem('nocaflow_guest_avatar') || '/images/avatars/default-avatar.jpg',
    });
    setLoadingAuth(false); // Fin du chargement
  }, []);

  // Fonction pour rafraîchir les données de l'utilisateur depuis Firestore si displayName/photoURL changent
  const refreshUser = useCallback(async () => {
    if (currentUser && currentUser.uid !== 'guest_noca_flow') {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setCurrentUser(prev => ({ ...prev, ...userDoc.data() }));
      }
    } else if (currentUser && currentUser.uid === 'guest_noca_flow') {
        // Pour les invités, rafraîchir à partir de localStorage
        setCurrentUser(prev => ({
            ...prev,
            displayName: localStorage.getItem('nocaflow_guest_name') || 'Visiteur Curieux',
            photoURL: localStorage.getItem('nocaflow_guest_avatar') || '/images/avatars/default-avatar.jpg',
        }));
    }
  }, [currentUser]);


  const contextValue = useMemo(() => ({
    currentUser,
    loadingAuth,
    login,
    register,
    logout,
    loginWithGoogle,
    loginAsGuest,
    refreshUser,
  }), [currentUser, loadingAuth, login, register, logout, loginWithGoogle, loginAsGuest, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fournir un objet par défaut pour SSR/SSG pour éviter les erreurs de déstructuration.
    // L'état de chargement initial est true pour indiquer que l'auth n'a pas encore été résolue.
    return { 
      currentUser: null, 
      loadingAuth: true, // Initialisation à true pour le SSR
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      loginWithGoogle: async () => {},
      loginAsGuest: async () => {},
      refreshUser: async () => {},
    };
  }
  return context;
};