// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase"; // Assurez-vous que ce chemin est correct

// Création du contexte d'authentification
export const AuthContext = createContext(undefined);

// Fournisseur du contexte pour l'application
export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Ajout d'un état de chargement

  useEffect(() => {
    // Cet effet s'exécute uniquement côté client
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false); // L'authentification est initialisée
    });

    return () => unsubscribe(); // Nettoyer l'écouteur au démontage
  }, []);

  // Fonction pour rafraîchir l'utilisateur après une mise à jour de profil par exemple
  // Firebase fournit une méthode user.reload() qui met à jour le token d'identité côté client
  // et onAuthStateChanged devrait se déclencher avec les nouvelles données.
  // Cependant, pour s'assurer que le composant qui utilise useAuth voit la mise à jour,
  // on peut forcer un setCurrentUser avec la dernière version de l'utilisateur Firebase.
  const refreshUser = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload(); // Recharger les dernières infos de l'utilisateur
      setCurrentUser(auth.currentUser); // Mettre à jour l'état du contexte
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      console.log("Utilisateur déconnecté.");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loadingAuth, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder au contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fournir un objet par défaut pour SSR/SSG afin d'éviter les erreurs de déstructuration.
    // currentUser sera null sur le serveur, ce qui est le comportement attendu avant l'authentification côté client.
    return { currentUser: null, loadingAuth: true, refreshUser: async () => {}, logout: async () => {} };
  }
  return context;
};