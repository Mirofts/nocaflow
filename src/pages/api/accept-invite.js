// src/pages/api/accept-invite.js
import { firestoreAdmin, authAdmin } from '../../lib/firebase-admin';
import admin from 'firebase-admin'; // Import for FieldValue

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Invitation token is missing.' });
  }

  try {
    const inviteRef = firestoreAdmin.collection('invitations').doc(token);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      console.warn(`Invitation token ${token} not found.`);
      return res.status(404).json({ error: 'Invitation link is invalid or has expired.' });
    }

    const inviteData = inviteDoc.data();
    const now = new Date();

    if (inviteData.accepted) {
      return res.status(409).json({ error: 'This invitation has already been accepted.' });
    }
    if (inviteData.expiresAt.toDate() < now) { // Convert Firestore Timestamp to Date
      return res.status(401).json({ error: 'This invitation link has expired.' });
    }

    const invitedUid = inviteData.invitedUid;
    let userRecord;

    try {
        userRecord = await authAdmin.getUser(invitedUid);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            // This case ideally shouldn't happen if createUser was called in invite-member
            return res.status(404).json({ error: 'Associated user account not found.' });
        }
        throw error;
    }

    // 1. Activate the user account if it was disabled
    if (userRecord.disabled) {
        await authAdmin.updateUser(invitedUid, {
            disabled: false,
            emailVerified: inviteData.inviteMethod === 'email' ? true : userRecord.emailVerified // Verify email if invited by email
        });
        console.log(`Firebase Auth user ${invitedUid} activated.`);
    }

    // 2. Ensure user document in Firestore is complete
    const userDocRef = firestoreAdmin.collection('users').doc(invitedUid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        // If doc somehow doesn't exist, create it with info from invite
        const customId = generateCustomId(inviteData.memberName || inviteData.inviteIdentifier || inviteData.invitedUid);
        await userDocRef.set({
            uid: invitedUid,
            displayName: inviteData.memberName,
            email: inviteData.inviteIdentifier || userRecord.email || `temp-${invitedUid}@nocaflow.com`,
            photoURL: inviteData.memberAvatar,
            customId: customId,
            firstname: inviteData.memberName.split(' ')[0] || '',
            lastname: inviteData.memberName.split(' ').slice(1).join(' ') || '',
            role: inviteData.memberRole, // Store initial role
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            // Add any other default fields needed
        });
    } else {
        // Update existing user doc with role/name if missing
        const userData = userDoc.data();
        const updates = {};
        if (!userData.role) updates.role = inviteData.memberRole;
        if (!userData.displayName) updates.displayName = inviteData.memberName;
        if (!userData.photoURL) updates.photoURL = inviteData.memberAvatar;
        if (!userData.customId) updates.customId = generateCustomId(inviteData.memberName || inviteData.inviteIdentifier || inviteData.invitedUid);

        if (Object.keys(updates).length > 0) {
            await userDocRef.update(updates);
        }
    }


    // 3. Mark invitation as accepted
    await inviteRef.update({
      accepted: true,
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Invitation ${token} marked as accepted.`);

    // 4. Generate a custom token for client-side sign-in
    const customToken = await authAdmin.createCustomToken(invitedUid);
    console.log(`Custom token generated for UID: ${invitedUid}`);

    return res.status(200).json({ success: true, customToken: customToken });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return res.status(500).json({ error: 'Failed to accept invitation.' });
  }
}