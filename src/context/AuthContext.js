// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth'; // Added signInWithCustomToken
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/router';
import { initialMockData } from '../lib/mockData';

// NOUVEAU : Fonction pour générer l'ID unique (vérifier si elle est déjà là)
export const generateCustomId = (name = 'USER') => { // Exportée pour être utilisée dans les API routes
    const letters = name.substring(0, 4).toUpperCase().padEnd(4, 'X');
    const numbers = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${letters}${numbers}`;
};

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

            // NOUVEAU : On génère et ajoute l'ID à la création
            const customId = generateCustomId(firstName || email || uid); // Use uid as fallback for name

            try {
                await setDoc(userRef, {
                    uid,
                    displayName: displayName || `${firstName} ${lastName}`.trim() || email,
                    email,
                    photoURL: photoURL || null,
                    customId: customId, // Ajout de l'ID personnalisé
                    firstname: firstName,
                    lastname: lastName,
                    company: additionalData.company || '',
                    createdAt,
                    ...additionalData,
                });
            } catch (error) {
                console.error("Error creating user document:", error);
            }
        }
    };

    const updateCurrentUserState = useCallback(async (userAuth) => {
        if (userAuth && userAuth.uid !== 'guest_noca_flow') {
            const userRef = doc(db, 'users', userAuth.uid);
            let userDoc = await getDoc(userRef);

            // S'assure que le document existe avant de continuer
            if (!userDoc.exists()) {
                // If user doesn't have a document, create it with basic info from auth.
                // This typically happens for new Google sign-ins, or if a user signs in after invite.
                await createUserDocument(userAuth);
                userDoc = await getDoc(userRef); // Fetch again after creation
            }

            let userData = userDoc.data();

            // NOUVEAU : Vérifie si un utilisateur existant n'a pas d'ID et lui en assigne un
            if (userData && !userData.customId) {
                const newCustomId = generateCustomId(userData.displayName || userData.email || userData.uid);
                try {
                    await updateDoc(userRef, { customId: newCustomId });
                    userData.customId = newCustomId; // Met à jour l'objet local immédiatement
                } catch (error) {
                    console.error("Error adding customId to existing user:", error);
                }
            }

            setCurrentUser({ ...userAuth, ...userData });

        } else if (userAuth?.uid === 'guest_noca_flow') {
            setCurrentUser({ uid: 'guest_noca_flow', displayName: 'Visiteur Curieux', email: 'guest@nocaflow.com' });
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

    // MODIFIED: 'login' function now accepts an optional 'isCustomToken' flag
    const login = useCallback(async (credential, isCustomToken = false) => {
        setLoadingAuth(true);
        try {
            let userCredential;
            if (isCustomToken) {
                userCredential = await signInWithCustomToken(auth, credential);
            } else {
                // Assuming 'credential' is email if not custom token
                const { email, password } = credential;
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            await updateCurrentUserState(userCredential.user);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error("AuthContext login error:", error);
            throw error; // Re-throw to be handled by UI components
        } finally {
            setLoadingAuth(false);
        }
    }, [updateCurrentUserState]);

    const register = useCallback(async (email, password, additionalData) => {
        setLoadingAuth(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserDocument(userCredential.user, additionalData);
            await updateCurrentUserState(userCredential.user);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error("AuthContext register error:", error);
            throw error;
        } finally {
            setLoadingAuth(false);
        }
    }, [updateCurrentUserState, createUserDocument]);


    const logout = useCallback(async () => {
        setLoadingAuth(true);
        try {
            await signOut(auth);
            setCurrentUser(null);
            router.push('/'); // Redirect to homepage after logout
        } catch (error) {
            console.error("AuthContext logout error:", error);
        } finally {
            setLoadingAuth(false);
        }
    }, [router]);

    const loginWithGoogle = useCallback(async () => {
        setLoadingAuth(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await createUserDocument(result.user, {
                // Ensure firstname/lastname/company are extracted or passed if needed
                firstname: result.user.displayName?.split(' ')[0] || '',
                lastname: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                company: '', // Google does not provide company
            });
            await updateCurrentUserState(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            console.error("AuthContext Google login error:", error);
            throw error;
        } finally {
            setLoadingAuth(false);
        }
    }, [updateCurrentUserState, createUserDocument]);

    const loginAsGuest = useCallback(async () => {
        setLoadingAuth(true);
        try {
            // For guest mode, we don't use Firebase Auth, just set local state
            const guestUser = { uid: 'guest_noca_flow', displayName: 'Visiteur Curieux', email: 'guest@nocaflow.com' };
            setCurrentUser(guestUser);
            // Optionally save to local storage or session storage if guest data needs to persist browser sessions
            // localStorage.setItem('currentGuest', JSON.stringify(guestUser));
            return { success: true, user: guestUser };
        } catch (error) {
            console.error("AuthContext guest login error:", error);
            throw error;
        } finally {
            setLoadingAuth(false);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        if (currentUser && currentUser.uid && currentUser.uid !== 'guest_noca_flow') {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                setCurrentUser(prev => ({ ...prev, ...userDoc.data() }));
            }
        }
    }, [currentUser]);

    const contextValue = useMemo(() => ({
        currentUser, loadingAuth, login, register, logout, loginWithGoogle, loginAsGuest, refreshUser,
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
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};