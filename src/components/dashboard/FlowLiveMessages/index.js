// src/components/dashboard/FlowLiveMessages/index.js
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { db, auth, storage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp, arrayUnion, writeBatch, addDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { format, isToday, isYesterday, isSameWeek, isSameDay, isSameYear, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// IMPORTS DES COMPOSANTS ENFANTS
import FlowLiveMessagesSidebar from './FlowLiveMessagesSidebar';
import FlowLiveMessagesDisplay from './FlowLiveMessagesDisplay';
import FlowLiveMessagesInput from './FlowLiveMessagesInput';

// IMPORTS DES MODALES VIA dashboardModals.js (le fichier central d'exportation)
import {
    NewDiscussionModal,
    TaskEditModal,
    AddMeetingModal,
    AddDeadlineModal,
    BlockContactModal,
    ConfirmDeleteMessageModal
} from '@/components/dashboard/dashboardModals';

// IMPORTS DES HOOKS : UTILISATION DES ALIAS
import { useFullScreen } from '@/hooks/useFullScreen';
import { useChatLogic } from '@/hooks/useChatLogic';
import { useChatActions } from '@/hooks/useChatActions';
import { useUserTodos } from '@/hooks/useUserTodos';

const ALL_EMOJIS = [
    '👋', '😀', '🔥', '🚀', '💡', '✅', '✨', '👍', '🎉', '🌟', '💫', '💥', '🚀', '🌈', '☀️', '🌻', '🌺', '🌲', '🌳', '🍂', '🍁', '🍓', '🍋', '🍎', '🍔', '🍕', '🌮', '🍩', '🍦', '☕', '🍵', '🥂', '🍾', '🎉', '🎁', '🎈', '🎂', '🥳', '🏠', '🏢', '💡', '⏰', '📆', '📈', '📊', '🔗', '🔒', '🔑', '📝', '📌', '📎', '📁', '📄', '📊', '📈', '📉', '💰', '💳', '💵', '💸', '📧', '📞', '💬', '🔔', '📣', '💡', '⚙️', '🔨', '🛠️', '💻', '🖥️', '📱', '⌨️', '🖱️', '🖨️', '💾', '💿', '📀', '📚', '📖', '🖊️', '🖌️', '✏️', '🖍️', '📏', '📐', '✂️', '🗑️', '🔒', '🔑', '🛡️', '⚙️', '🔗', '📎', '📌', '📍', '📁', '📂', '🗂️', '🗓️', '📅', '📆', '⏰', '⏱️', '⌛', '⏳'
];

const FlowLiveMessages = forwardRef(({
    onLoginClick,
    onRegisterClick,
    onOpenAddTaskFromChat,
    onAddMeeting,
    onAddDeadline,
    availableTeamMembers,
    messages: messagesProp,
    user,
    initialMockData,
    handleSelectUserOnMobile,
    onUpdateGuestData
}, ref) => {
    const { currentUser: authUser } = useAuth();
    const { isDarkMode } = useTheme();
    const { t, i18n } = useTranslation('common');

    const currentActiveUser = user || authUser;
    const isGuestMode = !currentActiveUser || currentActiveUser.uid === 'guest_noca_flow';
    const currentFirebaseUid = currentActiveUser?.uid || (isGuestMode ? 'guest_noca_flow' : null);
    const currentUserName = currentActiveUser?.displayName || (isGuestMode ? t('guest_user_default', 'Visiteur Curieux') : 'Moi');
    const currentUserPhotoURL = currentActiveUser?.photoURL || (isGuestMode ? '/images/avatars/avatarguest.jpg' : '/images/default-avatar.jpg');

    const initialGuestTasks = useMemo(() => initialMockData?.guestData?.tasks || [], [initialMockData]);
    const { addTodo, editTodo, deleteTodo: deleteTodoFromHook, toggleTodo } = useUserTodos(currentFirebaseUid, isGuestMode, onUpdateGuestData, initialGuestTasks);

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
        if (!currentFirebaseUid || !conversationId || messageIds.length === 0 || !db) return;
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


    const {
        conversations,
        selectedConversationId,
        filteredMessages,
        setSelectedConversationId,
        setConversations,
        setMessages: setMessagesFromLogic,
        isNewDiscussionModalOpen,
        setIsNewDiscussionModalOpen,
        newDiscussionModalInitialContact,
        setNewDiscussionModalInitialContact,
        activeSearchQuery,
        setActiveSearchQuery
    } = useChatLogic(currentActiveUser, initialMockData, messagesProp);

    const [messages, setMessages] = useState([]);
    const [isLoadingChat, setIsLoadingChat] = useState(true);

    const {
        sendMessage,
        startNewConversation,
        handleMessageAction,
        handleFileUpload,
        editMessage,
        deleteMessage: deleteMessageFromActions,
        blockUser,
        unblockUser
    } = useChatActions(currentActiveUser, conversations, setConversations, setMessages);

    const chatContainerRef = useRef(null);
    const { isFullScreen, toggleFullScreen } = useFullScreen(chatContainerRef);

    useImperativeHandle(ref, () => ({
        toggleFullScreen: toggleFullScreen
    }));

    const [messageSearchQuery, setMessageSearchQuery] = useState('');
    const [messageSearchResultsCount, setMessageSearchResultsCount] = useState(0);

    const [showBlockContactModal, setShowBlockContactModal] = useState(false);
    const [contactToBlock, setContactToBlock] = useState(null);

    const [showConfirmDeleteMessageModal, setShowConfirmDeleteMessageModal] = useState(false);
    const [messageToDeleteId, setMessageToDeleteId] = useState(null);

    useEffect(() => {
        if (!currentFirebaseUid || !db) {
            setConversations([]);
            setIsLoadingChat(false);
            return;
        }
        setIsLoadingChat(true);
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentFirebaseUid),
            orderBy('lastMessageTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const convsMap = new Map(); // Use a Map to store unique conversations by ID
            await Promise.all(snapshot.docs.map(async d => {
                const data = d.data();
                let displayName = '';
                let photoURL = '';
                let isGroup = false;
                let participantsDetails = [];

                if (data.participants && Array.isArray(data.participants) && data.participants.length > 0) {
                    const participantUids = data.participants;

                    const userDetailsPromises = participantUids.map(uid =>
                        getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
                            .then(snap => snap.docs[0]?.data() || { uid: uid, displayName: t('unknown_user', 'Utilisateur'), photoURL: '/images/default-avatar.jpg', isOnline: false })
                    );
                    participantsDetails = await Promise.all(userDetailsPromises);

                    if (data.participants.length > 2 || (data.participants.length === 2 && !data.participants.includes(currentFirebaseUid))) {
                        isGroup = true;
                        if (!data.name) {
                            const otherParticipants = participantsDetails.filter(p => p.uid !== currentFirebaseUid);
                            const participantNames = otherParticipants.map(p => p.displayName).filter(name => name);
                            displayName = t('group_with', 'Groupe avec') + ` ${participantNames.join(', ')}`;
                        } else {
                            displayName = data.name;
                        }
                        photoURL = '/images/default-group-avatar.png';
                    } else if (data.participants.length === 2 && data.participants.includes(currentFirebaseUid)) {
                        const partnerDetail = participantsDetails.find(p => p.uid !== currentFirebaseUid);
                        displayName = partnerDetail?.displayName || t('unknown_user', 'Utilisateur');
                        photoURL = partnerDetail?.photoURL || '/images/default-avatar.jpg';
                    } else if (data.participants.length === 1 && data.participants.includes(currentFirebaseUid)) {
                        displayName = t('guest_you', 'TOI');
                        photoURL = currentActiveUser?.photoURL || '/images/avatars/avatarguest.jpg';
                    }
                } else {
                    displayName = data.name || t('new_conversation_default', 'Nouvelle Conversation');
                    photoURL = '/images/default-avatar.jpg';
                    isGroup = false;
                    participantsDetails = [];
                }

                let unreadCount = 0;
                if (data.messages && Array.isArray(data.messages)) {
                    unreadCount = data.messages.filter(msg =>
                        msg.senderUid !== currentFirebaseUid && !(msg.readBy || []).includes(currentFirebaseUid)
                    ).length;
                } else if (data.lastMessageTime && data.lastMessageReadBy && !data.lastMessageReadBy.includes(currentFirebaseUid) && data.lastMessageSenderUid !== currentFirebaseUid) {
                    unreadCount = 1;
                }

                convsMap.set(d.id, {
                    id: d.id,
                    ...data,
                    name: displayName,
                    photoURL: photoURL,
                    isGroup: isGroup,
                    unread: unreadCount,
                    initials: (displayName || 'U').charAt(0).toUpperCase(),
                    participantsDetails: participantsDetails
                });
            }));
            const uniqueConvs = Array.from(convsMap.values()).sort((a,b) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0));
            setConversations(uniqueConvs);

            if (!selectedConversationId && uniqueConvs.length > 0) {
                setSelectedConversationId(uniqueConvs[0].id);
            }
            if (!selectedConversationId && uniqueConvs.length === 0) { // Handle case where there are no conversations
                setIsLoadingChat(false);
                return;
            }
            setIsLoadingChat(false);
        }, (error) => {
            console.error("Error fetching conversations:", error);
            setIsLoadingChat(false);
        });

        return () => unsubscribe();
    }, [currentFirebaseUid, currentActiveUser, t, db, selectedConversationId, setSelectedConversationId]);

    useEffect(() => {
        if (!selectedConversationId || !db || conversations.length === 0) {
            setMessages([]);
            return;
        }

        const messagesColRef = collection(db, 'conversations', selectedConversationId, 'messages');
        const q = query(messagesColRef, orderBy('timestamp'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(d => {
                const data = d.data();
                const activeConv = conversations.find(conv => conv.id === selectedConversationId);
                
                const senderDetail = activeConv?.participantsDetails?.find(p => p.uid === data.senderUid) || {
                    displayName: t('unknown_user', 'Utilisateur'),
                    photoURL: '/images/default-avatar.jpg'
                };

                const senderName = (data.senderUid === currentFirebaseUid)
                    ? currentUserName
                    : (senderDetail?.displayName || t('unknown_user', 'Utilisateur'));

                const otherParticipants = activeConv?.participantsDetails?.filter(p => p.uid !== currentFirebaseUid) || [];

                let isReadByAllRecipients = false;
                if (data.senderUid === currentFirebaseUid) {
                    isReadByAllRecipients = otherParticipants.length > 0 ?
                        otherParticipants.every(p => (data.readBy || []).includes(p.uid)) :
                        true;
                }

                return {
                    id: d.id,
                    ...data,
                    displayTime: formatMessageTimeDisplay(data.timestamp),
                    isReadByAllRecipients: isReadByAllRecipients,
                    from: senderName,
                    senderPhotoURL: senderDetail?.photoURL,
                    senderName: senderName,
                    isGroup: activeConv?.isGroup // Pass isGroup to FlowLiveMessagesDisplay for name display logic
                };
            });
            setMessages(newMessages);

            const unreadMessageIds = snapshot.docs.filter(d => !(d.data().readBy || []).includes(currentFirebaseUid) && d.data().senderUid !== currentFirebaseUid).map(d => d.id);
            if (unreadMessageIds.length > 0) {
                markMessagesAsRead(selectedConversationId, unreadMessageIds);
            }
        }, (error) => {
            console.error("Error fetching messages for conversation " + selectedConversationId + ":", error);
            setMessages([]);
        });

        return () => unsubscribe();
    }, [selectedConversationId, currentFirebaseUid, currentUserName, formatMessageTimeDisplay, markMessagesAsRead, t, db, conversations]);


    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [ephemeralImagePreview, setEphemeralImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [addTaskInitialData, setAddTaskInitialData] = useState(null);

    const handleLoginPrompt = useCallback(() => {
        alert(t('access_restricted', 'Accès Restreint. Veuillez vous connecter pour accéder à la messagerie en temps réel.'));
        onLoginClick && onLoginClick();
    }, [t, onLoginClick]);


    const internalAvailableTeamMembers = useMemo(() => {
        if (availableTeamMembers && availableTeamMembers.length > 0) {
            return availableTeamMembers;
        } else if (initialMockData?.staffMembers) {
            return initialMockData.staffMembers;
        }
        return [];
    }, [availableTeamMembers, initialMockData]);


    const handleSendNormalMessage = useCallback(async () => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (!selectedConversationId) {
            alert(t('select_conversation_to_send', 'Veuillez sélectionner une conversation pour envoyer un message.'));
            return;
        }
        await sendMessage(newMessage, selectedConversationId, currentFirebaseUid, false);
        setNewMessage('');
    }, [newMessage, selectedConversationId, currentFirebaseUid, sendMessage, handleLoginPrompt, t]);

    const handleSendEphemeralMessage = useCallback(async () => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (!selectedConversationId) {
            alert(t('select_conversation_to_send', 'Veuillez sélectionner une conversation pour envoyer un message éphémère.'));
            return;
        }
        await sendMessage(newMessage, selectedConversationId, currentFirebaseUid, true);
        setNewMessage('');
    }, [newMessage, selectedConversationId, currentFirebaseUid, sendMessage, handleLoginPrompt, t]);

    const handleAttachNormalFile = useCallback(() => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (!selectedConversationId) {
            alert(t('select_conversation_to_send', 'Veuillez sélectionner une conversation pour envoyer un fichier.'));
            return;
        }
        if (fileInputRef.current) {
            fileInputRef.current.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    await handleFileUpload(e.target.files[0], selectedConversationId, currentFirebaseUid, false);
                }
                e.target.value = null;
            };
            fileInputRef.current.click();
        }
    }, [fileInputRef, handleFileUpload, selectedConversationId, currentFirebaseUid, handleLoginPrompt, t]);

    const handleAttachEphemeralFile = useCallback(() => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (!selectedConversationId) {
            alert(t('select_conversation_to_send', 'Veuillez sélectionner une conversation pour envoyer un fichier éphémère.'));
            return;
        }
        if (fileInputRef.current) {
            fileInputRef.current.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    await handleFileUpload(e.target.files[0], selectedConversationId, currentFirebaseUid, true);
                }
                e.target.value = null;
            };
            fileInputRef.current.click();
        }
    }, [fileInputRef, handleFileUpload, selectedConversationId, currentFirebaseUid, handleLoginPrompt, t]);


    const handleEmoticonClick = useCallback((emoji) => {
        setNewMessage(prev => prev + emoji);
    }, []);

    const openEphemeralImagePreview = useCallback(async (fileURL, messageId) => {
        setEphemeralImagePreview({ url: fileURL, messageId: messageId });
    }, []);

    const closeEphemeralImagePreview = useCallback(() => {
        setEphemeralImagePreview(null);
    }, []);


    const handleCreateNewDiscussion = useCallback(async ({ name, email, selectedUids, showNewContact }) => {
        if (!currentActiveUser) {
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

            try {
                const usersColRef = collection(db, 'users');
                await setDoc(doc(usersColRef, newContactUid), {
                    uid: newContactUid,
                    displayName: name,
                    email: email,
                    photoURL: '/images/default-avatar.jpg',
                    isOnline: false,
                    isSimulated: true,
                    invitedAt: serverTimestamp()
                });
                console.log(`Simulated user ${name} added to 'users' collection.`);
            } catch (e) {
                console.error("Error adding simulated user to Firebase:", e);
                alert("Erreur lors de l'ajout du contact simulé. Veuillez réessayer.");
                return;
            }

        } else {
            if (selectedUids.length === 0) {
                alert(t('select_members_or_add_contact', 'Veuillez sélectionner au moins un membre de l\'équipe ou ajouter un nouveau contact.'));
                return;
            }
            selectedUids.forEach(uid => participantUids.add(uid));
        }

        const sortedParticipantUids = Array.from(participantUids).sort();

        try {
            const newConvId = await startNewConversation(sortedParticipantUids, name?.trim() || '');
            if (newConvId) {
                setSelectedConversationId(newConvId);
            }
            setIsNewDiscussionModalOpen(false);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to start new conversation:", error);
            alert(t('error_starting_conversation', 'Erreur lors du démarrage de la conversation.'));
        }
    }, [currentActiveUser, currentFirebaseUid, t, startNewConversation, setIsNewDiscussionModalOpen, setNewMessage, setSelectedConversationId, db]);


    const handleSelectConversation = useCallback((convId) => {
        setSelectedConversationId(convId);
        if (window.innerWidth < 768) {
            setShowMobileSidebar(false);
        }
    }, [setSelectedConversationId]);


    const activeConversationInfo = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId);
    }, [conversations, selectedConversationId]);

    const displayChatName = activeConversationInfo?.name || t('new_conversation_default', 'Nouvelle Conversation');
    const displayChatAvatar = activeConversationInfo?.photoURL || '/images/default-group-avatar.png';

    const handleOpenAddTaskModal = useCallback((taskData = {}) => {
        setAddTaskInitialData(taskData);
        setShowAddTaskModal(true);
    }, []);

    const handleOpenMeetingModal = useCallback(() => {
        setShowMeetingModal(true);
    }, []);

    const handleOpenDeadlineModal = useCallback(() => {
        setShowDeadlineModal(true);
    }, []);

    const handleSaveTask = useCallback(async (taskData) => {
        await addTodo(taskData.title, taskData.priority || 'normal', taskData.deadline || null);
        alert(t('task_saved_success', `Tâche "${taskData.title}" sauvegardée !`));
    }, [addTodo, t]);

    const handleSaveMeeting = useCallback(async (meetingData) => {
        console.log("Meeting to save:", meetingData);
        alert(t('meeting_scheduled_success', `Réunion "${meetingData.title}" planifiée (simulé)!`));
    }, [t]);

    const handleSaveDeadline = useCallback(async (deadlineData) => {
        console.log("Deadline to save:", deadlineData);
        alert(t('deadline_added_success', `Deadline "${deadlineData.title}" ajoutée (simulé)!`));
    }, [t]);


    const handleMessageSearchChange = useCallback((e) => {
        const query = e.target.value;
        setMessageSearchQuery(query);
        const results = messages.filter(msg =>
            msg.content?.toLowerCase().includes(query.toLowerCase())
        );
        setMessageSearchResultsCount(results.length);
    }, [messages]);


    const handleEditMessage = useCallback(async (messageId, newContent) => {
        if (!selectedConversationId || !currentFirebaseUid) return;
        await editMessage(selectedConversationId, messageId, newContent);
    }, [editMessage, selectedConversationId, currentFirebaseUid]);

    const handleConfirmDeleteMessage = useCallback((messageId) => {
        setMessageToDeleteId(messageId);
        setShowConfirmDeleteMessageModal(true);
    }, []);

    const handleDeleteMessage = useCallback(async () => {
        if (!messageToDeleteId || !selectedConversationId || !currentFirebaseUid) return;
        await deleteMessageFromActions(selectedConversationId, messageToDeleteId);
        setShowConfirmDeleteMessageModal(false);
        setMessageToDeleteId(null);
    }, [messageToDeleteId, deleteMessageFromActions, selectedConversationId, currentFirebaseUid]);


    const handleBlockUnblockContact = useCallback(async () => {
        if (!contactToBlock || !currentFirebaseUid || !selectedConversationId) return;

        const isCurrentlyBlocked = activeConversationInfo?.blockedBy?.includes(currentFirebaseUid);
        const targetUserId = contactToBlock.uid;

        try {
            if (isCurrentlyBlocked) {
                await unblockUser(targetUserId, selectedConversationId);
                alert(t('contact_unblocked', `${contactToBlock.displayName} a été débloqué.`));
            } else {
                await blockUser(targetUserId, selectedConversationId);
                alert(t('contact_blocked', `${contactToBlock.displayName} a été bloqué.`));
            }
        } catch (error) {
            console.error("Error blocking/unblocking user:", error);
            alert(t('block_unblock_error', 'Erreur lors du blocage/déblocage.'));
        } finally {
            setShowBlockContactModal(false);
            setContactToBlock(null);
        }
    }, [contactToBlock, currentFirebaseUid, selectedConversationId, activeConversationInfo, blockUser, unblockUser, t]);


    const isPartnerBlocked = useMemo(() => {
        if (!selectedConversationId || !currentFirebaseUid || !activeConversationInfo) return false;
        if (activeConversationInfo.isGroup) return false;

        const otherParticipant = activeConversationInfo.participantsDetails.find(p => p.uid !== currentFirebaseUid);
        return (activeConversationInfo.blockedBy || []).includes(currentFirebaseUid);
    }, [selectedConversationId, currentFirebaseUid, activeConversationInfo]);


    const otherChatParticipant = useMemo(() => {
        if (!selectedConversationId || !activeConversationInfo || activeConversationInfo.isGroup) return null;
        return activeConversationInfo.participantsDetails.find(p => p.uid !== currentFirebaseUid);
    }, [selectedConversationId, activeConversationInfo, currentFirebaseUid]);


    return (
        // The main chat container, enforcing its fixed height and acting as a flex parent
        // 'overflow-hidden' here is key to trapping scroll within the component's children.
        <div ref={chatContainerRef} className={`flex h-[700px] rounded-lg overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-color-bg-primary' : 'max-h-[700px]'}`}>
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

            <AnimatePresence>
                {isLoadingChat && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="animate-spin h-10 w-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-3 text-white">{t('loading_conversations', 'Chargement des conversations...')}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isLoadingChat && (
                <>
                    <FlowLiveMessagesSidebar
                        conversations={conversations || []}
                        selectedConversationId={selectedConversationId}
                        setSelectedConversationId={handleSelectConversation}
                        onNewDiscussionClick={() => setIsNewDiscussionModalOpen(true)}
                        activeSearchQuery={activeSearchQuery}
                        setActiveSearchQuery={setActiveSearchQuery}
                        currentUser={currentActiveUser}
                        t={t}
                        isFullScreen={isFullScreen}
                        handleSelectUserOnMobile={handleSelectUserOnMobile}
                    />

                    {/* This div is the main chat content area (header + display + input). It's a flex column. */}
                    {/* The `flex-1` here makes it take up all available space horizontally within the parent flex container. */}
                    {/* `h-full` ensures it uses 100% of the parent's height, allowing its internal flex children to distribute space. */}
                    <div className={`flex flex-col flex-1 ${showMobileSidebar ? 'hidden md:flex' : 'flex'} h-full`}>
                        {selectedConversationId ? (
                            <>
                                {/* HEADER FIXE */}
                                {/* `shrink-0` ensures it doesn't shrink. `min-h-[64px]` gives it a fixed minimum height. */}
                                <div className="shrink-0 min-h-[64px]">
                                    <div className={`px-4 py-3 border-b border-color-border-primary flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'} h-full`}> {/* h-full ensures content fills this header div */}
                                        <div className="flex items-center min-w-0">
                                            {/* Mobile sidebar toggle button */}
                                            {!showMobileSidebar && (
                                                <button
                                                    className={`p-2 rounded-full mr-2 md:hidden ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                    onClick={() => setShowMobileSidebar(true)}
                                                    aria-label={t('back_to_conversations', 'Retour aux conversations')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                                </button>
                                            )}
                                            <img src={displayChatAvatar} alt={displayChatName} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                            <h3 className="text-lg font-semibold text-color-text-primary mr-2 truncate">{displayChatName}</h3>
                                            {activeConversationInfo?.isGroup && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                    {t('group', 'Groupe')}
                                                </span>
                                            )}
                                        </div>

                                        {/* BOUTONS D'ACTION ET RECHERCHE MESSAGES (FIXES) */}
                                        {/* `flex-shrink-0` ensures these buttons don't shrink and `ml-auto` pushes them to the right. */}
                                        <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
                                            {/* Champ de recherche de messages */}
                                            {selectedConversationId && messages.length > 0 && (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder={t('search_short', 'Recherche')} // Corrected placeholder
                                                        className={`w-32 px-3 py-1.5 rounded-md text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                        value={messageSearchQuery}
                                                        onChange={handleMessageSearchChange}
                                                    />
                                                    {messageSearchQuery && (
                                                        <span className={`absolute right-1 top-1/2 -translate-y-1/2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            ({messageSearchResultsCount})
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Bouton Ajouter Tâche */}
                                            {!isGuestMode && selectedConversationId && !activeConversationInfo?.isGroup && (
                                                <button
                                                    onClick={handleOpenAddTaskModal}
                                                    title={t('add_task', 'Ajouter une tâche')}
                                                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/><path d="M16 12H8"/></svg>
                                                </button>
                                            )}

                                            {/* Bouton Ajouter Réunion */}
                                            {!isGuestMode && selectedConversationId && (
                                                <button
                                                    onClick={handleOpenMeetingModal}
                                                    title={t('add_meeting', 'Ajouter une réunion')}
                                                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path></svg>
                                                </button>
                                            )}

                                            {/* Bouton Ajouter Échéance */}
                                            {!isGuestMode && selectedConversationId && (
                                                <button
                                                    onClick={handleOpenDeadlineModal}
                                                    title={t('add_deadline', 'Ajouter une échéance')}
                                                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                </button>
                                            )}

                                            {/* Bouton Bloquer/Débloquer Contact */}
                                            {selectedConversationId && !activeConversationInfo?.isGroup && !isGuestMode && otherChatParticipant && (
                                                <button
                                                    onClick={() => {
                                                        setContactToBlock(otherChatParticipant);
                                                        setShowBlockContactModal(true);
                                                    }}
                                                    title={isPartnerBlocked ? t('unblock_contact', 'Débloquer le contact') : t('block_contact', 'Bloquer le contact')}
                                                    className={`p-2 rounded-full transition-colors ${isPartnerBlocked ? 'text-red-500 hover:text-red-600' : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary')} hover:bg-color-bg-hover`}
                                                >
                                                    {isPartnerBlocked ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5"/><path d="M16 12H2"/><path d="M22 12h-2"/></svg> // Unblock icon (info/warning)
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> // Block icon
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* CONTENU SCROLLABLE (AREA MESSAGES) */}
                                {/* flex-1: allows it to grow and shrink. overflow-y-auto: enables vertical scrolling if content overflows. */}
                                {/* min-h-0: crucial for flex items in a column to prevent content from pushing their minimum size larger than available space. */}
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    <FlowLiveMessagesDisplay
                                        messages={messages || []}
                                        currentUser={currentActiveUser}
                                        onMessageAction={handleMessageAction}
                                        availableTeamMembers={internalAvailableTeamMembers}
                                        t={t}
                                        isFullScreen={isFullScreen}
                                        handleSelectUserOnMobile={handleSelectUserOnMobile}
                                        openEphemeralImagePreview={openEphemeralImagePreview}
                                        currentFirebaseUid={currentFirebaseUid}
                                        onEditMessage={handleEditMessage}
                                        onDeleteMessage={handleConfirmDeleteMessage}
                                        messageSearchQuery={messageSearchQuery}
                                        activeConversationIsGroup={activeConversationInfo?.isGroup}
                                    />
                                </div>

                                {/* FOOTER FIXE (INPUT MESSAGE) */}
                                {/* `shrink-0` ensures it doesn't shrink. `min-h-[72px]` gives it a fixed minimum height. */}
                                <div className="shrink-0 min-h-[72px]">
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
                            </>
                        ) : (
                            // Display if no conversation is selected
                            // `flex-grow h-full` ensures this div fills the entire right panel when no conversation is active.
                            <div className={`px-4 py-3 border-b border-color-border-primary flex-shrink-0 flex items-center justify-center text-center ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary text-color-text-secondary'} flex-grow h-full`}>
                                <h3 className="text-lg font-semibold">{t('select_conversation', 'Sélectionnez une conversation pour commencer.')}</h3>
                            </div>
                        )}
                    </div>
                </>
            )}


            {/* Modales diverses */}
            <AnimatePresence>
                {isNewDiscussionModalOpen && (
                    <NewDiscussionModal
                        showModal={isNewDiscussionModalOpen}
                        onClose={() => setIsNewDiscussionModalOpen(false)}
                        onCreate={handleCreateNewDiscussion}
                        internalAvailableTeamMembers={internalAvailableTeamMembers}
                        currentFirebaseUid={currentFirebaseUid}
                        currentUserName={currentUserName}
                        currentUserPhotoURL={currentUserPhotoURL}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddTaskModal && (
                    <TaskEditModal
                        task={addTaskInitialData || {}}
                        onSave={handleSaveTask}
                        onClose={() => setShowAddTaskModal(false)}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showMeetingModal && (
                    <AddMeetingModal
                        onSave={handleSaveMeeting}
                        onClose={() => setShowMeetingModal(false)}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeadlineModal && (
                    <AddDeadlineModal
                        onSave={handleSaveDeadline}
                        onClose={() => setShowDeadlineModal(false)}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBlockContactModal && contactToBlock && (
                    <BlockContactModal
                        showModal={showBlockContactModal}
                        onClose={() => { setShowBlockContactModal(false); setContactToBlock(null); }}
                        onConfirm={handleBlockUnblockContact}
                        contactName={contactToBlock.displayName}
                        isBlocked={isPartnerBlocked}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showConfirmDeleteMessageModal && messageToDeleteId && (
                    <ConfirmDeleteMessageModal
                        showModal={showConfirmDeleteMessageModal}
                        onClose={() => { setShowConfirmDeleteMessageModal(false); setMessageToDeleteId(null); }}
                        onConfirm={handleDeleteMessage}
                        t={t}
                    />
                )}
            </AnimatePresence>

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