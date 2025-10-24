// src/pages/api/invite-member.js
import { firestoreAdmin, authAdmin } from '../../lib/firebase-admin'; // Admin SDK
import { generateCustomId } from '../../context/AuthContext';
import crypto from 'crypto';
import { z } from "zod";
import { limiter } from "@/utils/rateLimiter";
import { getAuth } from "firebase-admin/auth";
import admin from "@/lib/firebaseAdmin";

const InviteSchema = z.object({
  memberName: z.string().min(1).max(100),
  memberRole: z.string().min(1),
  memberAvatar: z.string().url().optional(),
  inviteMethod: z.enum(["email", "link"]),
  inviteIdentifier: z.string().optional(),
});

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';

export default async function handler(req, res) {
  // 🚫 1️⃣ Limite les abus (max 5 requêtes / minute)
  await limiter(req, res);

  // ✅ 2️⃣ Vérifie que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 🔑 3️⃣ Vérifie que l'utilisateur est connecté via Firebase
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  let decoded;
  try {
    decoded = await getAuth(admin).verifyIdToken(idToken);
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired Firebase token" });
  }

  // 🧱 4️⃣ Vérifie que l’utilisateur est admin (important)
  if (!decoded.role || decoded.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  }

  // 🧹 5️⃣ Validation des données
  let body;
  try {
    body = InviteSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: "Invalid input", details: err.errors });
  }

  const { memberName, memberRole, memberAvatar, inviteMethod, inviteIdentifier } = body;

  // ⚙️ 6️⃣ Validation manuelle supplémentaire
  if (inviteMethod === 'email' && (!inviteIdentifier || !inviteIdentifier.includes('@'))) {
    return res.status(400).json({ error: 'Valid email required for email invitation method.' });
  }

  try {
    // 1. Génère un token d’invitation unique
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 2. Crée ou récupère l’utilisateur Firebase
    let userRecord;
    let userEmail = inviteMethod === 'email' ? inviteIdentifier : null;
    let userUid;

    try {
      if (userEmail) {
        try {
          userRecord = await authAdmin.getUserByEmail(userEmail);
          userUid = userRecord.uid;
          if (userRecord.disabled) {
            await authAdmin.updateUser(userRecord.uid, { disabled: false });
          }
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            userRecord = await authAdmin.createUser({
              email: userEmail,
              emailVerified: false,
              disabled: true,
              displayName: memberName,
              photoURL: memberAvatar,
            });
            userUid = userRecord.uid;
            console.log(`Firebase Auth user created (disabled) for ${userEmail}: ${userUid}`);
          } else {
            throw error;
          }
        }
      } else {
        userRecord = await authAdmin.createUser({
          email: `temp-${Date.now()}@nocaflow.com`,
          emailVerified: false,
          disabled: true,
          displayName: memberName,
          photoURL: memberAvatar,
        });
        userUid = userRecord.uid;
        console.log(`Firebase Auth user created (disabled, no email) for direct link: ${userUid}`);
      }
    } catch (firebaseAuthError) {
      console.error("Firebase Auth user creation/check error:", firebaseAuthError);
      return res.status(500).json({ error: 'Failed to prepare user account.' });
    }

    // 3. Enregistre l’invitation dans Firestore
    const invitesRef = firestoreAdmin.collection('invitations');
    await invitesRef.doc(invitationToken).set({
      token: invitationToken,
      invitedBy: decoded.uid, // ✅ maintenant on stocke le vrai UID de l’inviteur
      invitedUid: userUid,
      memberName,
      memberRole,
      memberAvatar,
      inviteMethod,
      inviteIdentifier,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
      accepted: false,
    });

    // 4. Génère le lien d’invitation
    const joinUrl = `${APP_BASE_URL}/join?token=${invitationToken}&name=${encodeURIComponent(memberName)}&avatar=${encodeURIComponent(memberAvatar)}`;

    // 5. Envoie l’e-mail d’invitation si méthode = email
    if (inviteMethod === 'email' && userEmail) {
      const subject = `Vous êtes invité à rejoindre NocaFLOW par ${memberName} !`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${APP_BASE_URL}/images/nocaflow-logo.svg" alt="NocaFLOW Logo" style="max-width: 150px;">
          </div>
          <p>Bonjour ${memberName},</p>
          <p>Vous avez été invité à rejoindre NocaFLOW en tant que <strong>${memberRole}</strong> !</p>
          <p>NocaFLOW est votre système d'exploitation client tout-en-un pour gérer vos tâches, projets, équipes et clients.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${joinUrl}" style="background-color: #EC4899; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Rejoindre NocaFLOW
            </a>
          </p>
          <p>Ce lien est valide pour 24 heures.</p>
          <p>À bientôt sur NocaFLOW,</p>
          <hr style="border-top: 1px solid #eee; margin-top: 30px;">
          <p style="text-align: center; font-size: 0.8em; color: #777;">&copy; ${new Date().getFullYear()} NocaFLOW. Tous droits réservés.</p>
        </div>
      `;

      try {
        const emailRes = await fetch(`${APP_BASE_URL}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: userEmail,
            fromEmail: 'noreply@nocaflow.com',
            subject,
            htmlContent,
            newContactName: memberName,
          }),
        });

        if (!emailRes.ok) {
          console.error('❌ Failed to send invitation email');
        } else {
          console.log('✅ Invitation email sent successfully');
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    return res.status(200).json({ success: true, joinUrl, memberId: userUid });

  } catch (error) {
    console.error('Error inviting member:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'This email is already registered.' });
    }
    return res.status(500).json({ error: 'Failed to invite member. Please try again later.' });
  }
}
