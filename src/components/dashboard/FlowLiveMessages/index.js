// src/components/dashboard/FlowLiveMessages/index.js
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { initialMockData } from '../../../lib/mockData';
import { db, auth, storage } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp, arrayUnion, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { format, isToday, isYesterday, isSameWeek, isSameDay, isSameYear, parseISO, isValid, differenceInMinutes, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// IMPORTS DES COMPOSANTS ENFANTS :
import FlowLiveMessagesSidebar from './FlowLiveMessagesSidebar';
import FlowLiveMessagesDisplay from './FlowLiveMessagesDisplay';
import FlowLiveMessagesInput from './FlowLiveMessagesInput';
import NewDiscussionModal from './modals/NewDiscussionModal';
import { AssignTaskProjectDeadlineModal } from '../modals/modals'; 

// Définir la liste complète des emojis dans une constante pour éviter la duplication de prop
const ALL_EMOJIS = [
    '👋', '😀', '🔥', '🚀', '💡', '✅', '✨', '👍', '🎉', '🌟', '💫', '💥', '🚀', '🌈', '☀️', '🌻', '🌺', '🌲', '🌳', '🍂', '🍁', '🍓', '🍋', '🍎', '🍔', '🍕', '🌮', '🍩', '🍦', '☕', '🍵', '🥂', '🍾', '🎉', '🎁', '🎈', '🎂', '🥳', '🏠', '🏢', '💡', '⏰', '📆', '📈', '📊', '🔗', '🔒', '🔑', '📝', '📌', '📎', '📁', '📄', '📊', '📈', '📉', '💰', '💳', '💵', '💸', '📧', '📞', '💬', '🔔', '📣', '💡', '⚙️', '🔨', '🛠️', '💻', '🖥️', '📱', '⌨️', '🖱️', '🖨️', '💾', '💿', '📀', '📚', '📖', '🖊️', '🖌️', '✏️', '🖍️', '📏', '📐', '✂️', '🗑️', '🔒', '🔑', '🛡️', '⚙️', '🔗', '📎', '📌', '📍', '📁', '📂', '🗂️', '🗓️', '📅', '📆', '⏰', '⏱️', '⌛', '⏳'
];

// Définir le composant principal FlowLiveMessages
const FlowLiveMessages = forwardRef(({ onLoginClick, onRegisterClick, onOpenAddTaskFromChat, availableTeamMembers }, ref) => {
    const { currentUser: user } = useAuth();
    const { isDarkMode } = useTheme();
    const { t, i18n } = useTranslation('common');

    const isGuestMode = !user || user.uid === 'guest_noca_flow';
    const currentFirebaseUid = user?.uid || (isGuestMode ? 'guest_noca_flow' : null);
    const currentUserName = user?.displayName || (isGuestMode ? t('guest_user_default', 'Visiteur Curieux') : 'Moi');

    const [activeConversationId, setActiveConversationId] = useState(null);
    const [activeConversationPartner, setActiveConversationPartner] = useState(null);
    const [activeConversationIsGroup, setActiveConversationIsGroup] = useState(false);
    const [activeConversationParticipants, setActiveConversationParticipants] = useState([]);
    const [activeConversationName, setActiveConversationName] = useState('');

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
    const [ephemeralImagePreview, setEphemeralImagePreview] = useState(null);
    const [internalAvailableTeamMembers, setInternalAvailableTeamMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const chatPanelRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const containerRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useImperativeHandle(ref, () => ({
        toggleFullScreen: () => {
            if (containerRef.current) {
                if (!document.fullscreenElement) {
                    containerRef.current.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                    });
                } else {
                    document.exitFullscreen();
                }
            }
        }
    }));

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
            if (!document.fullscreenElement) {
                if (window.innerWidth < 768) {
                    setShowMobileSidebar(false);
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const handleLoginPrompt = useCallback(() => {
        alert(t('access_restricted', 'Accès Restreint. Veuillez vous connecter pour accéder à la messagerie en temps réel.'));
        onLoginClick && onLoginClick();
    }, [t, onLoginClick]);

    const formatMessageTimeDisplay = useCallback((timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return t('yesterday', 'Hier') + format(date, ' HH:mm');
        if (isSameWeek(date, new Date())) return format(date, 'EEEE HH:mm', { locale: fr });
        if (isSameYear(date, new Date())) return format(date, 'dd MMMM', { locale: fr });
        return format(date, 'dd/MM/yyyy');
    }, [t]);

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
        if (!currentFirebaseUid) {
            setConversations([]);
            return;
        }

        const q = query(collection(db, 'conversations'), orderBy('lastMessageTime', 'desc'));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const convs = await Promise.all(snapshot.docs.map(async d => {
                const data = d.data();
                let displayName = data.name || t('new_conversation_default', 'Nouvelle Conversation');
                let photoURL = '';
                let isGroup = false;

                if (data.participants && data.participants.length > 0) {
                    if (data.participants.length > 2 || (data.participants.length === 2 && !data.participants.includes(currentFirebaseUid))) {
                        isGroup = true;
                        if (!data.name) {
                            const otherParticipantsUids = data.participants.filter(uid => uid !== currentFirebaseUid);
                            const userDocs = await Promise.all(otherParticipantsUids.map(uid => getDocs(query(collection(db, 'users'), where('uid', '==', uid)))));
                            const participantNames = userDocs.map(snap => snap.docs[0]?.data()?.displayName || t('unknown_user', 'Utilisateur')).filter(name => name);
                            displayName = data.name || t('group_with', 'Groupe avec') + ` ${participantNames.join(', ')}`;
                        }
                    } else if (data.participants.length === 2 && data.participants.includes(currentFirebaseUid)) {
                        const partnerUid = data.participants.find(uid => uid !== currentFirebaseUid);
                        if (partnerUid) {
                            const partnerDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', partnerUid)));
                            displayName = partnerDoc.docs[0]?.data()?.displayName || t('unknown_user', 'Utilisateur');
                            photoURL = partnerDoc.docs[0]?.data()?.photoURL || '/images/default-avatar.png';
                        }
                    } else if (data.participants.length === 1 && data.participants.includes(currentFirebaseUid)) {
                        displayName = t('guest_you', 'TOI');
                        photoURL = user?.photoURL || '/images/default-avatar.png';
                    }
                }

                const unreadCount = (data.lastMessageReadBy || []).includes(currentFirebaseUid) ? 0 : 1;

                return {
                    id: d.id,
                    ...data,
                    name: displayName,
                    photoURL: photoURL,
                    isGroup: isGroup,
                    unread: unreadCount,
                    initials: displayName.charAt(0).toUpperCase()
                };
            }));
            setConversations(convs.sort((a,b) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0)));
        });

        return () => unsubscribe();
    }, [currentFirebaseUid, user, t, db]);

    useEffect(() => {
        if (!activeConversationId) {
            setMessages([]);
            return;
        }

        const messagesColRef = collection(db, 'conversations', activeConversationId, 'messages');
        const q = query(messagesColRef, orderBy('timestamp'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    displayTime: formatMessageTimeDisplay(data.timestamp),
                    status: (data.readBy || []).includes(currentFirebaseUid) ? 'read' : 'sent',
                    from: (data.senderUid === currentFirebaseUid ? currentUserName : (availableTeamMembers.find(m => m.firebaseUid === data.senderUid)?.name || t('unknown_user', 'Utilisateur')))
                };
            });
            setMessages(newMessages);
            const unreadMessageIds = snapshot.docs.filter(d => !(d.data().readBy || []).includes(currentFirebaseUid)).map(d => d.id);
            if (unreadMessageIds.length > 0) {
                markMessagesAsRead(activeConversationId, unreadMessageIds);
            }
        });

        return () => unsubscribe();
    }, [activeConversationId, currentFirebaseUid, availableTeamMembers, currentUserName, formatMessageTimeDisplay, markMessagesAsRead, t, db]);

    useEffect(() => {
        if (chatPanelRef.current) {
            chatPanelRef.current.scrollTop = chatPanelRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        setFilteredMessages(messages.filter(msg =>
            msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    }, [searchTerm, messages]);

    // Hooks d'action de chat (simplifiés pour le mock)
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
    }, [newMessage, activeConversationId, currentFirebaseUid, t, user, handleLoginPrompt, db]);

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
    }, [activeConversationId, currentFirebaseUid, t, user, handleLoginPrompt, db, storage]);

    const handleEmoticonClick = useCallback((emoji) => { setNewMessage(prev => prev + emoji); }, [setNewMessage]);
    const handleSendNormalMessage = useCallback(() => { handleSendMessage(false); }, [handleSendMessage]);
    const handleSendEphemeralMessage = useCallback(() => { handleSendMessage(true); }, [handleSendMessage]);
    const handleAttachNormalFile = useCallback(() => { if (!user) { handleLoginPrompt(); return; } if (fileInputRef.current) { fileInputRef.current.onchange = (e) => handleFileUpload(e, false); fileInputRef.current.click(); } }, [fileInputRef, handleFileUpload, handleLoginPrompt, user]);
    const handleAttachEphemeralFile = useCallback(() => { if (!user) { handleLoginPrompt(); return; } if (fileInputRef.current) { fileInputRef.current.onchange = (e) => handleFileUpload(e, true); fileInputRef.current.click(); } }, [fileInputRef, handleFileUpload, handleLoginPrompt, user]);
    const openEphemeralImagePreview = useCallback(async (fileURL, messageId) => { setEphemeralImagePreview({ url: fileURL, messageId: messageId }); }, [setEphemeralImagePreview]);
    const closeEphemeralImagePreview = useCallback(() => { setEphemeralImagePreview(null); }, [setEphemeralImagePreview]);


    // --- Logique de création de nouvelle discussion ---
    const handleCreateNewDiscussion = useCallback(async ({ name, email, selectedUids, showNewContact }) => {
        if (!user) {
            alert(t('login_to_create_discussion', 'Veuillez vous connecter pour créer une discussion.'));
            return;
        }

        let participantUids = new Set([currentFirebaseUid]);
        if (showNewContact) {
            if (!name || !email) {
                alert(t('enter_contact_details', 'Veuillez entrer le nom et l\'email du nouveau contact.'));
                return;
            }
            console.log(`Simulating invitation to new contact: ${name} (${email})`);

            const newContactUid = `simulated-uid-${Date.now()}`;
            participantUids.add(newContactUid);
            setInternalAvailableTeamMembers(prev => [...prev, { firebaseUid: newContactUid, name: name, email: email, initials: name.charAt(0).toUpperCase(), color: 'bg-' + ['yellow', 'green', 'blue', 'red', 'purple'][Math.floor(Math.random() * 5)] + '-500' }]);

        } else {
            if (selectedUids.length === 0) {
                alert(t('select_members_or_add_contact', 'Veuillez sélectionner au moins un membre de l\'équipe ou ajouter un nouveau contact.'));
                return;
            }
            selectedUids.forEach(uid => participantUids.add(uid));
        }

        const sortedParticipantUids = Array.from(participantUids).sort();
        let conversationName = name.trim();

        const existingConvsQuery = query(collection(db, 'conversations'), where('participants', '==', sortedParticipantUids));
        const existingConvsSnapshot = await getDocs(existingConvsQuery);

        if (!existingConvsSnapshot.empty) {
            const existingConv = existingConvsSnapshot.docs[0];
            setActiveConversationId(existingConv.id);
            setActiveConversationName(existingConv.data().name || t('existing_conversation', 'Conversation Existante'));
            setActiveConversationIsGroup(existingConv.data().participants.length > 2);
            setActiveConversationParticipants(existingConv.data().participants);
            setActiveConversationPartner(existingConv.data().participants.find(uid => uid !== currentFirebaseUid) || null);
            setShowNewDiscussionModal(false);
            console.log("Existing conversation found:", existingConv.id);
            return;
        }

        if (!conversationName && participantUids.size <= 2) {
            const otherParticipantsUids = Array.from(participantUids).filter(uid => uid !== currentFirebaseUid);
            if (otherParticipantsUids.length > 0) {
                const partnerDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', otherParticipantsUids[0])));
                conversationName = partnerDoc.docs[0]?.data()?.displayName || t('new_conversation_default', 'Nouvelle Conversation');
            } else {
                conversationName = t('new_conversation_default', 'Nouvelle Conversation');
            }
        } else if (!conversationName && participantUids.size > 2) {
             conversationName = t('new_group', 'Nouveau Groupe');
        }

        try {
            const newConvRef = await addDoc(collection(db, 'conversations'), {
                participants: sortedParticipantUids,
                createdAt: serverTimestamp(),
                lastMessage: t('conversation_start_message', 'Début de la conversation'),
                lastMessageTime: serverTimestamp(),
                name: conversationName,
                isGroup: participantUids.size > 2,
                lastMessageReadBy: [currentFirebaseUid]
            });
            setActiveConversationId(newConvRef.id);
            setActiveConversationName(conversationName);
            setActiveConversationIsGroup(participantUids.size > 2);
            setActiveConversationParticipants(sortedParticipantUids);
            setActiveConversationPartner(sortedParticipantUids.find(uid => uid !== currentFirebaseUid) || null);
            setShowNewDiscussionModal(false);
            console.log("New conversation created:", newConvRef.id);
        } catch (error) {
            console.error("Error creating new discussion:", error);
            alert(t('create_discussion_failed', 'Échec de la création de la discussion. Vérifiez les règles de sécurité Firestore et la console.'));
        }
    }, [currentFirebaseUid, user, t, db]);

    return (
        <div ref={containerRef} className={`flex h-full rounded-lg overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-color-bg-primary' : ''}`}>
            {isGuestMode && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40 text-white text-center p-4"><p className="text-xl font-semibold">{t('access_restricted', 'Accès Restreint.')} {t('login_to_access_messages', 'Veuillez vous connecter pour accéder à la messagerie en temps réel.')}</p></div>}

            {/* Sidebar (liste des conversations) */}
            <FlowLiveMessagesSidebar
                conversations={conversations}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeConversationId={activeConversationId}
                handleSelectUserOnMobile={(conv) => { setActiveConversationId(conv.id); setActiveConversationPartner(conv.participants.find(uid => uid !== currentFirebaseUid)); setActiveConversationIsGroup(conv.isGroup); setActiveConversationParticipants(conv.participants); setActiveConversationName(conv.name); setShowMobileSidebar(false); }}
                setShowNewDiscussionModal={setShowNewDiscussionModal}
                currentUserName={currentUserName}
                showMobileSidebar={showMobileSidebar}
                setShowMobileSidebar={setShowMobileSidebar}
                isFullScreen={isFullScreen}
                t={t}
                isDarkMode={isDarkMode}
            />

            {/* Chat Panel (messages et input) */}
            <div className={`flex flex-col flex-1 ${showMobileSidebar ? 'hidden md:flex' : 'flex'}`}>
                {activeConversationId ? (
                    <div className={`px-4 py-3 border-b border-color-border-primary flex-shrink-0 flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'}`}>
                        {window.innerWidth < 768 && (
                            <button className={`p-2 rounded-full mr-2 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`} onClick={() => setShowMobileSidebar(true)} aria-label={t('back_to_conversations', 'Retour aux conversations')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                        )}
                        <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-color-text-primary mr-2">
                                {activeConversationName || (activeConversationIsGroup ? t('group_chat_default', 'Discussion de groupe') : activeConversationPartner?.name || t('new_conversation_default', 'Nouvelle Conversation'))}
                            </h3>
                            {activeConversationIsGroup && <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>{t('group', 'Groupe')}</span>}
                            {/* Optionnel: Indicateur Chiffré si applicable */}
                            {/* <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 ml-2">{t('encrypted', 'Chiffré')}</span> */}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Boutons d'action pour le chat */}
                            <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`} title={t('meeting', 'Meeting')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 12h20"/></svg>
                            </button>
                            <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`} title={t('task', 'Tâche')} onClick={() => onOpenAddTaskFromChat({ member: activeConversationPartner, conversationParticipants, currentFirebaseUid, currentUserName, isFromChat: true })}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                            </button>
                            <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`} title={t('rename_contact', 'Renommer le contact')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                            </button>
                            <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-red-400 hover:text-white' : 'hover:bg-red-100 text-red-500 hover:text-red-600'}`} title={t('block_contact', 'Bloquer le contact')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`px-4 py-3 border-b border-color-border-primary flex-shrink-0 flex items-center justify-center text-center ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary text-color-text-secondary'}`}>
                        <h3 className="text-lg font-semibold">{t('select_conversation', 'Sélectionnez une conversation pour commencer.')}</h3>
                    </div>
                )}

                {/* Zone d'affichage des messages */}
                <FlowLiveMessagesDisplay
                    messages={messages}
                    chatPanelRef={chatPanelRef}
                    currentFirebaseUid={currentFirebaseUid}
                    activeConversationId={activeConversationId}
                    activeConversationIsGroup={activeConversationIsGroup}
                    openEphemeralImagePreview={openEphemeralImagePreview}
                    t={t}
                    isDarkMode={isDarkMode}
                />

                {/* Champ de saisie des messages */}
                <FlowLiveMessagesInput
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendNormalMessage={handleSendNormalMessage}
                    handleAttachNormalFile={handleAttachNormalFile}
                    handleEmoticonClick={handleEmoticonClick}
                    emojis={ALL_EMOJIS} // Use the predefined constant
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    emojiButtonRef={emojiButtonRef}
                    fileInputRef={fileInputRef} // Pass forwardRef for file input
                    isDarkMode={isDarkMode}
                    t={t}
                />
            </div>

            {/* Modale de création/sélection de discussion */}
            <AnimatePresence>
                {showNewDiscussionModal && (
                    <NewDiscussionModal
                        showModal={showNewDiscussionModal}
                        onClose={() => setShowNewDiscussionModal(false)}
                        onCreate={handleCreateNewDiscussion}
                        internalAvailableTeamMembers={internalAvailableTeamMembers}
                        currentFirebaseUid={currentFirebaseUid}
                        currentUserName={currentUserName}
                        t={t}
                    />
                )}
            </AnimatePresence>
             {/* Modale pour afficher l'image éphémère en grand */}
            <AnimatePresence>
                {ephemeralImagePreview && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[101]" onClick={closeEphemeralImagePreview}>
                        <div className="relative p-4 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <img src={ephemeralImagePreview.url} alt={t('ephemeral_image_warning', 'Cette image est éphémère et ne peut pas être sauvegardée.')} className="max-w-full max-h-[80vh] object-contain" />
                            <button onClick={closeEphemeralImagePreview} className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors" title={t('close_ephemeral_image', 'Fermer l\'image éphémère')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            <p className="text-white text-center text-sm mt-2">{t('ephemeral_image_warning', 'Cette image est éphémère et ne peut pas être sauvegardée.')}</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
});

// N'oubliez pas d'exporter le composant principal FlowLiveMessages
FlowLiveMessages.displayName = 'FlowLiveMessages'; // Ajouté pour React.forwardRef

export default FlowLiveMessages;