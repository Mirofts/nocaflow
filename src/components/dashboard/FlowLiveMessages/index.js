// src/components/dashboard/FlowLiveMessages/index.js
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { db, auth, storage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp, arrayUnion, writeBatch, addDoc, setDoc } from 'firebase/firestore';
import { ref as storageRefFn, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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

// Constants for file limits
const MAX_FILES_UPLOAD = 10;
const MAX_TOTAL_SIZE_MB = 30;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024; // Convert MB to Bytes


const FlowLiveMessages = forwardRef(({
    findUserByIdOrEmail,
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
    const displayRef = useRef(null);
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
    }, [currentFirebaseUid]);

    const {
        conversations,
        selectedConversationId,
        setSelectedConversationId,
        setConversations,
        isNewDiscussionModalOpen,
        setIsNewDiscussionModalOpen,
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

    // STATE AND CALLBACK FOR EPHEMERAL IMAGE PREVIEW
    const [ephemeralImagePreview, setEphemeralImagePreview] = useState(null);

    const openEphemeralImagePreview = useCallback((fileURL, messageId) => {
        setEphemeralImagePreview({ url: fileURL, messageId: messageId });
    }, []);

    const closeEphemeralImagePreview = useCallback(() => {
        setEphemeralImagePreview(null);
    }, []);

    // Effect to handle keyboard events for closing ephemeral image preview
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                closeEphemeralImagePreview();
            }
        };

        if (ephemeralImagePreview) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [ephemeralImagePreview, closeEphemeralImagePreview]);


    // Ref to prevent re-selecting conversation on every re-render of conversations effect
    const hasInitialConversationBeenSet = useRef(false);

    useEffect(() => {
        if (!currentFirebaseUid) {
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
            const convsMap = new Map();
            const participantLookupPromises = snapshot.docs.map(async d => {
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
                // Only count as unread if current user has not read it AND current user is not the sender
                if (data.lastMessageTime && !(data.lastMessageReadBy || []).includes(currentFirebaseUid) && data.lastMessageSenderUid !== currentFirebaseUid) {
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
            });
            await Promise.all(participantLookupPromises);

            const uniqueConvs = Array.from(convsMap.values()).sort((a,b) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0));
            setConversations(uniqueConvs);

            if (!hasInitialConversationBeenSet.current && uniqueConvs.length > 0) {
                setSelectedConversationId(uniqueConvs[0].id);
                hasInitialConversationBeenSet.current = true;
            }
            if (uniqueConvs.length === 0) {
                setSelectedConversationId(null);
                hasInitialConversationBeenSet.current = false;
            }
            setIsLoadingChat(false);
        }, (error) => {
            console.error("Error fetching conversations:", error);
            setIsLoadingChat(false);
        });

        return () => unsubscribe();
    }, [currentFirebaseUid, currentActiveUser, t, setConversations, setSelectedConversationId]);

    useEffect(() => {
        if (!selectedConversationId || !db) {
            setMessages([]);
            return;
        }

        const messagesColRef = collection(db, 'conversations', selectedConversationId, 'messages');
        const q = query(messagesColRef, orderBy('timestamp'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activeConv = conversations.find(conv => conv.id === selectedConversationId);

            const newMessages = snapshot.docs.map(d => {
                const data = d.data();

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
                    isGroup: activeConv?.isGroup
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
    }, [selectedConversationId, currentFirebaseUid, currentUserName, formatMessageTimeDisplay, markMessagesAsRead, t, conversations]);

    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [fileUploadType, setFileUploadType] = useState(null);

    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
    const [showAddDeadlineModal, setShowAddDeadlineModal] = useState(false);
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
        if (newMessage.trim() === '') return; // Prevent sending empty messages
        await sendMessage(newMessage, selectedConversationId, currentFirebaseUid, false);
        setNewMessage('');
    }, [newMessage, selectedConversationId, currentFirebaseUid, sendMessage, handleLoginPrompt, t]);

    const handleSendEphemeralMessage = useCallback(async () => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (!selectedConversationId) {
            alert(t('select_conversation_to_send', 'Veuillez sélectionner une conversation pour envoyer un message éphémère.'));
            return;
        }
        if (newMessage.trim() === '') return; // Prevent sending empty messages
        await sendMessage(newMessage, selectedConversationId, currentFirebaseUid, true);
        setNewMessage('');
    }, [newMessage, selectedConversationId, currentFirebaseUid, sendMessage, handleLoginPrompt, t]);

    const handleTriggerFileInput = useCallback((type) => {
        if (!currentFirebaseUid) { handleLoginPrompt(); return; }
        if (!selectedConversationId) {
            alert(t('select_conversation_to_send', 'Veuillez sélectionner une conversation pour envoyer un fichier.'));
            return;
        }
        setFileUploadType(type);
        fileInputRef.current?.click();
    }, [currentFirebaseUid, selectedConversationId, handleLoginPrompt, t]);

    // This is the updated handleFileChange function
    const handleFileChange = useCallback(async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const isEphemeral = fileUploadType === 'ephemeral';

        // 1. Limite du nombre de fichiers
        if (files.length > MAX_FILES_UPLOAD) {
            alert(t('file_limit_exceeded', `Vous ne pouvez envoyer qu'un maximum de ${MAX_FILES_UPLOAD} fichiers à la fois.`));
            e.target.value = null;
            setFileUploadType(null);
            return;
        }

        // 2. Limite de taille totale
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE_BYTES) {
            alert(t('file_size_limit_exceeded', `La taille totale des fichiers (${(totalSize / 1024 / 1024).toFixed(2)} Mo) dépasse ${MAX_TOTAL_SIZE_MB} Mo.`));
            e.target.value = null;
            setFileUploadType(null);
            return;
        }

        // 3. Upload de chaque fichier et récupération des URLs
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                try {
                    // Utilisation de l'alias storageRefFn
                    const fileStorageRef = storageRefFn(storage, `uploads/${Date.now()}-${file.name}`);
                    await uploadBytes(fileStorageRef, file);
                    const url = await getDownloadURL(fileStorageRef);
                    return {
                        url,
                        name: file.name,
                        type: file.type.startsWith('image/') ? 'image' : 'file',
                        ephemeral: isEphemeral
                    };
                } catch (error) {
                    console.error("Erreur upload fichier :", file.name, error);
                    alert(t('file_upload_error', `Erreur lors de l'envoi du fichier ${file.name}`));
                    return null; // Retourne null pour les uploads échoués
                }
            })
        );

        const validUploads = uploadedFiles.filter(Boolean); // Filtre les valeurs null des uploads échoués
        if (validUploads.length === 0) {
            alert(t('upload_failed_all', 'Tous les fichiers ont échoué.'));
            e.target.value = null;
            setFileUploadType(null);
            return;
        }

        // 4. Envoi en un seul message avec plusieurs pièces jointes
        // We now call sendMessage from useChatActions, which handles updating lastMessage
        try {
            // Passing an empty string for text content, and the validUploads array as attachments
            await sendMessage('', selectedConversationId, currentFirebaseUid, isEphemeral, null, validUploads);
        } catch (error) {
            console.error("Erreur lors de l'envoi du message avec pièces jointes :", error);
            alert(t('send_message_error', 'Erreur lors de l\'envoi du message avec pièces jointes.'));
        }

        // Nettoyage
        e.target.value = null;
        setFileUploadType(null);
    }, [fileUploadType, selectedConversationId, currentFirebaseUid, sendMessage, t]);


    const handleEmoticonClick = useCallback((emoji) => {
        setNewMessage(prev => prev + emoji);
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
    }, [currentActiveUser, currentFirebaseUid, t, startNewConversation, setIsNewDiscussionModalOpen, setNewMessage, setSelectedConversationId]);


    const handleSelectConversation = useCallback((convId) => {
        setSelectedConversationId(convId);
        setMessageSearchQuery('');
        setMessageSearchResultsCount(0);
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
        setShowAddMeetingModal(true);
    }, []);

    const handleOpenDeadlineModal = useCallback(() => {
        setShowAddDeadlineModal(true);
    }, []);

    const handleSaveTask = useCallback(async (taskData) => {
        await addTodo(taskData.title, taskData.priority || 'normal', taskData.deadline || null);
        alert(t('task_saved_success', `Tâche "${taskData.title}" sauvegardée !`));
        setShowAddTaskModal(false);
    }, [addTodo, t]);

    const handleSaveMeeting = useCallback(async (meetingData) => {
        console.log("Meeting to save:", meetingData);
        alert(t('meeting_scheduled_success', `Réunion "${meetingData.title}" planifiée (simulé)!`));
        setShowAddMeetingModal(false);
        onAddMeeting && onAddMeeting(meetingData);
    }, [t, onAddMeeting]);

    const handleSaveDeadline = useCallback(async (deadlineData) => {
        console.log("Deadline to save:", deadlineData);
        alert(t('deadline_added_success', `Deadline "${deadlineData.title}" ajoutée (simulé)!`));
        setShowAddDeadlineModal(false);
        onAddDeadline && onAddDeadline(deadlineData);
    }, [t, onAddDeadline]);


    const handleMessageSearchChange = useCallback((e) => {
        const query = e.target.value;
        setMessageSearchQuery(query);
        const results = messages.filter(msg =>
            (msg.content?.toLowerCase().includes(query.toLowerCase())) ||
            (msg.attachments && msg.attachments.some(att => att.name?.toLowerCase().includes(query.toLowerCase())))
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
        if (!contactToBlock || !currentFirebaseUid || !selectedConversationId || !activeConversationInfo) return;

        const isCurrentlyBlockedByMe = (activeConversationInfo.blockedBy || []).includes(currentFirebaseUid);
        const targetUserId = contactToBlock.uid;

        try {
            if (isCurrentlyBlockedByMe) {
                // Si actuellement bloqué par moi, débloquer
                await unblockUser(targetUserId, selectedConversationId);
                alert(t('contact_unblocked', `${contactToBlock.displayName} a été débloqué.`));
            } else {
                // Si non bloqué par moi, bloquer
                await blockUser(targetUserId, selectedConversationId);
                alert(t('contact_blocked', `${contactToBlock.displayName} a été bloqué.`));
            }
        } catch (error) {
            console.error("Error blocking/unblocking user:", error);
            alert(t('block_unblock_error', 'Erreur lors du blocage/déblocage.'));
        } finally {
            console.log("Resetting block contact modal state."); // Log for final state
            setShowBlockContactModal(false);
            setContactToBlock(null);
        }
    }, [contactToBlock, currentFirebaseUid, selectedConversationId, activeConversationInfo, blockUser, unblockUser, t]);


    const otherChatParticipant = useMemo(() => {
        if (!selectedConversationId || !activeConversationInfo || activeConversationInfo.isGroup) return null;
        return activeConversationInfo.participantsDetails.find(p => p.uid !== currentFirebaseUid);
    }, [selectedConversationId, activeConversationInfo, currentFirebaseUid]);

    const isPartnerBlockedByCurrentUser = useMemo(() => {
        if (!otherChatParticipant || !activeConversationInfo) return false;
        return (activeConversationInfo.blockedBy || []).includes(currentFirebaseUid);
    }, [otherChatParticipant, activeConversationInfo, currentFirebaseUid]);

    const isCurrentUserBlockedByPartner = useMemo(() => {
        if (!otherChatParticipant || !activeConversationInfo) return false;
        return (activeConversationInfo.blockedBy || []).includes(otherChatParticipant.uid);
    }, [otherChatParticipant, activeConversationInfo]);


    const isChatBlocked = useMemo(() => {
        if (!selectedConversationId || !activeConversationInfo) return false;
        // La conversation est bloquée si JE l'ai bloquée ou si l'AUTRE m'a bloqué
        return isPartnerBlockedByCurrentUser || isCurrentUserBlockedByPartner;
    }, [selectedConversationId, activeConversationInfo, isPartnerBlockedByCurrentUser, isCurrentUserBlockedByPartner]);

    // Debugging useEffect for isChatBlocked status
    useEffect(() => {
        console.log("Chat Blocked Status (isChatBlocked):", isChatBlocked);
        if (isChatBlocked) {
            console.log("Reason for block:", {
                isPartnerBlockedByCurrentUser: isPartnerBlockedByCurrentUser,
                isCurrentUserBlockedByPartner: isCurrentUserBlockedByPartner
            });
        }
    }, [isChatBlocked, isPartnerBlockedByCurrentUser, isCurrentUserBlockedByPartner]);


    return (
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

            {!isLoadingChat && !isGuestMode && (
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

                    <div className={`flex flex-col flex-1 ${showMobileSidebar ? 'hidden md:flex' : 'flex'} h-full`}>
                        {selectedConversationId ? (
                            <>
                                <div className="shrink-0 min-h-[64px]">
                                    <div className={`px-4 py-3 border-b border-color-border-primary flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'} h-full`}>
                                        <div className="flex items-center min-w-0">
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

                                        <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
                                            {messages.length > 0 && (
                                                <div className="flex items-center space-x-2">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder={t('search_short', 'Recherche')}
                                                            className={`w-32 px-3 py-1.5 rounded-md text-sm ${
                                                                isDarkMode
                                                                ? 'bg-gray-700 text-white border-gray-600'
                                                                : 'bg-gray-100 text-gray-900 border-gray-300'
                                                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                            value={messageSearchQuery}
                                                            onChange={handleMessageSearchChange}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    displayRef.current?.goToNextSearchResult();
                                                                }
                                                            }}
                                                        />
                                                        {messageSearchQuery && (
                                                            <span
                                                                className={`absolute right-1 top-1/2 -translate-y-1/2 text-xs pr-6 ${
                                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                                }`}
                                                            >
                                                                ({messageSearchResultsCount})
                                                            </span>
                                                        )}
                                                    </div>

                                                    {messageSearchQuery && messageSearchResultsCount > 0 && (
                                                        <button
                                                            onClick={() => displayRef.current?.goToNextSearchResult()}
                                                            className="text-sm px-2 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                                                            title={t('next_result', 'Résultat suivant')}
                                                        >
                                                            ➡️
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {!isGuestMode && !activeConversationInfo?.isGroup && (
                                                <button
                                                    onClick={handleOpenAddTaskModal}
                                                    title={t('add_task', 'Ajouter une tâche')}
                                                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/><path d="M16 12H8"/></svg>
                                                </button>
                                            )}

                                            {!isGuestMode && (
                                                <button
                                                    onClick={handleOpenMeetingModal}
                                                    title={t('add_meeting', 'Ajouter une réunion')}
                                                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path></svg>
                                                </button>
                                            )}

                                            {!isGuestMode && (
                                                <button
                                                    onClick={handleOpenDeadlineModal}
                                                    title={t('add_deadline', 'Ajouter une échéance')}
                                                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                </button>
                                            )}

                                            {/* Bouton Bloquer/Débloquer Contact (only for 1:1 chats) */}
                                            {/* Ajout d'un log pour vérifier la visibilité du bouton */}
                                            {console.log('Block button visibility check - isGuestMode:', isGuestMode, 'otherChatParticipant:', otherChatParticipant)}
                                            {!isGuestMode && otherChatParticipant && (
                                       <button
        onClick={() => {
            console.log("Block/Unblock button clicked. Setting showBlockContactModal to true for:", otherChatParticipant.displayName);
            setContactToBlock(otherChatParticipant);
            setShowBlockContactModal(true);
        }}
        title={isPartnerBlockedByCurrentUser ? t('unblock_contact', 'Débloquer ce contact') : t('block_contact', 'Bloquer ce contact')}
        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
    >
        {isPartnerBlockedByCurrentUser ? (
            // Icône pour "Débloquer" (cadenas ouvert, stylé)
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
        ) : (
            // NOUVELLE Icône pour "Bloquer" (cercle barré, style "flat")
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path></svg>
        )}
    </button>
)}

                                            {/* Full Screen Toggle */}
                                            <button
                                                onClick={toggleFullScreen}
                                                title={isFullScreen ? t('exit_fullscreen', 'Quitter le plein écran') : t('enter_fullscreen', 'Passer en plein écran')}
                                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
                                                >
                                                {isFullScreen ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3m-18 0h3a2 2 0 0 1 2 2v3"/></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V6a2 2 0 0 1 2-2h2m0 16H5a2 2 0 0 1-2-2v-2m18 0v2a2 2 0 0 1-2 2h-2m0-16h2a2 2 0 0 1 2 2v2"/></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto min-h-0">
                                    <FlowLiveMessagesDisplay
                                        ref={displayRef}
                                        messages={messages || []}
                                        currentUser={currentActiveUser}
                                        onMessageAction={handleMessageAction}
                                        availableTeamMembers={internalAvailableTeamMembers}
                                        t={t}
                                        handleSelectUserOnMobile={handleSelectUserOnMobile}
                                        openEphemeralImagePreview={openEphemeralImagePreview}
                                        currentFirebaseUid={currentFirebaseUid}
                                        onEditMessage={handleEditMessage}
                                        onDeleteMessage={handleConfirmDeleteMessage}
                                        messageSearchQuery={messageSearchQuery}
                                        activeConversationIsGroup={activeConversationInfo?.isGroup}
                                        isChatBlocked={isChatBlocked}
                                    />
                                </div>

                                <div className="shrink-0 min-h-[72px]">
                                    <FlowLiveMessagesInput
                                        newMessage={newMessage}
                                        setNewMessage={setNewMessage}
                                        handleSendNormalMessage={handleSendNormalMessage}
                                        handleTriggerFileInput={handleTriggerFileInput}
                                        handleFileChange={handleFileChange}
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
                                        isChatBlocked={isChatBlocked}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className={`px-4 py-3 border-b border-color-border-primary flex-shrink-0 flex items-center justify-center text-center ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary text-color-text-secondary'} flex-grow h-full`}>
                                <h3 className="text-lg font-semibold">{t('select_conversation', 'Sélectionnez une conversation pour commencer.')}</h3>
                            </div>
                        )}
                    </div>
                </>
            )}

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
                {showAddMeetingModal && (
                    <AddMeetingModal
                        onClose={() => setShowAddMeetingModal(false)}
                        onAddMeeting={handleSaveMeeting}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddDeadlineModal && (
                    <AddDeadlineModal
                        onClose={() => setShowAddDeadlineModal(false)}
                        onAddDeadline={handleSaveDeadline}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBlockContactModal && (
                    <BlockContactModal
                        showModal={showBlockContactModal}
                        contact={contactToBlock}
                        contactName={contactToBlock?.displayName || t('this_contact', 'ce contact')}
                        onClose={() => {
                            console.log("BlockContactModal close clicked.");
                            setShowBlockContactModal(false);
                            setContactToBlock(null);
                        }}
                        onConfirm={handleBlockUnblockContact}
                        isBlocked={isPartnerBlockedByCurrentUser}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showConfirmDeleteMessageModal && (
                    <ConfirmDeleteMessageModal
                        messageId={messageToDeleteId}
                        onClose={() => setShowConfirmDeleteMessageModal(false)}
                        onConfirm={handleDeleteMessage}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {ephemeralImagePreview && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeEphemeralImagePreview}
                    >
                        <motion.img
                            src={ephemeralImagePreview.url}
                            alt="Ephemeral Preview"
                            className="max-w-full max-h-full object-contain cursor-pointer"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        />
                        <button
                            onClick={closeEphemeralImagePreview}
                            className="absolute top-4 right-4 text-white text-3xl font-bold p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75"
                            aria-label={t('close_preview', 'Fermer l\'aperçu')}
                        >
                            &times;
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

FlowLiveMessages.displayName = 'FlowLiveMessages';
export default FlowLiveMessages;