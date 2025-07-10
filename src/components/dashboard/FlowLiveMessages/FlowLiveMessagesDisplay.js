// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesDisplay.js
import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
// format and fr are not used directly in this component, so they can be removed if not needed elsewhere
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';

const FlowLiveMessagesDisplay = forwardRef(({ // Use forwardRef to accept a ref
    messages,
    currentUser,
    // onMessageAction, // Appears unused, consider removing
    // availableTeamMembers, // Appears unused, consider removing
    t,
    // isFullScreen, // Appears unused, consider removing
    // handleSelectUserOnMobile, // Appears unused, consider removing
    openEphemeralImagePreview, // This prop IS used for ephemeral images
    currentFirebaseUid,
    onEditMessage,
    onDeleteMessage,
    messageSearchQuery,
    activeConversationIsGroup,
    // isChatBlocked // This prop was passed in the previous correction but unused, consider using or removing
}, ref) => { // Accept ref as the second argument
    const { isDarkMode } = useTheme();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null); // Ref for the messages container

    // State to keep track of the current search result index
    const [activeSearchIndex, setActiveSearchIndex] = useState(-1); // Initialize with -1, meaning no result is active
    // Use an object to store refs by message ID, which is more robust than an array if messages reorder
    const searchResultRefs = useRef({});

    const hasMountedRef = useRef(false);

    // Effect for auto-scrolling to the bottom of messages
    useEffect(() => {
        if (hasMountedRef.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        } else {
            hasMountedRef.current = true; // Prevents initial scroll on first mount
        }
    }, [messages]);

    // Effect to scroll to the active search result and apply visual feedback
    useEffect(() => {
        const highlightedMessageIds = Object.keys(searchResultRefs.current).filter(id => searchResultRefs.current[id]);

        if (highlightedMessageIds.length > 0 && activeSearchIndex !== -1) {
            const targetId = highlightedMessageIds[activeSearchIndex];
            const targetElement = searchResultRefs.current[targetId];

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
                // Add a temporary visual highlight
                targetElement.classList.add('animate-pulse-once');
                setTimeout(() => {
                    targetElement.classList.remove('animate-pulse-once');
                }, 1000); // Remove the class after 1 second
            }
        }
    }, [activeSearchIndex, messageSearchQuery, messages]); // Re-trigger if search query or messages change

    // Function to navigate to the next search result
    const goToNextSearchResult = useCallback(() => {
        const highlightedMessageIds = Object.keys(searchResultRefs.current).filter(id => searchResultRefs.current[id]);
        if (highlightedMessageIds.length === 0) {
            setActiveSearchIndex(-1); // No results
            return;
        }

        let nextIndex = activeSearchIndex + 1;
        if (nextIndex >= highlightedMessageIds.length) {
            nextIndex = 0; // Loop back to the beginning
        }
        setActiveSearchIndex(nextIndex);
    }, [activeSearchIndex]); // Dependency on activeSearchIndex is correct here

    // Function to navigate to the previous search result
    const goToPreviousSearchResult = useCallback(() => {
        const highlightedMessageIds = Object.keys(searchResultRefs.current).filter(id => searchResultRefs.current[id]);
        if (highlightedMessageIds.length === 0) {
            setActiveSearchIndex(-1); // No results
            return;
        }

        let prevIndex = activeSearchIndex - 1;
        if (prevIndex < 0) {
            prevIndex = highlightedMessageIds.length - 1; // Loop to the end
        }
        setActiveSearchIndex(prevIndex);
    }, [activeSearchIndex]); // Dependency on activeSearchIndex is correct here

    // Expose search navigation functions via ref to the parent component
    useImperativeHandle(ref, () => ({
        goToNextSearchResult: goToNextSearchResult,
        goToPreviousSearchResult: goToPreviousSearchResult // Expose previous too
    }));

    // Reset search index and clear refs when search query changes or messages reset (e.g., new conversation)
    useEffect(() => {
        setActiveSearchIndex(-1); // No result active initially
        searchResultRefs.current = {}; // Clear all stored refs
    }, [messageSearchQuery, messages]); // Depend on messages to clear when conversation changes

    const getSenderDisplayName = (senderId, senderName) => {
        if (senderId === (currentUser?.uid || 'guest_noca_flow')) {
            return t('you', 'You');
        }
        return senderName || t('unknown_user', 'Unknown User');
    };

    const getSenderAvatar = (senderId, senderPhotoURL) => {
        if (senderId === (currentUser?.uid || 'guest_noca_flow')) {
            return currentUser?.photoURL || '/images/avatars/avatarguest.jpg';
        }
        return senderPhotoURL || '/images/default-avatar.jpg';
    };

    const highlightText = useCallback((text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark
                            key={index}
                            className="bg-yellow-400 text-black px-0.5 rounded"
                        >
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    }, []);

    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingMessageContent, setEditingMessageContent] = useState('');

    const startEditingMessage = useCallback((message) => {
        setEditingMessageId(message.id);
        setEditingMessageContent(message.content);
    }, []);

    const cancelEditingMessage = useCallback(() => {
        setEditingMessageId(null);
        setEditingMessageContent('');
    }, []);

    const saveEditedMessage = useCallback(async (messageId) => {
        if (editingMessageContent.trim() === '') {
            alert(t('message_cannot_be_empty', 'Le message ne peut pas être vide.'));
            return;
        }
        await onEditMessage(messageId, editingMessageContent);
        setEditingMessageId(null);
        setEditingMessageContent('');
    }, [editingMessageContent, onEditMessage, t]);


    return (
        // flex-1 will make this div take up all available vertical space
        // overflow-y-auto will make its content scroll if it exceeds the height
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
            {/* Search navigation controls */}
            {messageSearchQuery && Object.keys(searchResultRefs.current).length > 0 && (
                <div className="flex justify-center gap-4 items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md mb-2">
                    <button
                        onClick={goToPreviousSearchResult}
                        className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
                    >
                        ◀ {t('previous', 'Précédent')}
                    </button>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        {t('result_count', 'Résultat {{current}} sur {{total}}', { current: activeSearchIndex + 1, total: Object.keys(searchResultRefs.current).length })}
                    </p>
                    <button
                        onClick={goToNextSearchResult}
                        className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
                    >
                        {t('next', 'Suivant')} ▶
                    </button>
                </div>
            )}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-4">
                {messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        <p className="text-lg font-semibold">{t('no_messages', 'Aucun message pour l\'instant.')}</p>
                        <p className="text-sm mt-2">{t('start_conversation', 'Commencez une nouvelle conversation ou sélectionnez-en une.')}</p>
                    </div>
                ) : (
                    messages?.map((msg, index) => {
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const isFirstMessageInSequence = msg.senderUid !== prevMsg?.senderUid;
                        const shouldShowSenderName = activeConversationIsGroup || isFirstMessageInSequence;
                        const isMyMessage = msg.senderUid === currentFirebaseUid;
                        // For search, we now need to check msg.content OR attachment names
                        const messageMatchesSearch = messageSearchQuery && (
                            (msg.content?.toLowerCase().includes(messageSearchQuery.toLowerCase())) ||
                            (msg.attachments && msg.attachments.some(att => att.name?.toLowerCase().includes(messageSearchQuery.toLowerCase())))
                        );

                        return (
                            <div
                                key={msg.id}
                                className={`flex mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isMyMessage && (
                                    <img
                                        src={getSenderAvatar(msg.senderUid, msg.senderPhotoURL)}
                                        alt={getSenderDisplayName(msg.senderUid, msg.senderName)}
                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                    />
                                )}
                                <motion.div
                                    // Assign ref conditionally for search results
                                    ref={el => {
                                        if (messageMatchesSearch && el) { // Only assign if it matches and element exists
                                            searchResultRefs.current[msg.id] = el;
                                        } else {
                                            delete searchResultRefs.current[msg.id]; // Remove if no longer a match
                                        }
                                    }}
                                    className={`p-3 rounded-lg max-w-xs relative group ${
                                        isMyMessage
                                            ? 'bg-blue-600 text-white'
                                            : (isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800')
                                    }
                                    ${messageMatchesSearch ? 'relative animate-pulse-once' : ''} `} // Add pulse animation here for current result
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {shouldShowSenderName && (
                                        <p className="font-semibold text-sm mb-1">
                                            {getSenderDisplayName(msg.senderUid, msg.senderName)}
                                        </p>
                                    )}
                                    {/* --- DÉBUT : LOGIQUE DE RENDU DES MESSAGES ET PIÈCES JOINTES --- */}
                                    {editingMessageId === msg.id ? (
                                        <textarea
                                            value={editingMessageContent}
                                            onChange={(e) => setEditingMessageContent(e.target.value)}
                                            className="w-full text-sm resize-none p-1 rounded bg-gray-800 text-white"
                                            rows={Math.max(1, Math.ceil(editingMessageContent.length / 20))}
                                            autoFocus
                                            onBlur={() => saveEditedMessage(msg.id)} // Save on blur
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    saveEditedMessage(msg.id);
                                                } else if (e.key === 'Escape') {
                                                    cancelEditingMessage();
                                                }
                                            }}
                                        />
                                    ) : (
                                        <>
                                            {/* Rendu du contenu textuel du message (s'il existe) */}
                                            {msg.content && msg.content.trim() !== '' && (
                                                <p className="text-sm break-words">{highlightText(msg.content, messageSearchQuery)}</p>
                                            )}

                                            {/* Rendu des pièces jointes (s'il y en a) */}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {msg.attachments.map((attachment, attIndex) => (
                                                        <div key={attIndex} className="attachment-item">
                                                            {attachment.type === 'image' ? (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.name || 'Image jointe'}
                                                                    className="max-w-full h-auto rounded-md cursor-pointer"
                                                                    style={{ maxWidth: '200px' }} // Adjusted for a consistent size
                                                                    onClick={() => openEphemeralImagePreview && openEphemeralImagePreview(attachment.url, msg.id)}
                                                                />
                                                            ) : (
                                                                <a
                                                                    href={attachment.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download={attachment.name || 'fichier'}
                                                                    className={`flex items-center p-2 rounded-md transition-colors ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                                                                >
                                                                    {/* Icône de fichier générique */}
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                                                    <span className="text-sm truncate max-w-[150px]">{attachment.name || 'Fichier'}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {/* --- FIN : LOGIQUE DE RENDU DES MESSAGES ET PIÈCES JOINTES --- */}

                                    {/* Message Time and Status (Read/Unread) */}
                                    <div className={`text-xs mt-1 ${isMyMessage ? 'text-blue-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')} flex items-center justify-end`}>
                                        <span>{msg.displayTime}</span>
                                        {isMyMessage && (
                                            <span className="ml-1 flex items-center">
                                                {/* Single checkmark for sent/delivered (not read by all) */}
                                                {!msg.isReadByAllRecipients && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                )}
                                                {/* Double checkmark for read by all */}
                                                {msg.isReadByAllRecipients && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline><polyline points="15 6 9 12 4 7"></polyline></svg>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons (Edit, Delete) - Visible on hover for my messages */}
                                    {isMyMessage && editingMessageId !== msg.id && (
                                        <div className="absolute top-0 -left-16 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => startEditingMessage(msg)}
                                                title={t('edit_message', 'Modifier le message')}
                                                className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => onDeleteMessage(msg.id)}
                                                title={t('delete_message', 'Supprimer le message')}
                                                className={`p-1 rounded-full ml-1 ${isDarkMode ? 'bg-gray-800 text-red-400 hover:bg-gray-700' : 'bg-gray-100 text-red-600 hover:bg-gray-200'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })
                )}
                {/* Reference for auto-scrolling */}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
});

export default FlowLiveMessagesDisplay;