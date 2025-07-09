// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesDisplay.js
import React, { useRef, useState, useCallback, useEffect, forwardRef } from 'react';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';



const FlowLiveMessagesDisplay = ({
    messages,
    currentUser,
    onMessageAction,
    availableTeamMembers,
    t,
    isFullScreen,
    handleSelectUserOnMobile,
    openEphemeralImagePreview,
    currentFirebaseUid,
    onEditMessage,
    onDeleteMessage,
    messageSearchQuery,
    activeConversationIsGroup
}) => {
    const { isDarkMode } = useTheme();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null); // Ref for the messages container
    const [activeSearchIndex, setActiveSearchIndex] = useState(0);
const searchResultRefs = useRef([]);

const hasMountedRef = useRef(false);

// Fonction qui fait défiler jusqu'au résultat suivant
const goToNextSearchResult = () => {
  if (searchResultRefs.current.length > 0) {
    setActiveSearchIndex((prev) => (prev + 1) % searchResultRefs.current.length);
  }
};

const goToPreviousSearchResult = () => {
  if (searchResultRefs.current.length > 0) {
    setActiveSearchIndex((prev) =>
      (prev - 1 + searchResultRefs.current.length) % searchResultRefs.current.length
    );
  }
};

useEffect(() => {
  if (hasMountedRef.current) {
if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  } else {
    hasMountedRef.current = true; // évite le scroll au premier chargement
  }
}, [messages]);
useEffect(() => {
  if (searchResultRefs.current[activeSearchIndex]) {
    searchResultRefs.current[activeSearchIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}, [activeSearchIndex]);

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

    searchResultRefs.current = [];

    const highlightText = useCallback((text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark
  key={index}
  ref={(el) => {
    if (el) {
      searchResultRefs.current.push(el);
    }
  }}
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

useEffect(() => {
  // Si on efface la recherche, on repart de zéro
  if (!messageSearchQuery) {
    setActiveSearchIndex(0);
  }
}, [messageSearchQuery]);



    return (
        // flex-1 will make this div take up all available vertical space
        // overflow-y-auto will make its content scroll if it exceeds the height
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
            {messageSearchQuery && searchResultRefs.current.length > 0 && (
  <div className="flex justify-center gap-4 items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md mb-2">
    <button
      onClick={goToPreviousSearchResult}
      className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
    >
      ◀ Précédent
    </button>
    <p className="text-sm text-gray-700 dark:text-gray-200">
      Résultat {activeSearchIndex + 1} sur {searchResultRefs.current.length}
    </p>
    <button
      onClick={goToNextSearchResult}
      className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
    >
      Suivant ▶
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
                                    className={`p-3 rounded-lg max-w-xs relative group ${
                                        isMyMessage
                                            ? 'bg-blue-600 text-white'
                                            : (isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800')
                                    }`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {shouldShowSenderName && (
                                        <p className="font-semibold text-sm mb-1">
                                            {getSenderDisplayName(msg.senderUid, msg.senderName)}
                                        </p>
                                    )}
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
                                        msg.type === 'text' && <p className="text-sm break-words">{highlightText(msg.content || '', messageSearchQuery)}</p>
                                    )}

                                    {msg.type === 'image' && msg.fileURL && (
                                        <img
                                            src={msg.fileURL}
                                            alt={msg.content || 'Image'}
                                            className="max-w-full h-auto rounded-md cursor-pointer"
                                            onClick={() => msg.isEphemeral ? openEphemeralImagePreview(msg.fileURL, msg.id) : window.open(msg.fileURL, '_blank')}
                                            style={{ maxWidth: '200px' }}
                                        />
                                    )}

                                    {msg.type === 'file' && msg.fileURL && (
  <div className="flex items-center space-x-2 mt-1">
    <span className="text-xl">📄</span>
    <a
      href={msg.fileURL}
      target="_blank"
      rel="noopener noreferrer"
      download={msg.content || 'fichier'}
      className="underline hover:text-blue-200 truncate max-w-[180px]"
    >
      {msg.content || 'Fichier'}
    </a>
  </div>
)}

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
};


const FlowLiveMessagesDisplayWithRef = forwardRef((props, ref) => (
  <FlowLiveMessagesDisplay {...props} forwardedRef={ref} />
));

export default FlowLiveMessagesDisplayWithRef;