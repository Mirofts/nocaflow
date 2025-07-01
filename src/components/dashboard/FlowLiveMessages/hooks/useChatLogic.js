// src/components/dashboard/FlowLiveMessages/hooks/useChatLogic.js
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp, arrayUnion, writeBatch } from 'firebase/firestore';

const useChatLogic = ({
  user,
  currentFirebaseUid,
  activeConversationId,
  setActiveConversationId,
  setActiveConversationPartner,
  setActiveConversationIsGroup,
  setActiveConversationParticipants,
  currentUserName,
  activeConversationPartner,
  searchTerm,
  setConversations,
  setMessages,
  setFilteredMessages,
  t,
  formatMessageTimeDisplay,
  safeToDate,
  setEphemeralImagePreview,
  db
}) => {
  const [conversationsState, setConversationsState] = useState([]);
  const [messagesState, setMessagesState] = useState([]);
  const [filteredMessagesState, setFilteredMessagesState] = useState([]);
  const [internalAvailableTeamMembers, setInternalAvailableTeamMembersState] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const markMessagesAsRead = useCallback(async (conversationId, messageIds) => {
    if (!currentFirebaseUid || !conversationId || messageIds.length === 0) return;
    const batch = writeBatch(db);
    messageIds.forEach(messageId => {
        const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
        batch.update(messageRef, { readBy: arrayUnion(currentFirebaseUid) });
    });
    try {
        await batch.commit();
    } catch (e) {
        console.error("Error marking messages as read:", e);
    }
  }, [currentFirebaseUid, db]);

  useEffect(() => {
    if (!user || !user.uid) return;
    const userStatusRef = doc(db, 'users', user.uid);
    const setOnline = async () => {
      try { await updateDoc(userStatusRef, { isOnline: true, lastOnline: serverTimestamp() }, { merge: true }); }
      catch (e) { console.error("Failed to set user online status:", e); }
    };
    const setOffline = async () => {
      try { await updateDoc(userStatusRef, { isOnline: false, lastOnline: serverTimestamp() }, { merge: true }); }
      catch (e) { console.error("Failed to set user offline status:", e); }
    };
    setOnline();
    const handleBeforeUnload = () => { setOffline(); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { setOffline(); window.removeEventListener('beforeunload', handleBeforeUnload); };
  }, [user, db]);

  useEffect(() => {
    if (!currentFirebaseUid) return;
    const usersColRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersColRef, (snapshot) => {
      const members = snapshot.docs
        .filter(doc => doc.id !== currentFirebaseUid)
        .map(doc => ({
          firebaseUid: doc.id,
          name: doc.data().displayName || t('user_default', 'Utilisateur'),
          email: doc.data().email || '',
          initials: doc.data().displayName?.charAt(0).toUpperCase() || '?',
          color: 'bg-' + ['yellow', 'green', 'blue', 'red', 'purple'][Math.floor(Math.random() * 5)] + '-500',
        }));
        setInternalAvailableTeamMembersState(members);
    });
    return () => unsubscribe();
  }, [currentFirebaseUid, t, db]);

  useEffect(() => {
    if (!currentFirebaseUid) { setConversationsState([]); return; }
    console.log("Conversations effect (mock)");
    setConversationsState([]);
    return () => {};
  }, [currentFirebaseUid]);


  useEffect(() => {
    if (!activeConversationId) { setMessagesState([]); return; }
    console.log("Messages effect (mock)");
    setMessagesState([]);
    return () => {};
  }, [activeConversationId]);

  useEffect(() => {
    setFilteredMessagesState(messagesState);
  }, [searchTerm, messagesState]);


  return {
    conversations: conversationsState,
    internalAvailableTeamMembers: internalAvailableTeamMembersState,
    messages: messagesState,
    filteredMessages: filteredMessagesState,
    showMobileSidebar,
    setShowMobileSidebar,
    markMessagesAsRead
  };
};

export default useChatLogic;