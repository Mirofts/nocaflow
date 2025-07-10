// src/hooks/useChatActions.js
import { useCallback } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, query, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore'; // Added arrayRemove
import { ref as storageRefFn, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Using storageRefFn alias

export const useChatActions = (currentUser, conversations, setConversations, setMessages) => {
    const currentFirebaseUid = currentUser?.uid;

    // Modified to handle attachments information for lastMessage display in sidebar
    const updateLastMessage = useCallback(async (conversationId, messageContent, timestamp, senderUid = null, attachments = []) => {
        if (!db) {
            console.error("Firestore DB is not initialized. Cannot update last message.");
            return;
        }
        if (!conversationId) {
            console.warn("Cannot update last message: conversationId is missing.");
            return;
        }

        let displayMessage = messageContent;
        // If there are attachments, override the display message for the sidebar
        if (attachments && attachments.length > 0) {
            if (attachments.length === 1) {
                displayMessage = attachments[0].type === 'image' ? `🖼️ ${attachments[0].name}` : `📄 ${attachments[0].name}`;
            } else {
                displayMessage = `📎 ${attachments.length} ${attachments.length > 1 ? 'fichiers' : 'fichier'} joint(s)`;
            }
        }

        try {
            const convRef = doc(db, 'conversations', conversationId);
            await updateDoc(convRef, {
                lastMessage: displayMessage, // Now stores the summary or content
                lastMessageTime: timestamp,
                lastMessageReadBy: [currentFirebaseUid],
                lastMessageSenderUid: senderUid || currentFirebaseUid,
                // We don't store attachments directly on the conversation doc's lastMessage
                // but the lastMessage field reflects their presence.
            });
        } catch (e) {
            console.error("Error updating last message for conversation " + conversationId + ":", e);
        }
    }, [currentFirebaseUid, db]);


    const sendMessage = useCallback(async (text, conversationId, senderUid, isEphemeral = false, duration = null, attachments = []) => {
        if (!db) {
            console.error("Firestore DB is not initialized. Cannot send message.");
            return false;
        }
        // If no text and no attachments, don't send
        if ((!text.trim() && attachments.length === 0) || !conversationId || !senderUid) {
            console.warn("Cannot send empty message or without conversation/sender, or no attachments.");
            return false;
        }

        const messagePayload = {
            content: text.trim(),
            senderUid: senderUid,
            timestamp: serverTimestamp(),
            type: attachments.length > 0 ? (attachments[0].type === 'image' ? 'image_with_text' : 'file_with_text') : 'text', // Indicate message type if it has attachments
            isEphemeral: isEphemeral,
            duration: isEphemeral ? (duration || 5 * 60 * 1000) : null,
            readBy: [senderUid],
            attachments: attachments // Include attachments array
        };

        try {
            const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
            await addDoc(messagesColRef, messagePayload);
            // Update last message in sidebar based on content or attachments
            await updateLastMessage(conversationId, text.trim(), serverTimestamp(), senderUid, attachments);
            return true;
        } catch (e) {
            console.error("Error sending message to conversation " + conversationId + ":", e);
            throw e;
        }
    }, [updateLastMessage]);


    // handleFileUpload is no longer directly used in the same way,
    // as handleFileChange in index.js now handles the full upload & message send.
    // However, if other parts of your app still call it for single file uploads, keep it.
    // If not, you can remove it or keep it for future single-file specific uploads.
    // For now, I'll remove it since index.js now handles attachments directly via sendMessage.
    // If you need it, you would re-add it and ensure it also uses the new message structure.
    /*
    const handleFileUpload = useCallback(async (file, conversationId, senderUid, isEphemeral = false) => {
        if (!db || !storage) {
            console.error("Firebase DB or Storage is not initialized. Cannot upload file.");
            return false;
        }
        if (!file || !conversationId || !senderUid) {
            console.warn("Cannot upload file without file data, conversation, or sender.");
            return false;
        }
        // File type validation should happen upstream in handleFileChange
        // For individual use, you might add it back here:
        // if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
        //     console.warn("Unsupported file type for upload:", file.type);
        //     alert("Seules les images (PNG, JPEG, GIF) et les PDF sont autorisés pour le moment.");
        //     return false;
        // }

        const filePath = `chat_files/${conversationId}/${senderUid}/${file.name}_${Date.now()}`;
        const storageFileRef = storageRefFn(storage, filePath); // Use aliased ref

        try {
            const snapshot = await uploadBytes(storageFileRef, file);
            const fileURL = await getDownloadURL(snapshot.ref);

            const messagePayload = {
                content: file.name, // Or a generic "Image attached"
                senderUid: senderUid,
                timestamp: serverTimestamp(),
                type: file.type.startsWith('image/') ? 'image' : 'file',
                fileURL: fileURL, // Old structure, might be better to use attachments
                isEphemeral: isEphemeral,
                duration: isEphemeral ? (5 * 60 * 1000) : null,
                readBy: [senderUid]
            };

            const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
            await addDoc(messagesColRef, messagePayload);
            await updateLastMessage(conversationId, `Fichier: ${file.name}`, serverTimestamp(), senderUid);
            return true;
        } catch (e) {
            console.error("Error uploading file to conversation " + conversationId + ":", e);
            throw e;
        }
    }, [updateLastMessage]);
    */


    const startNewConversation = useCallback(async (participantUids, conversationName = '') => {
        if (!db) {
            console.error("Firestore DB is not initialized. Cannot start new conversation.");
            return null;
        }
        if (!participantUids || participantUids.length < 1) {
            throw new Error("Participants are required to start a new conversation.");
        }
        if (!currentFirebaseUid) {
             throw new Error("Current user UID is required to start a new conversation.");
        }

        const sortedParticipantUids = Array.from(new Set([...participantUids, currentFirebaseUid])).sort();

        // Check for existing conversation with exact participants
        const existingQuery = query(collection(db, 'conversations'), where('participants', '==', sortedParticipantUids));
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
            return existingSnap.docs[0].id; // Return existing conversation ID
        }

        const allParticipantsDetailsPromises = sortedParticipantUids.map(uid =>
            getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
                .then(snap => snap.docs[0]?.data() || { uid: uid, displayName: "Unknown User", photoURL: "/images/default-avatar.jpg", isOnline: false })
        );
        const allParticipantsDetails = await Promise.all(allParticipantsDetailsPromises);

        let finalConversationName = conversationName;
        let isGroupChat = sortedParticipantUids.length > 2; // Check if it's a group chat based on participant count
        if (!finalConversationName) {
            if (sortedParticipantUids.length === 2) {
                const otherParticipant = allParticipantsDetails.find(p => p.uid !== currentFirebaseUid);
                finalConversationName = otherParticipant?.displayName || "New Chat";
            } else if (sortedParticipantUids.length > 2) {
                // Generate a default group name if not provided
                const otherParticipants = allParticipantsDetails.filter(p => p.uid !== currentFirebaseUid);
                finalConversationName = `Group with ${otherParticipants.map(p => p.displayName).join(', ')}`;
            } else { // Single participant (e.g., self-notes)
                finalConversationName = "My Notes";
            }
        }


        try {
            const newConvRef = await addDoc(collection(db, 'conversations'), {
                participants: sortedParticipantUids,
                participantsDetails: allParticipantsDetails, // Store details for easier lookup in UI
                createdAt: serverTimestamp(),
                lastMessage: "Conversation started",
                lastMessageTime: serverTimestamp(),
                name: finalConversationName,
                isGroup: isGroupChat,
                lastMessageReadBy: [currentFirebaseUid],
                blockedBy: [], // Initialize blockedBy array
            });

            return newConvRef.id;

        } catch (e) {
            console.error("Error creating new discussion:", e);
            throw e;
        }
    }, [currentFirebaseUid, db]);


    const handleMessageAction = useCallback(async (messageId, actionType, payload) => {
        if (!currentFirebaseUid) return;
        console.log(`Action '${actionType}' triggered for message ${messageId} with payload:`, payload);
    }, [currentFirebaseUid]);

    const editMessage = useCallback(async (conversationId, messageId, newContent) => {
        if (!db || !conversationId || !messageId || !newContent.trim()) {
            console.error("Cannot edit message: missing info or empty content.");
            return;
        }
        try {
            const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
            await updateDoc(messageRef, {
                content: newContent.trim(),
                editedAt: serverTimestamp(),
            });
            console.log(`Message ${messageId} in conversation ${conversationId} edited.`);
        } catch (e) {
            console.error("Error editing message:", e);
        }
    }, [db]);

    const deleteMessage = useCallback(async (conversationId, messageId) => {
        if (!db || !conversationId || !messageId) {
            console.error("Cannot delete message: missing info.");
            return;
        }
        try {
            const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
            // Optionally, delete associated files from Storage if they are direct message files
            // This requires storing file paths in the message document.
            const messageSnap = await getDocs(query(collection(db, 'conversations', conversationId, 'messages'), where('__name__', '==', messageId)));
            const messageData = messageSnap.docs[0]?.data();

            if (messageData && messageData.attachments && messageData.attachments.length > 0) {
                // Delete each attachment from Storage
                for (const attachment of messageData.attachments) {
                    try {
                        const fileRef = storageRefFn(storage, attachment.url); // Assuming URL contains path for deletion
                        await deleteObject(fileRef);
                        console.log(`Attachment ${attachment.name} deleted from storage.`);
                    } catch (storageError) {
                        console.warn(`Could not delete storage file for attachment ${attachment.name}:`, storageError);
                    }
                }
            }

            await deleteDoc(messageRef);
            console.log(`Message ${messageId} in conversation ${conversationId} deleted.`);

            // Update last message in conversation if the deleted message was the last one
            // This is a more complex logic, potentially requiring re-querying last message
            // For simplicity, we might just update the lastMessageTime or set a generic "Message deleted"
            // Or ideally, re-fetch the actual last message.
            // For now, let's keep it simple: if the deleted message was the last one, update lastMessage
            // This would involve querying the last message, which might be inefficient.
            // A more robust solution involves Cloud Functions.
            // For client-side, a simple fallback:
            const remainingMessagesQuery = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('timestamp', 'desc'), limit(1));
            const remainingMessagesSnap = await getDocs(remainingMessagesQuery);
            if (!remainingMessagesSnap.empty) {
                const lastRemainingMessage = remainingMessagesSnap.docs[0].data();
                await updateLastMessage(
                    conversationId,
                    lastRemainingMessage.content || '',
                    lastRemainingMessage.timestamp,
                    lastRemainingMessage.senderUid,
                    lastRemainingMessage.attachments || [] // Pass attachments for correct display
                );
            } else {
                await updateLastMessage(conversationId, "Conversation started", serverTimestamp(), currentFirebaseUid, []); // No more messages
            }


        } catch (e) {
            console.error("Error deleting message:", e);
        }
    }, [db, storageRefFn, updateLastMessage, currentFirebaseUid]); // Added storageRefFn to dependencies, and updateLastMessage

    const blockUser = useCallback(async (targetUserUid, conversationId) => {
        if (!db || !currentFirebaseUid || !conversationId) { // targetUserUid not strictly needed here, as we block self for specific conv
            console.error("Cannot block user: missing info.");
            return;
        }
        try {
            const convRef = doc(db, 'conversations', conversationId);
            // Add current user's UID to the 'blockedBy' array of THIS conversation
            await updateDoc(convRef, {
                blockedBy: arrayUnion(currentFirebaseUid)
            });
            console.log(`User ${currentFirebaseUid} blocked in conversation ${conversationId}.`);
        } catch (e) {
            console.error("Error blocking user:", e);
            throw e;
        }
    }, [db, currentFirebaseUid]);

    const unblockUser = useCallback(async (targetUserUid, conversationId) => {
        if (!db || !currentFirebaseUid || !conversationId) { // targetUserUid not strictly needed here
            console.error("Cannot unblock user: missing info.");
            return;
        }
        try {
            const convRef = doc(db, 'conversations', conversationId);
            // Remove current user's UID from the 'blockedBy' array of THIS conversation
            await updateDoc(convRef, {
                blockedBy: arrayRemove(currentFirebaseUid)
            });
            console.log(`User ${currentFirebaseUid} unblocked in conversation ${conversationId}.`);
        } catch (e) {
            console.error("Error unblocking user:", e);
            throw e;
        }
    }, [db, currentFirebaseUid]);


    return {
        sendMessage,
        // handleFileUpload, // Removed as it's handled in index.js now
        startNewConversation,
        handleMessageAction,
        editMessage,
        deleteMessage,
        blockUser,
        unblockUser
    };
};