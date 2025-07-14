// src/pages/api/invite-member.js
import { firestoreAdmin, authAdmin } from '../../lib/firebase-admin'; // Admin SDK
import { generateCustomId } from '../../context/AuthContext'; // Pour générer l'ID personnalisé
import crypto from 'crypto'; // Pour générer un token sécurisé

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'; // URL de base de votre application

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { memberName, memberRole, memberAvatar, inviteMethod, inviteIdentifier } = req.body;

  if (!memberName || !memberRole || !memberAvatar || !inviteMethod) {
    return res.status(400).json({ error: 'Missing required member data for invitation.' });
  }

  // Basic validation for email if method is email
  if (inviteMethod === 'email' && (!inviteIdentifier || !inviteIdentifier.includes('@'))) {
    return res.status(400).json({ error: 'Valid email required for email invitation method.' });
  }

  try {
    // 1. Generate a secure, unique invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex'); // 64 chars hex string
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours

    // 2. Create a temporary Firebase Auth user (or use existing if email)
    let userRecord;
    let userEmail = inviteMethod === 'email' ? inviteIdentifier : null;
    let userUid;

    try {
        if (userEmail) {
            // Check if user already exists
            try {
                userRecord = await authAdmin.getUserByEmail(userEmail);
                userUid = userRecord.uid;
                // If user exists, ensure they are not disabled
                if (userRecord.disabled) {
                    await authAdmin.updateUser(userRecord.uid, { disabled: false });
                }
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    // User does not exist, create a new one
                    userRecord = await authAdmin.createUser({
                        email: userEmail,
                        emailVerified: false, // Will be verified upon accepting invite
                        disabled: true,       // Initially disabled until invite is accepted
                        displayName: memberName,
                        photoURL: memberAvatar,
                    });
                    userUid = userRecord.uid;
                    console.log(`Firebase Auth user created (disabled) for ${userEmail}: ${userUid}`);
                } else {
                    throw error; // Re-throw other Firebase Auth errors
                }
            }
        } else {
            // For direct link (ID method), we can create a UID now, or assign one later.
            // For simplicity, let's create a disabled user even for direct links to link to an Auth user.
            userRecord = await authAdmin.createUser({
                email: `temp-${Date.now()}@nocaflow.com`, // Temporary email
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


    // 3. Store invitation details in Firestore
    const invitesRef = firestoreAdmin.collection('invitations');
    await invitesRef.doc(invitationToken).set({
      token: invitationToken,
      invitedBy: req.headers.authorization, // You'd pass the inviting user's UID here
      invitedUid: userUid, // Link to the Firebase Auth user
      memberName: memberName,
      memberRole: memberRole,
      memberAvatar: memberAvatar,
      inviteMethod: inviteMethod,
      inviteIdentifier: inviteIdentifier,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      accepted: false,
    });
    console.log(`Invitation token stored in Firestore for UID: ${userUid}`);

    // 4. Construct the invitation URL
    const joinUrl = `${APP_BASE_URL}/join?token=${invitationToken}&name=${encodeURIComponent(memberName)}&avatar=${encodeURIComponent(memberAvatar)}`;

    // 5. If inviteMethod is 'email', send the email
    if (inviteMethod === 'email' && userEmail) {
      const subject = `Vous êtes invité à rejoindre NocaFLOW par ${memberName} !`; // Ou le nom de l'inviteur
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
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>À bientôt sur NocaFLOW,</p>
          <p>L'équipe NocaFLOW</p>
          <hr style="border-top: 1px solid #eee; margin-top: 30px;">
          <p style="text-align: center; font-size: 0.8em; color: #777;">&copy; ${new Date().getFullYear()} NocaFLOW. Tous droits réservés.</p>
        </div>
      `;

      // Call your existing /api/send-email endpoint
      const emailRes = await fetch(`${APP_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          fromEmail: 'noreply@nocaflow.com', // Replace with your verified Resend domain email
          subject: subject,
          htmlContent: htmlContent,
          newContactName: memberName,
        }),
      });

      const emailResult = await emailRes.json();
      if (!emailRes.ok) {
        console.error('Failed to send invitation email:', emailResult.error);
        // Do not return error here, as the invitation token is already stored.
        // Log it for debugging, but let the main API call succeed.
      } else {
        console.log('Invitation email sent successfully.');
      }
    }

    // Return the invitation URL and Firebase Auth UID (if created)
    return res.status(200).json({ success: true, joinUrl: joinUrl, memberId: userUid });

  } catch (error) {
    console.error('Error inviting member:', error);
    if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'This email is already registered.' });
    }
    return res.status(500).json({ error: 'Failed to invite member. Please try again later.' });
  }
}