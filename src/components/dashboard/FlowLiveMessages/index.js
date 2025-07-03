// src/components/dashboard/FlowLiveMessages/index.js
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
// import { initialMockData } from '../../../lib/mockData'; // Non utilisé directement ici
import { db, auth, storage } from '../../../lib/firebase';
// AJOUT DE addDoc manquant
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp, arrayUnion, writeBatch, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { format, isToday, isYesterday, isSameWeek, isSameDay, isSameYear, parseISO, isValid /* subDays n'est pas utilisé */ } from 'date-fns';
import { fr } from 'date-fns/locale';

// IMPORTS CORRIGÉS DES COMPOSANTS ENFANTS :
import FlowLiveMessagesSidebar from './FlowLiveMessagesSidebar';
import FlowLiveMessagesDisplay from './FlowLiveMessagesDisplay';
import FlowLiveMessagesInput from './FlowLiveMessagesInput';
import NewDiscussionModal from './modals/NewDiscussionModal';
// import { AssignTaskProjectDeadlineModal } from '../modals/modals'; // N'est pas utilisé directement dans ce fichier, mais par la prop onOpenAddTaskFromChat

// Définir la liste complète des emojis dans une constante
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
    // Stocker l'objet complet du partenaire ou du groupe actif
    const [activeConversationInfo, setActiveConversationInfo] = useState({
        partner: null, // Pour les conversations 1-1
        isGroup: false,
        participants: [],
        name: ''
    });

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]); // Garde cette state pour la recherche
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
            // Quand on quitte le plein écran sur mobile, on cache la sidebar si elle était visible
            if (!document.fullscreenElement && window.innerWidth < 768) {
                setShowMobileSidebar(false);
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
        // Utilise la locale courante de i18n
        const currentLocale = i18n.language === 'fr' ? fr : undefined; // Ajoutez d'autres locales si nécessaire

        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return t('yesterday', 'Hier') + format(date, ' HH:mm');
        if (isSameWeek(date, new Date())) return format(date, 'EEEE HH:mm', { locale: currentLocale });
        if (isSameYear(date, new Date())) return format(date, 'dd MMMM', { locale: currentLocale });
        return format(date, 'dd/MM/yyyy');
    }, [t, i18n.language]);

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
                let participantsDetails = []; // Pour stocker les objets participants complets

                if (data.participants && data.participants.length > 0) {
                    const participantUids = data.participants;

                    // Fetch details for all participants
                    const userDetailsPromises = participantUids.map(uid =>
                        getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
                            .then(snap => snap.docs[0]?.data() || { uid: uid, displayName: t('unknown_user', 'Utilisateur'), photoURL: '/images/default-avatar.png' })
                    );
                    participantsDetails = await Promise.all(userDetailsPromises);

                    if (data.participants.length > 2 || (data.participants.length === 2 && !data.participants.includes(currentFirebaseUid))) {
                        isGroup = true;
                        if (!data.name) {
                            const otherParticipants = participantsDetails.filter(p => p.uid !== currentFirebaseUid);
                            const participantNames = otherParticipants.map(p => p.displayName).filter(name => name);
                            displayName = t('group_with', 'Groupe avec') + ` ${participantNames.join(', ')}`;
                        }
                    } else if (data.participants.length === 2 && data.participants.includes(currentFirebaseUid)) {
                        const partnerDetail = participantsDetails.find(p => p.uid !== currentFirebaseUid);
                        if (partnerDetail) {
                            displayName = partnerDetail.displayName || t('unknown_user', 'Utilisateur');
                            photoURL = partnerDetail.photoURL || '/images/default-avatar.png';
                        }
                    } else if (data.participants.length === 1 && data.participants.includes(currentFirebaseUid)) {
                        displayName = t('guest_you', 'TOI');
                        photoURL = user?.photoURL || '/images/default-avatar.png';
                    }
                }

                const unreadCount = (data.lastMessageReadBy || []).includes(currentFirebaseUid) ? 0 : 1; // Simplified unread logic

                return {
                    id: d.id,
                    ...data,
                    name: displayName,
                    photoURL: photoURL,
                    isGroup: isGroup,
                    unread: unreadCount,
                    initials: displayName.charAt(0).toUpperCase(),
                    participantsDetails: participantsDetails // Ajoutez les détails des participants
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
                const senderName = (data.senderUid === currentFirebaseUid)
                    ? currentUserName
                    : (activeConversationInfo.participants.find(p => p.uid === data.senderUid)?.displayName || t('unknown_user', 'Utilisateur'));

                return {
                    id: d.id,
                    ...data,
                    displayTime: formatMessageTimeDisplay(data.timestamp),
                    status: (data.readBy || []).includes(currentFirebaseUid) ? 'read' : 'sent',
                    from: senderName // Utilise le nom du participant trouvé
                };
            });
            setMessages(newMessages);
            const unreadMessageIds = snapshot.docs.filter(d => !(d.data().readBy || []).includes(currentFirebaseUid)).map(d => d.id);
            if (unreadMessageIds.length > 0) {
                markMessagesAsRead(activeConversationId, unreadMessageIds);
            }
        });

        return () => unsubscribe();
    }, [activeConversationId, currentFirebaseUid, currentUserName, formatMessageTimeDisplay, markMessagesAsRead, t, db, activeConversationInfo.participants]);

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

    // Synchronisation des membres d'équipe disponibles (pour NewDiscussionModal et assignTask)
    useEffect(() => {
        if (availableTeamMembers && availableTeamMembers.length > 0) {
            setInternalAvailableTeamMembers(availableTeamMembers);
        } else if (!user || user.uid === 'guest_noca_flow') {
            // En mode invité, utilisez des mock data si aucune n'est fournie via props
            setInternalAvailableTeamMembers(initialMockData.staffMembers || []);
        } else {
            // Pour les utilisateurs connectés sans teamMembers (si non géré par une API réelle)
            setInternalAvailableTeamMembers([]);
        }
    }, [availableTeamMembers, user]);


    // Hooks d'action de chat
    const handleSendMessage = useCallback(async (isEphemeral = false) => {
        if (!user) { handleLoginPrompt(); return; }
        if (newMessage.trim() === '' || !activeConversationId || !currentFirebaseUid) {
            if (!activeConversationId) alert(t('select_or_create_conversation', "Veuillez sélectionner une conversation ou en créer une nouvelle."));
            return;
        }
        const messagePayload = { content: newMessage.trim(), senderUid: currentFirebaseUid, timestamp: serverTimestamp(), type: 'text', isEphemeral: isEphemeral, duration: isEphemeral ? (5 * 60 * 1000) : null, readBy: [currentFirebaseUid] };
        try {
            const messagesColRef = collection(db, 'conversations', activeConversationId, 'messages');
            await addDoc(messagesColRef, messagePayload); // Correction: addDoc était manquant
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
            await addDoc(messagesColRef, messagePayload); // Correction: addDoc était manquant
            const convRef = doc(db, 'conversations', activeConversationId);
            await updateDoc(convRef, { lastMessage: `Fichier: ${file.name}`, lastMessageTime: serverTimestamp() });
            setNewMessage(''); event.target.value = null;
        } catch (e) { console.error("Erreur lors du téléchargement du fichier : ", e); alert(t('upload_file_failed', "Échec du téléchargement du fichier. Vérifiez la console.")); setNewMessage(''); event.target.value = null; }
    }, [activeConversationId, currentFirebaseUid, t, user, handleLoginPrompt, db, storage]);

    const handleEmoticonClick = useCallback((emoji) => { setNewMessage(prev => prev + emoji); }, []);
    const handleSendNormalMessage = useCallback(() => { handleSendMessage(false); }, [handleSendMessage]);
    const handleSendEphemeralMessage = useCallback(() => { handleSendMessage(true); }, [handleSendMessage]);
    const handleAttachNormalFile = useCallback(() => { if (!user) { handleLoginPrompt(); return; } if (fileInputRef.current) { fileInputRef.current.onchange = (e) => handleFileUpload(e, false); fileInputRef.current.click(); } }, [fileInputRef, handleFileUpload, handleLoginPrompt, user]);
    const handleAttachEphemeralFile = useCallback(() => { if (!user) { handleLoginPrompt(); return; } if (fileInputRef.current) { fileInputRef.current.onchange = (e) => handleFileUpload(e, true); fileInputRef.current.click(); } }, [fileInputRef, handleFileUpload, handleLoginPrompt, user]);
    const openEphemeralImagePreview = useCallback(async (fileURL, messageId) => { setEphemeralImagePreview({ url: fileURL, messageId: messageId }); }, [setEphemeralImagePreview]);
    const closeEphemeralImagePreview = useCallback(() => { setEphemeralImagePreview(null); }, []);


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
            // Ajouter le nouveau contact à internalAvailableTeamMembers pour qu'il soit disponible dans la liste
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

        // Vérifier si une conversation avec exactement les mêmes participants existe déjà
        const existingConvsQuery = query(collection(db, 'conversations'), where('participants', '==', sortedParticipantUids));
        const existingConvsSnapshot = await getDocs(existingConvsQuery);

        if (!existingConvsSnapshot.empty) {
            const existingConvData = existingConvsSnapshot.docs[0].data();
            const existingConvId = existingConvsSnapshot.docs[0].id;
            setActiveConversationId(existingConvId);
            setActiveConversationInfo({
                partner: existingConvData.participantsDetails?.find(p => p.uid !== currentFirebaseUid) || null,
                isGroup: existingConvData.participants.length > 2,
                participants: existingConvData.participantsDetails || [],
                name: existingConvData.name || t('existing_conversation', 'Conversation Existante')
            });
            setShowNewDiscussionModal(false);
            console.log("Existing conversation found:", existingConvId);
            return;
        }

        // Déterminer le nom de la conversation si non fourni
        if (!conversationName && sortedParticipantUids.length <= 2) { // 1-1 chat
            const otherParticipantUid = sortedParticipantUids.find(uid => uid !== currentFirebaseUid);
            if (otherParticipantUid) {
                const partnerDocSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', otherParticipantUid)));
                conversationName = partnerDocSnap.docs[0]?.data()?.displayName || t('new_conversation_default', 'Nouvelle Conversation');
            } else { // Self-chat (if allowed)
                conversationName = t('new_conversation_default', 'Nouvelle Conversation');
            }
        } else if (!conversationName && sortedParticipantUids.length > 2) { // Group chat
             conversationName = t('new_group', 'Nouveau Groupe');
        }

        try {
            // Récupérer les détails complets des participants pour la nouvelle conversation
            const allParticipantsDetailsPromises = sortedParticipantUids.map(uid =>
                getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
                    .then(snap => snap.docs[0]?.data() || { uid: uid, displayName: t('unknown_user', 'Utilisateur'), photoURL: '/images/default-avatar.png' })
            );
            const allParticipantsDetails = await Promise.all(allParticipantsDetailsPromises);


            const newConvRef = await addDoc(collection(db, 'conversations'), {
                participants: sortedParticipantUids,
                participantsDetails: allParticipantsDetails, // Sauvegarder les détails pour un accès plus facile
                createdAt: serverTimestamp(),
                lastMessage: t('conversation_start_message', 'Début de la conversation'),
                lastMessageTime: serverTimestamp(),
                name: conversationName,
                isGroup: sortedParticipantUids.length > 2,
                lastMessageReadBy: [currentFirebaseUid]
            });
            setActiveConversationId(newConvRef.id);
            setActiveConversationInfo({
                partner: allParticipantsDetails.find(p => p.uid !== currentFirebaseUid) || null,
                isGroup: sortedParticipantUids.length > 2,
                participants: allParticipantsDetails,
                name: conversationName
            });
            setShowNewDiscussionModal(false);
            console.log("New conversation created:", newConvRef.id);
        } catch (error) {
            console.error("Error creating new discussion:", error);
            alert(t('create_discussion_failed', 'Échec de la création de la discussion. Vérifiez les règles de sécurité Firestore et la console.'));
        }
    }, [currentFirebaseUid, user, t, db]);

    // Gérer la sélection d'une conversation depuis la sidebar
    const handleSelectConversation = useCallback((conv) => {
        setActiveConversationId(conv.id);
        setActiveConversationInfo({
            partner: conv.participantsDetails?.find(p => p.uid !== currentFirebaseUid) || null,
            isGroup: conv.isGroup,
            participants: conv.participantsDetails || [],
            name: conv.name
        });
        if (window.innerWidth < 768) {
            setShowMobileSidebar(false); // Cache la sidebar sur mobile après sélection
        }
    }, [currentFirebaseUid]);


    return (
        <div ref={containerRef} className={`flex h-full rounded-lg overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-color-bg-primary' : ''}`}>
            {isGuestMode && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 text-white text-center p-4">
                    <p className="text-xl font-semibold mb-4">{t('access_restricted', 'Accès Restreint.')}</p>
                    <p className="mb-6">{t('login_to_access_messages', 'Veuillez vous connecter pour accéder à la messagerie en temps réel.')}</p>
                    <div className="flex gap-4">
                        <button onClick={onLoginClick} className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors">
                            {t('login', 'Connexion')}
                        </button>
                        <button onClick={onRegisterClick} className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors">
                            {t('register', 'Inscription')}
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar (liste des conversations) */}
            <FlowLiveMessagesSidebar
                conversations={conversations}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeConversationId={activeConversationId}
                handleSelectConversation={handleSelectConversation} // Utilisez la fonction unifiée
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
                        {/* Bouton de retour visible uniquement sur les petits écrans quand la sidebar est cachée */}
                        {!showMobileSidebar && (
                            <button className={`p-2 rounded-full mr-2 md:hidden ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`} onClick={() => setShowMobileSidebar(true)} aria-label={t('back_to_conversations', 'Retour aux conversations')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                        )}
                        <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-color-text-primary mr-2">
                                {activeConversationInfo.name || (activeConversationInfo.isGroup ? t('group_chat_default', 'Discussion de groupe') : activeConversationInfo.partner?.displayName || t('new_conversation_default', 'Nouvelle Conversation'))}
                            </h3>
                            {activeConversationInfo.isGroup && <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>{t('group', 'Groupe')}</span>}
                            {/* Optionnel: Indicateur Chiffré si applicable */}
                            {/* <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 ml-2">{t('encrypted', 'Chiffré')}</span> */}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Boutons d'action pour le chat */}
                            <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`} title={t('meeting', 'Meeting')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 12h20"/></svg>
                            </button>
                            <button
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`}
                                title={t('task', 'Tâche')}
                                onClick={() => onOpenAddTaskFromChat({
                                    member: activeConversationInfo.isGroup ? null : activeConversationInfo.partner, // Si c'est un groupe, pas de 'member' unique
                                    conversationParticipants: activeConversationInfo.participants,
                                    currentFirebaseUid,
                                    currentUserName,
                                    isFromChat: true
                                })}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                            </button>
                            <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`} title={t('rename_contact', 'Renommer le contact')}>
                                {/* Icône temporaire, à remplacer par une icône de renommage */}
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
                    messages={filteredMessages}
                    chatPanelRef={chatPanelRef}
                    currentFirebaseUid={currentFirebaseUid}
                    activeConversationId={activeConversationId}
                    activeConversationInfo={activeConversationInfo} 
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
                    activeConversationId={activeConversationId} // S'assure que l'input est désactivé si pas de conversation
                    isGuestMode={isGuestMode} // S'assure que l'input est désactivé en mode invité
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