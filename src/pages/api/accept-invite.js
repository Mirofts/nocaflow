// src/pages/api/accept-invite.js
import { firestoreAdmin, authAdmin } from '../../lib/firebase-admin';
import admin from 'firebase-admin';
import { z } from 'zod';
import { limiter } from '@/utils/rateLimiter';
import { getAuth } from 'firebase-admin/auth';
import firebaseAdmin from '@/lib/firebaseAdmin';
import { generateCustomId } from '../../context/AuthContext';

// 🧱 1️⃣ Validation des données
const AcceptInviteSchema = z.object({
  token: z.string().min(10),
});

export default async function handler(req, res) {
  // 🚫 2️⃣ Anti-spam (max 5 requêtes / minute)
  await limiter(req, res);

  // ✅ 3️⃣ Méthode POST uniquement
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 🧩 4️⃣ Vérifie l’auth Firebase (l’utilisateur doit être connecté)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    await getAuth(firebaseAdmin).verifyIdToken(idToken);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired Firebase token' });
  }

  // 🧹 5️⃣ Validation du corps de requête
  let body;
  try {
    body = AcceptInviteSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid input', details: err.errors });
  }

  const { token } = body;

  try {
    // 6️⃣ Vérifie si le token existe dans Firestore
    const inviteRef = firestoreAdmin.collection('invitations').doc(token);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      console.warn(`Invitation token ${token} not found.`);
      return res.status(404).json({ error: 'Invitation link is invalid or has expired.' });
    }

    const inviteData = inviteDoc.data();
    const now = new Date();

    // 7️⃣ Vérifie expiration et état
    if (inviteData.accepted) {
      return res.status(409).json({ error: 'This invitation has already been accepted.' });
    }
    if (inviteData.expiresAt.toDate() < now) {
      return res.status(401).json({ error: 'This invitation link has expired.' });
    }

    const invitedUid = inviteData.invitedUid;
    let userRecord;

    // 8️⃣ Vérifie l’existence du compte associé
    try {
      userRecord = await authAdmin.getUser(invitedUid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ error: 'Associated user account not found.' });
      }
      throw error;
    }

    // 9️⃣ Active le compte désactivé
    if (userRecord.disabled) {
      await authAdmin.updateUser(invitedUid, {
        disabled: false,
        emailVerified: inviteData.inviteMethod === 'email' ? true : userRecord.emailVerified,
      });
      console.log(`✅ Firebase Auth user ${invitedUid} activated.`);
    }

    // 🔟 Vérifie / crée le document Firestore utilisateur
    const userDocRef = firestoreAdmin.collection('users').doc(invitedUid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      const customId = generateCustomId(inviteData.memberName || inviteData.inviteIdentifier || inviteData.invitedUid);
      await userDocRef.set({
        uid: invitedUid,
        displayName: inviteData.memberName,
        email: inviteData.inviteIdentifier || userRecord.email || `temp-${invitedUid}@nocaflow.com`,
        photoURL: inviteData.memberAvatar,
        customId,
        firstname: inviteData.memberName.split(' ')[0] || '',
        lastname: inviteData.memberName.split(' ').slice(1).join(' ') || '',
        role: inviteData.memberRole,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      const userData = userDoc.data();
      const updates = {};
      if (!userData.role) updates.role = inviteData.memberRole;
      if (!userData.displayName) updates.displayName = inviteData.memberName;
      if (!userData.photoURL) updates.photoURL = inviteData.memberAvatar;
      if (!userData.customId)
        updates.customId = generateCustomId(inviteData.memberName || inviteData.inviteIdentifier || inviteData.invitedUid);
      if (Object.keys(updates).length > 0) {
        await userDocRef.update(updates);
      }
    }

    // 1️⃣1️⃣ Marque l’invitation comme acceptée
    await inviteRef.update({
      accepted: true,
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 1️⃣2️⃣ Génère un token de connexion personnalisé
    const customToken = await authAdmin.createCustomToken(invitedUid);

    return res.status(200).json({ success: true, customToken });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return res.status(500).json({ error: 'Failed to accept invitation.' });
  }
}
