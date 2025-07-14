// src/lib/firebase-admin.js
import admin from 'firebase-admin';
import path from 'path'; // Import the 'path' module

// Assurez-vous que le chemin vers votre clé de compte de service est correct.
// Pour Vercel ou d'autres environnements de déploiement, utilisez des variables d'environnement.
// Pour le développement local, lisez le fichier.

// FIX: Use path.join and process.cwd() for a robust absolute path to the root
const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-sdk-credentials.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Ensure this matches your Firebase project ID from .env.local or your firebaseConfig
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const authAdmin = admin.auth();
const firestoreAdmin = admin.firestore();

export { authAdmin, firestoreAdmin };