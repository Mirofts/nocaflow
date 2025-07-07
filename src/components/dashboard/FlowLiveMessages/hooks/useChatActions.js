// src/hooks/useChatActions.js
import { useCallback } from 'react';
import { db, storage } from '../lib/firebase'; // Assurez-vous que 'db' et 'storage' sont correctement exportés de firebase.js
import { collection, doc, addDoc, updateDoc, arrayUnion, serverTimestamp, query, where, getDocs, setDoc } from 'firebase/firestore'; // Added setDoc for simulated users
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const useChatActions = (currentUser, conversations, setConversations, setMessages) => {
    const currentFirebaseUid = currentUser?.uid;

    // Helper function to update the last message of a conversation
    const updateLastMessage = useCallback(async (conversationId, messageContent, timestamp) => {
        if (!db) {
            console.error("Firestore DB is not initialized. Cannot update last message.");
            return;
        }
        if (!conversationId) {
            console.warn("Cannot update last message: conversationId is missing.");
            return;
        }
        try {
            const convRef = doc(db, 'conversations', conversationId);
            await updateDoc(convRef, {
                lastMessage: messageContent,
                lastMessageTime: timestamp,
                lastMessageReadBy: [currentFirebaseUid] // Mark as read by current user when they send
            });
        } catch (e) {
            console.error("Error updating last message for conversation " + conversationId + ":", e);
        }
    }, [currentFirebaseUid]);


    // Function to send a text message
    const sendMessage = useCallback(async (text, conversationId, senderUid, isEphemeral = false, duration = null) => {
        if (!db) {
            console.error("Firestore DB is not initialized. Cannot send message.");
            return false;
        }
        if (!text.trim() || !conversationId || !senderUid) {
            console.warn("Cannot send empty message or without conversation/sender.");
            return false; // Return false to indicate failure
        }

        const messagePayload = {
            content: text.trim(),
            senderUid: senderUid,
            timestamp: serverTimestamp(),
            type: 'text',
            isEphemeral: isEphemeral,
            duration: isEphemeral ? (duration || 5 * 60 * 1000) : null, // Default 5 mins for ephemeral
            readBy: [senderUid] // Mark as read by sender by default
        };

        try {
            const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
            await addDoc(messagesColRef, messagePayload);
            await updateLastMessage(conversationId, text.trim(), serverTimestamp());
            return true;
        } catch (e) {
            console.error("Error sending message to conversation " + conversationId + ":", e);
            throw e;
        }
    }, [updateLastMessage]);


    // Function to handle file uploads (images, PDFs)
    const handleFileUpload = useCallback(async (file, conversationId, senderUid, isEphemeral = false) => {
        if (!db || !storage) {
            console.error("Firebase DB or Storage is not initialized. Cannot upload file.");
            return false;
        }
        if (!file || !conversationId || !senderUid) {
            console.warn("Cannot upload file without file data, conversation, or sender.");
            return false;
        }
        if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
            console.warn("Unsupported file type for upload:", file.type);
            alert("Seules les images (PNG, JPEG, GIF) et les PDF sont autorisés pour le moment.");
            return false;
        }

        const filePath = `chat_files/${conversationId}/${senderUid}/${file.name}_${Date.now()}`;
        const storageFileRef = ref(storage, filePath);

        try {
            const snapshot = await uploadBytes(storageFileRef, file);
            const fileURL = await getDownloadURL(snapshot.ref);

            const messagePayload = {
                content: file.name,
                senderUid: senderUid,
                timestamp: serverTimestamp(),
                type: file.type.startsWith('image/') ? 'image' : 'file',
                fileURL: fileURL,
                isEphemeral: isEphemeral,
                duration: isEphemeral ? (5 * 60 * 1000) : null, // Default 5 mins for ephemeral
                readBy: [senderUid]
            };

            const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
            await addDoc(messagesColRef, messagePayload);
            await updateLastMessage(conversationId, `Fichier: ${file.name}`, serverTimestamp());
            return true;
        } catch (e) {
            console.error("Error uploading file to conversation " + conversationId + ":", e);
            throw e;
        }
    }, [updateLastMessage]);


    // Function to start a new conversation
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

        // Check if conversation with exact participants already exists
        const existingQuery = query(collection(db, 'conversations'), where('participants', '==', sortedParticipantUids));
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
            return existingSnap.docs[0].id; // Return existing conversation ID
        }

        // Fetch participant details for new conversation
        const allParticipantsDetailsPromises = sortedParticipantUids.map(uid =>
            getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
                .then(snap => snap.docs[0]?.data() || { uid: uid, displayName: "Unknown User", photoURL: "/images/default-avatar.jpg", isOnline: false })
        );
        const allParticipantsDetails = await Promise.all(allParticipantsDetailsPromises);

        // Determine conversation name if not provided (for 1-1 or small groups)
        let finalConversationName = conversationName;
        let isGroupChat = sortedParticipantUids.length > 2;
        if (!finalConversationName) {
            if (sortedParticipantUids.length === 2) { // 1-1 chat
                const otherParticipant = allParticipantsDetails.find(p => p.uid !== currentFirebaseUid);
                finalConversationName = otherParticipant?.displayName || "New Chat";
            } else if (sortedParticipantUids.length > 2) { // Group chat
                finalConversationName = `Group Chat (${allParticipantsDetails.map(p => p.displayName).join(', ')})`;
            } else { // Self-chat or single participant chat (e.g., guest talking to self)
                finalConversationName = "My Notes";
            }
        }


        try {
            const newConvRef = await addDoc(collection(db, 'conversations'), {
                participants: sortedParticipantUids,
                participantsDetails: allParticipantsDetails,
                createdAt: serverTimestamp(),
                lastMessage: "Conversation started",
                lastMessageTime: serverTimestamp(),
                name: finalConversationName,
                isGroup: isGroupChat,
                lastMessageReadBy: [currentFirebaseUid]
            });

            return newConvRef.id;

        } catch (e) {
            console.error("Error creating new discussion:", e);
            throw e;
        }
    }, [currentFirebaseUid, db]);


    // Function to handle message actions (e.g., assign task from message)
    const handleMessageAction = useCallback(async (messageId, actionType, payload) => {
        if (!currentFirebaseUid) return;
        console.log(`Action '${actionType}' triggered for message ${messageId} with payload:`, payload);
        // This function typically just logs or triggers a callback provided by the parent (FlowLiveMessages/index.js)
        // For example, if actionType is 'assignTask', you might call a prop like onOpenAddTaskFromChat here
        // or pass this action up to FlowLiveMessages/index.js for it to handle with its own props.
    }, [currentFirebaseUid]);


    return {
        sendMessage,
        handleFileUpload,
        startNewConversation,
        handleMessageAction,
    };
};