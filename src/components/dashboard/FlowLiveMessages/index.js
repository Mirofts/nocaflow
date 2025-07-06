// src/components/dashboard/FlowLiveMessages/index.js
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
// import { initialMockData } from '../../../lib/mockData'; // Déjà géré via les props
import { db, auth, storage } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp, arrayUnion, writeBatch, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { format, isToday, isYesterday, isSameWeek, isSameDay, isSameYear, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// IMPORTS CORRIGÉS DES COMPOSANTS ENFANTS :
import FlowLiveMessagesSidebar from './FlowLiveMessagesSidebar';
import FlowLiveMessagesDisplay from './FlowLiveMessagesDisplay';
import FlowLiveMessagesInput from './FlowLiveMessagesInput';
import NewDiscussionModal from './modals/NewDiscussionModal'; // Chemin confirmé (pointent vers le sous-dossier 'modals')

// IMPORTS DES HOOKS : chemins corrigés
import { useFullScreen } from '../../../hooks/useFullScreen'; // <-- Chemin corrigé
import { useChatLogic } from '../../../hooks/useChatLogic'; // <-- Chemin corrigé
import { useChatActions } from '../../../hooks/useChatActions'; // <-- Chemin corrigé


// Définir la liste complète des emojis dans une constante
const ALL_EMOJIS = [
    '👋', '😀', '🔥', '🚀', '💡', '✅', '✨', '👍', '🎉', '🌟', '💫', '💥', '🚀', '🌈', '☀️', '🌻', '🌺', '🌲', '🌳', '🍂', '🍁', '🍓', '🍋', '🍎', '🍔', '🍕', '🌮', '🍩', '🍦', '☕', '🍵', '🥂', '🍾', '🎉', '🎁', '🎈', '🎂', '🥳', '🏠', '🏢', '💡', '⏰', '📆', '📈', '📊', '🔗', '🔒', '🔑', '📝', '📌', '📎', '📁', '📄', '📊', '📈', '📉', '💰', '💳', '💵', '💸', '📧', '📞', '💬', '🔔', '📣', '💡', '⚙️', '🔨', '🛠️', '💻', '🖥️', '📱', '⌨️', '🖱️', '🖨️', '💾', '💿', '📀', '📚', '📖', '🖊️', '🖌️', '✏️', '🖍️', '📏', '📐', '✂️', '🗑️', '🔒', '🔑', '🛡️', '⚙️', '🔗', '📎', '📌', '📍', '📁', '📂', '🗂️', '🗓️', '📅', '📆', '⏰', '⏱️', '⌛', '⏳'
];

// Définir le composant principal FlowLiveMessages
const FlowLiveMessages = forwardRef(({
    onLoginClick,
    onRegisterClick,
    onOpenAddTaskFromChat,
    availableTeamMembers, // Reçu de dashboard.js
    messages: messagesProp, // Renommé pour éviter conflit avec l'état interne
    user, // Reçu de dashboard.js
    initialMockData, // Reçu de dashboard.js (pour compatibilité useChatLogic)
    handleSelectUserOnMobile // Prop passée de dashboard.js
}, ref) => {
    const { currentUser: authUser } = useAuth();
    const { isDarkMode } = useTheme();
    const { t, i18n } = useTranslation('common');

    const currentUser = user || authUser; // Utiliser la prop user si définie, sinon authUser
    const isGuestMode = !currentUser || currentUser.uid === 'guest_noca_flow';
    const currentFirebaseUid = currentUser?.uid || (isGuestMode ? 'guest_noca_flow' : null);
    const currentUserName = currentUser?.displayName || (isGuestMode ? t('guest_user_default', 'Visiteur Curieux') : 'Moi');


    // -------------------------------------------------------------------------
    // RÉACTIVATION DES HOOKS DE GESTION DE CHAT
    // useChatLogic gère la plupart des états relatifs aux conversations et messages filtrés
    const {
        conversations,
        selectedConversationId,
        filteredMessages,
        setSelectedConversationId,
        setConversations,
        setMessages, // setMessages interne du hook
        isNewDiscussionModalOpen,
        setIsNewDiscussionModalOpen,
        newDiscussionModalInitialContact,
        setNewDiscussionModalInitialContact,
        activeSearchQuery,
        setActiveSearchQuery
    } = useChatLogic(currentUser, initialMockData, messagesProp); // Passe messagesProp au hook

    // useChatActions gère les fonctions d'envoi et d'action des messages
    const {
        sendMessage,
        startNewConversation,
        // addMessageToConversation n'est pas exposé ici, car utilisé en interne par sendMessage
        handleMessageAction, // Pour actions comme assigner tâche
        handleFileUpload // Pour l'envoi de fichiers
    } = useChatActions(currentUser, conversations, setConversations, setMessages);


    // --- GESTION DU PLEIN ÉCRAN ---
    const chatContainerRef = useRef(null); // Ref pour le conteneur principal du chat pour le plein écran
    const { isFullScreen, toggleFullScreen } = useFullScreen(chatContainerRef); // Utiliser le hook useFullScreen


    // Exposed to parent component for fullscreen toggle
    useImperativeHandle(ref, () => ({
        toggleFullScreen: toggleFullScreen
    }));

    // Synchronise les messages passés en prop avec l'état interne du hook useChatLogic
    useEffect(() => {
        if (messagesProp) {
            setMessages(messagesProp);
        }
    }, [messagesProp, setMessages]);


    // --- États et refs locaux qui restent dans ce composant ---
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [ephemeralImagePreview, setEphemeralImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const emojiButtonRef = useRef(null);

    // showMobileSidebar est un état local ici, pas dans useChatLogic
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Synchronisation des membres d'équipe disponibles (pour NewDiscussionModal et assignTask)
    // Cette logique peut être simplifiée si initialMockData.staffMembers est toujours passé.
    const internalAvailableTeamMembers = useMemo(() => {
        if (availableTeamMembers && availableTeamMembers.length > 0) {
            return availableTeamMembers;
        } else if (isGuestMode && initialMockData?.staffMembers) { // Accès sécurisé
            return initialMockData.staffMembers;
        }
        return [];
    }, [availableTeamMembers, isGuestMode, initialMockData]);


    // --- Fonctions locales pour l'envoi de messages et gestion de fichiers (si non gérées par useChatActions) ---
    // Si useChatActions gère déjà ces fonctions, ces wrappers ne sont pas nécessaires.
    // L'erreur précédente venait du fait que `addDoc` était directement utilisé,
    // mais dans la version actuelle de useChatActions (qui a évolué),
    // `sendMessage` et `handleFileUpload` y sont gérés.
    // Je vais m'assurer que les appels ici utilisent les fonctions de useChatActions.


    const handleSendNormalMessage = useCallback(async () => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        await sendMessage(newMessage, selectedConversationId, currentFirebaseUid, false);
        setNewMessage('');
    }, [newMessage, selectedConversationId, currentFirebaseUid, sendMessage, handleLoginPrompt]);

    const handleSendEphemeralMessage = useCallback(async () => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        await sendMessage(newMessage, selectedConversationId, currentFirebaseUid, true);
        setNewMessage('');
    }, [newMessage, selectedConversationId, currentFirebaseUid, sendMessage, handleLoginPrompt]);

    const handleAttachNormalFile = useCallback(() => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (fileInputRef.current) {
            fileInputRef.current.onchange = (e) => {
                // Ensure file exists before passing to handleFileUpload
                if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], selectedConversationId, currentFirebaseUid, false);
                }
                e.target.value = null; // Clear the input
            };
            fileInputRef.current.click();
        }
    }, [fileInputRef, handleFileUpload, selectedConversationId, currentFirebaseUid, handleLoginPrompt]);

    const handleAttachEphemeralFile = useCallback(() => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (fileInputRef.current) {
            fileInputRef.current.onchange = (e) => {
                if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], selectedConversationId, currentFirebaseUid, true);
                }
                e.target.value = null; // Clear the input
            };
            fileInputRef.current.click();
        }
    }, [fileInputRef, handleFileUpload, selectedConversationId, currentFirebaseUid, handleLoginPrompt]);


    const handleEmoticonClick = useCallback((emoji) => {
        setNewMessage(prev => prev + emoji);
    }, []);

    const openEphemeralImagePreview = useCallback(async (fileURL, messageId) => {
        setEphemeralImagePreview({ url: fileURL, messageId: messageId });
    }, []);

    const closeEphemeralImagePreview = useCallback(() => {
        setEphemeralImagePreview(null);
    }, []);

    const handleLoginPrompt = useCallback(() => {
        alert(t('access_restricted', 'Accès Restreint. Veuillez vous connecter pour accéder à la messagerie en temps réel.'));
        onLoginClick && onLoginClick();
    }, [t, onLoginClick]);


    // Reste de la logique de Firebase (déjà présente dans votre code)
    // C'est cette logique qui interagit directement avec Firestore pour récupérer les conversations et messages
    // et qui a été coupée dans la version précédente.
    // Je la restaure ici, en l'adaptant pour utiliser les setters des hooks de chat
    // et les données de `currentUser`.

    const formatMessageTimeDisplay = useCallback((timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const currentLocale = i18n.language === 'fr' ? fr : undefined;

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


    // Effect for fetching conversations from Firestore
    useEffect(() => {
        if (!currentFirebaseUid || !db) { // Ensure db is initialized
            setConversations([]);
            return;
        }

        // Query conversations where currentFirebaseUid is a participant
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentFirebaseUid), // Filter conversations by participant
            orderBy('lastMessageTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const convs = await Promise.all(snapshot.docs.map(async d => {
                const data = d.data();
                let displayName = data.name || t('new_conversation_default', 'Nouvelle Conversation');
                let photoURL = '';
                let isGroup = false;
                let participantsDetails = [];

                if (data.participants && data.participants.length > 0) {
                    const participantUids = data.participants;

                    const userDetailsPromises = participantUids.map(uid =>
                        getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
                            .then(snap => snap.docs[0]?.data() || { uid: uid, displayName: t('unknown_user', 'Utilisateur'), photoURL: '/images/default-avatar.png', isOnline: false })
                    );
                    participantsDetails = await Promise.all(userDetailsPromises);

                    // Determine conversation name and photo for 1-1 chats vs groups
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
                            photoURL = partnerDetail.photoURL || '/images/default-avatar.jpg';
                        }
                    } else if (data.participants.length === 1 && data.participants.includes(currentFirebaseUid)) {
                        displayName = t('guest_you', 'TOI');
                        photoURL = currentUser?.photoURL || '/images/default-avatar.jpg'; // Use currentUser.photoURL here
                    }
                }

                // Calculate unread count (this needs more robust logic usually, e.g. last read timestamp)
                // For simplicity, using a flag if last message was read by current user
                const unreadCount = (data.lastMessageReadBy || []).includes(currentFirebaseUid) ? 0 : 1;

                return {
                    id: d.id,
                    ...data,
                    name: displayName,
                    photoURL: photoURL,
                    isGroup: isGroup,
                    unread: unreadCount,
                    initials: displayName.charAt(0).toUpperCase(),
                    participantsDetails: participantsDetails // Store full participant objects
                };
            }));
            setConversations(convs.sort((a,b) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0)));

            // Set default selected conversation if none is active
            if (!selectedConversationId && convs.length > 0) {
                setSelectedConversationId(convs[0].id);
            }
        }, (error) => {
            console.error("Error fetching conversations:", error);
            // Handle permission denied or other errors
        });

        return () => unsubscribe();
    }, [currentFirebaseUid, currentUser, t, db, setSelectedConversationId, selectedConversationId]); // Added selectedConversationId to deps

    // Effect for fetching messages of the active conversation
    useEffect(() => {
        if (!selectedConversationId || !db) { // Ensure db is initialized
            setMessages([]);
            return;
        }

        const messagesColRef = collection(db, 'conversations', selectedConversationId, 'messages');
        const q = query(messagesColRef, orderBy('timestamp'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(d => {
                const data = d.data();
                // Find sender details from participantsDetails of the active conversation
                const activeConv = conversations.find(conv => conv.id === selectedConversationId);
                const senderDetail = activeConv?.participantsDetails?.find(p => p.uid === data.senderUid);

                const senderName = (data.senderUid === currentFirebaseUid)
                    ? currentUserName
                    : (senderDetail?.displayName || t('unknown_user', 'Utilisateur'));

                return {
                    id: d.id,
                    ...data,
                    displayTime: formatMessageTimeDisplay(data.timestamp),
                    status: (data.readBy || []).includes(currentFirebaseUid) ? 'read' : 'sent',
                    from: senderName,
                    senderPhotoURL: senderDetail?.photoURL || '/images/default-avatar.jpg', // Add senderPhotoURL here
                    senderName: senderName // Add senderName here, useful for display component
                };
            });
            setMessages(newMessages);

            const unreadMessageIds = snapshot.docs.filter(d => !(d.data().readBy || []).includes(currentFirebaseUid) && d.data().senderUid !== currentFirebaseUid).map(d => d.id);
            if (unreadMessageIds.length > 0) {
                markMessagesAsRead(selectedConversationId, unreadMessageIds);
            }
        }, (error) => {
            console.error("Error fetching messages:", error);
            // Handle permission denied or other errors
        });

        return () => unsubscribe();
    }, [selectedConversationId, currentFirebaseUid, currentUserName, formatMessageTimeDisplay, markMessagesAsRead, t, db, conversations]); // Added conversations to dependencies


    // --- Logique de création de nouvelle discussion (ajustée pour être réutilisée) ---
    const handleCreateNewDiscussion = useCallback(async ({ name, email, selectedUids, showNewContact }) => {
        if (!currentUser) { // Use currentUser prop/state
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
            setInternalAvailableTeamMembers(prev => [...prev, { uid: newContactUid, displayName: name, email: email, photoURL: '/images/default-avatar.jpg', initials: name.charAt(0).toUpperCase() }]);

        } else {
            if (selectedUids.length === 0) {
                alert(t('select_members_or_add_contact', 'Veuillez sélectionner au moins un membre de l\'équipe ou ajouter un nouveau contact.'));
                return;
            }
            selectedUids.forEach(uid => participantUids.add(uid));
        }

        const sortedParticipantUids = Array.from(participantUids).sort();

        // Utilise la fonction startNewConversation du hook useChatActions
        await startNewConversation(sortedParticipantUids, name?.trim() || ''); // Pass name for conversation
        setIsNewDiscussionModalOpen(false); // Close the modal
        setNewMessage(''); // Clear message input
    }, [currentUser, currentFirebaseUid, t, startNewConversation, setIsNewDiscussionModalOpen, setNewMessage]);


    // Gérer la sélection d'une conversation depuis la sidebar
    const handleSelectConversation = useCallback((conv) => {
        setSelectedConversationId(conv.id);
        // ActiveConversationInfo est maintenant géré par useChatLogic, si vous en avez besoin ici,
        // vous pouvez la dériver de l'état `conversations` et `selectedConversationId`
        // ou l'ajouter au retour de useChatLogic si elle y est gérée.
        if (window.innerWidth < 768) {
            setShowMobileSidebar(false); // Cache la sidebar sur mobile après sélection
        }
    }, [setSelectedConversationId]);


    // Rendu du composant FlowLiveMessages
    return (
        <div ref={chatContainerRef} className={`flex h-full rounded-lg overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-color-bg-primary' : ''}`}>
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
                conversations={conversations || []}
                searchTerm={activeSearchQuery} // Utilise activeSearchQuery du hook
                setSearchTerm={setActiveSearchQuery} // Utilise setActiveSearchQuery du hook
                activeConversationId={selectedConversationId}
                handleSelectConversation={handleSelectConversation} // Fonction pour sélectionner la conv
                setShowNewDiscussionModal={setIsNewDiscussionModalOpen} // Utilise setter du hook
                currentUserName={currentUserName}
                // showMobileSidebar est géré par la logique responsive locale de ce composant
                showMobileSidebar={isFullScreen ? true : showMobileSidebar} // Show sidebar in fullscreen if desired, else local state
                setShowMobileSidebar={setShowMobileSidebar} // Pass setShowMobileSidebar setter
                isFullScreen={isFullScreen}
                t={t}
                isDarkMode={isDarkMode}
                handleSelectUserOnMobile={handleSelectUserOnMobile} // Pass through
            />

            {/* Chat Panel (messages et input) */}
            <div className={`flex flex-col flex-1 ${showMobileSidebar ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversationId ? (
                    <div className={`px-4 py-3 border-b border-color-border-primary flex-shrink-0 flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'}`}>
                        {/* Bouton de retour visible uniquement sur les petits écrans quand la sidebar est cachée */}
                        {!showMobileSidebar && (
                            <button className={`p-2 rounded-full mr-2 md:hidden ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`} onClick={() => setShowMobileSidebar(true)} aria-label={t('back_to_conversations', 'Retour aux conversations')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                        )}
                        <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-color-text-primary mr-2">
                                {/* Afficher le nom de la conversation active ou du partenaire */}
                                {conversations.find(c => c.id === selectedConversationId)?.name || t('new_conversation_default', 'Nouvelle Conversation')}
                            </h3>
                            {conversations.find(c => c.id === selectedConversationId)?.isGroup && <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>{t('group', 'Groupe')}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Boutons d'action pour le chat */}
                            <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`} title={t('meeting', 'Meeting')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 12h20"/></svg>
                            </button>
                            <button
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`}
                                title={t('task', 'Tâche')}
                                onClick={() => {
                                    const activeConv = conversations.find(c => c.id === selectedConversationId);
                                    onOpenAddTaskFromChat({
                                        member: activeConv?.isGroup ? null : activeConv?.participantsDetails?.find(p => p.uid !== currentFirebaseUid),
                                        conversationParticipants: activeConv?.participantsDetails || [],
                                        currentFirebaseUid,
                                        currentUserName,
                                        isFromChat: true
                                    });
                                }}
                            >
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
                    messages={filteredMessages || []}
                    currentUser={currentUser}
                    selectedConversationId={selectedConversationId}
                    activeConversationInfo={conversations.find(c => c.id === selectedConversationId) || {}} // Keep activeConversationInfo for Display
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
                    emojis={ALL_EMOJIS}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    emojiButtonRef={emojiButtonRef}
                    fileInputRef={fileInputRef}
                    isDarkMode={isDarkMode}
                    t={t}
                    activeConversationId={selectedConversationId}
                    isGuestMode={isGuestMode}
                    handleSendEphemeralMessage={handleSendEphemeralMessage}
                    handleAttachEphemeralFile={handleAttachEphemeralFile}
                />
            </div>

            {/* Modale de création/sélection de discussion */}
            <AnimatePresence>
                {isNewDiscussionModalOpen && (
                    <NewDiscussionModal
                        showModal={isNewDiscussionModalOpen}
                        onClose={() => setIsNewDiscussionModalOpen(false)}
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

FlowLiveMessages.displayName = 'FlowLiveMessages';

export default FlowLiveMessages;