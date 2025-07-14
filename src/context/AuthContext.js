// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; 
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/router';
import { initialMockData } from '../lib/mockData';

// NOUVEAU : Fonction pour générer l'ID unique
const generateCustomId = (name = 'USER') => {
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
            const customId = generateCustomId(firstName || email);

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
                await createUserDocument(userAuth);
                userDoc = await getDoc(userRef);
            }

            let userData = userDoc.data();

            // NOUVEAU : Vérifie si un utilisateur existant n'a pas d'ID et lui en assigne un
            if (userData && !userData.customId) {
                const newCustomId = generateCustomId(userData.displayName || userData.email);
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

    const login = useCallback(async (email, password) => {
        // ... (logique de login inchangée)
    }, [updateCurrentUserState]);

    const register = useCallback(async (email, password, additionalData) => {
        // ... (logique de register inchangée)
    }, [updateCurrentUserState, createUserDocument]);


    const logout = useCallback(async () => {
        // ... (logique de logout inchangée)
    }, [router]);

    const loginWithGoogle = useCallback(async () => {
        // ... (logique de loginWithGoogle inchangée)
    }, [updateCurrentUserState]);

    const loginAsGuest = useCallback(async () => {
        // ... (logique de loginAsGuest inchangée)
    }, []);

    const refreshUser = useCallback(async () => {
        // ... (logique de refreshUser inchangée)
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