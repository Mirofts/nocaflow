// src/components/dashboard/FlowLiveMessages/hooks/useChatActions.js
import { useCallback } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const useChatActions = ({
  user,
  handleLoginPrompt,
  newMessage,
  activeConversationId,
  currentFirebaseUid,
  t,
  setNewMessage,
  fileInputRef,
  setEphemeralImagePreview,
  db,
  storage
}) => {

  const handleSendMessage = useCallback(async (isEphemeral = false) => {
    if (!user) { handleLoginPrompt(); return; }
    if (newMessage.trim() === '' || !activeConversationId || !currentFirebaseUid) {
        if (!activeConversationId) alert(t('select_or_create_conversation', "Veuillez sélectionner une conversation ou en créer une nouvelle."));
        return;
    }
    const messagePayload = { content: newMessage.trim(), senderUid: currentFirebaseUid, timestamp: serverTimestamp(), type: 'text', isEphemeral: isEphemeral, duration: isEphemeral ? (5 * 60 * 1000) : null, readBy: [currentFirebaseUid] };
    try {
      const messagesColRef = collection(db, 'conversations', activeConversationId, 'messages');
      await addDoc(messagesColRef, messagePayload);
      const convRef = doc(db, 'conversations', activeConversationId);
      await updateDoc(convRef, { lastMessage: newMessage.trim(), lastMessageTime: serverTimestamp() });
      setNewMessage('');
    } catch (e) { console.error("Erreur lors de l'envoi du message : ", e); alert(t('send_message_failed', "Échec de l'envoi du message. Vérifiez la console pour plus de détails.")); }
  }, [newMessage, activeConversationId, currentFirebaseUid, t, user, handleLoginPrompt, setNewMessage, db]);

  const handleFileUpload = useCallback(async (event, isEphemeral = false) => {
    if (!user) { handleLoginPrompt(); return; }
    if (!activeConversationId || !currentFirebaseUid) { alert(t('select_conv_and_login', "Veuillez sélectionner une conversation et être connecté.")); return; }
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) { alert(t('unsupported_file_type', "Seules les images (PNG, JPEG, GIF) et les PDF sont autorisés pour le moment.")); event.target.value = null; return; }

    setNewMessage(t('uploading_file', 'Téléchargement du fichier...'));
    try {
      const storageFileRef = ref(storage, `chat_files/${activeConversationId}/${currentFirebaseUid}/${file.name}_${Date.now()}`);
      const snapshot = await uploadBytes(storageFileRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);
      const messagePayload = { content: file.name, senderUid: currentFirebaseUid, timestamp: serverTimestamp(), type: file.type.startsWith('image/') ? 'image' : 'file', fileURL: fileURL, isEphemeral: isEphemeral, duration: isEphemeral ? (5 * 60 * 1000) : null, readBy: [currentFirebaseUid] };
      const messagesColRef = collection(db, 'conversations', activeConversationId, 'messages');
      await addDoc(messagesColRef, messagePayload);
      const convRef = doc(db, 'conversations', activeConversationId);
      await updateDoc(convRef, { lastMessage: `Fichier: ${file.name}`, lastMessageTime: serverTimestamp() });
      setNewMessage(''); event.target.value = null;
    } catch (e) { console.error("Erreur lors du téléchargement du fichier : ", e); alert(t('upload_file_failed', "Échec du téléchargement du fichier. Vérifiez la console.")); setNewMessage(''); event.target.value = null; }
  }, [activeConversationId, currentFirebaseUid, t, user, handleLoginPrompt, setNewMessage, db, storage]);

  const handleEmoticonClick = useCallback((emoji) => { setNewMessage(prev => prev + emoji); }, [setNewMessage]);
  const handleSendNormalMessage = useCallback(() => { handleSendMessage(false); }, [handleSendMessage]);
  const handleSendEphemeralMessage = useCallback(() => { handleSendMessage(true); }, [handleSendMessage]);
  const handleAttachNormalFile = useCallback(() => { if (!user) { handleLoginPrompt(); return; } if (fileInputRef.current) { fileInputRef.current.onchange = (e) => handleFileUpload(e, false); fileInputRef.current.click(); } }, [fileInputRef, handleFileUpload, handleLoginPrompt, user]);
  const handleAttachEphemeralFile = useCallback(() => { if (!user) { handleLoginPrompt(); return; } if (fileInputRef.current) { fileInputRef.current.onchange = (e) => handleFileUpload(e, true); fileInputRef.current.click(); } }, [fileInputRef, handleFileUpload, handleLoginPrompt, user]);
  const openEphemeralImagePreview = useCallback(async (fileURL, messageId) => { setEphemeralImagePreview({ url: fileURL, messageId: messageId }); }, [setEphemeralImagePreview]);
  const closeEphemeralImagePreview = useCallback(() => { setEphemeralImagePreview(null); }, [setEphemeralImagePreview]);

  return {
    handleSendMessage,
    handleFileUpload,
    handleEmoticonClick,
    handleSendNormalMessage,
    handleSendEphemeralMessage,
    handleAttachNormalFile,
    handleAttachEphemeralFile,
    openEphemeralImagePreview,
    closeEphemeralImagePreview
  };
};

export default useChatActions;