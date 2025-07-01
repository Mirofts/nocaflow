// src/lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
// Importez onAuthStateChanged directement depuis 'firebase/auth' pour être sûr
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth'; // <-- Ajout de onAuthStateChanged ici
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: REMPLACEZ CES VALEURS PAR VOS PROPRES CLÉS API FIREBASE !
// Vous pouvez les trouver dans les paramètres de votre projet Firebase, section "Paramètres du projet" -> "Vos applications"
const firebaseConfig = {
  apiKey: "AIzaSyBIlFLv00bSCR-znjUn_CpX2k91SJZp64c",
  authDomain: "cupaidon-6f089.firebaseapp.com",
  projectId: "cupaidon-6f089",
  storageBucket: "cupaidon-6f089.firebasestorage.app",
  messagingSenderId: "915645218501",
  appId: "1:915645218501:web:593a2bd129464f3aff7aac"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Assure que l'utilisateur reste connecté.
// Important : setPersistence doit être appelé uniquement côté client
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Erreur de persistance de l'authentification:", error);
    });
}

// Exportez auth, db, storage. onAuthStateChanged sera importé directement là où il est utilisé.
export { app, auth, db, storage };