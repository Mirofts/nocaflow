// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // FIX: Ajout de useMemo ici
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; 
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/router';
import { initialMockData } from '../lib/mockData'; // Import nécessaire pour loginAsGuest

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
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  const createUserDocument = async (userAuth, additionalData = {}) => {
    if (!userAuth) return;

    const userRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userRef);

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
          ...additionalData,
        });
      } catch (error) {
        console.error("Error creating user document:", error);
      }
    } else {
        const existingData = userSnapshot.data();
        if (userAuth.photoURL && !existingData.photoURL) {
            await updateDoc(userRef, { photoURL: userAuth.photoURL });
        }
        if (userAuth.displayName && !existingData.displayName) {
             await updateDoc(userRef, { displayName: userAuth.displayName });
        }
    }
  };

  const updateCurrentUserState = useCallback(async (userAuth) => {
    if (userAuth) {
      if (userAuth.uid !== 'guest_noca_flow') {
        await createUserDocument(userAuth);
        const userDoc = await getDoc(doc(db, 'users', userAuth.uid));
        setCurrentUser({ ...userAuth, ...userDoc.data() });
      } else {
        setCurrentUser({
            uid: 'guest_noca_flow',
            displayName: typeof window !== 'undefined' ? localStorage.getItem('nocaflow_guest_name') || 'Visiteur Curieux' : 'Visiteur Curieux',
            email: 'guest@nocaflow.com',
            photoURL: typeof window !== 'undefined' ? localStorage.getItem('nocaflow_guest_avatar') || '/images/avatars/default-avatar.jpg' : '/images/avatars/default-avatar.jpg',
        });
      }
    } else {
      setCurrentUser(null);
    }
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setLoadingAuth(true); 
      await updateCurrentUserState(userAuth);
    });
    return unsubscribe;
  }, [updateCurrentUserState]);

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
      await createUserDocument(userCredential.user, additionalData);
      await updateCurrentUserState(userCredential.user);
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nocaflow_guest_data');
        localStorage.removeItem('nocaflow_guest_name');
        localStorage.removeItem('nocaflow_guest_avatar');
      }
      setCurrentUser(null);
      setLoadingAuth(false);
      router.push('/');
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
    const guestUid = 'guest_noca_flow';
    if (typeof window !== 'undefined') {
        if (!localStorage.getItem('nocaflow_guest_data')) {
            localStorage.setItem('nocaflow_guest_data', JSON.stringify(initialMockData));
            localStorage.setItem('nocaflow_guest_name', initialMockData.user.displayName);
            localStorage.setItem('nocaflow_guest_avatar', initialMockData.user.photoURL);
        }
    }
    setCurrentUser({
      uid: guestUid,
      displayName: typeof window !== 'undefined' ? localStorage.getItem('nocaflow_guest_name') || 'Visiteur Curieux' : 'Visiteur Curieux',
      email: 'guest@nocaflow.com',
      photoURL: typeof window !== 'undefined' ? localStorage.getItem('nocaflow_guest_avatar') || '/images/avatars/default-avatar.jpg' : '/images/avatars/default-avatar.jpg',
    });
    setLoadingAuth(false); 
  }, []);

  const refreshUser = useCallback(async () => {
    if (currentUser && currentUser.uid !== 'guest_noca_flow') {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setCurrentUser(prev => ({ ...prev, ...userDoc.data() }));
      }
    } else if (currentUser && currentUser.uid === 'guest_noca_flow') {
        setCurrentUser(prev => ({
            ...prev,
            displayName: typeof window !== 'undefined' ? localStorage.getItem('nocaflow_guest_name') || 'Visiteur Curieux' : 'Visiteur Curieux',
            photoURL: typeof window !== 'undefined' ? localStorage.getItem('nocaflow_guest_avatar') || '/images/avatars/default-avatar.jpg' : '/images/avatars/default-avatar.jpg',
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
    return { 
      currentUser: null, 
      loadingAuth: true,
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