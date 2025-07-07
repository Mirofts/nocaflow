// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesDisplay.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext'; // Chemin corrigé
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
    activeConversationIsGroup // Nouvelle prop pour savoir si c'est un groupe
}) => {
    const { isDarkMode } = useTheme();
    const messagesEndRef = useRef(null);
    const isInitialMount = useRef(true);

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            const timeout = setTimeout(() => {
                scrollToBottom('instant');
            }, 100);
            isInitialMount.current = false;
            return () => clearTimeout(timeout);
        } else {
            scrollToBottom('smooth');
        }
    }, [messages, scrollToBottom]);

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
                        <mark key={index} className="bg-yellow-400 text-black px-0.5 rounded">
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
        <div className={`flex-1 flex flex-col ${isFullScreen ? 'h-full' : 'h-full'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <p className="text-lg font-semibold">{t('no_messages', 'Aucun message pour l\'instant.')}</p>
                        <p className="text-sm mt-2">{t('start_conversation', 'Commencez une nouvelle conversation ou sélectionnez-en une.')}</p>
                    </div>
                ) : (
                    messages?.map((msg, index) => {
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        // Show sender name if it's a group chat, OR if the sender changes, OR if it's the very first message
                        // We also hide it if it's "You" in a non-group context.
                        // For messages sent by the current user, we always show "You" if it's the first in a sequence or the very first message.
                        const isFirstMessageInSequence = msg.senderUid !== prevMsg?.senderUid;
                        const shouldShowSenderName = activeConversationIsGroup || isFirstMessageInSequence;

                        return (
                            <div
                                key={msg.id}
                                className={`flex mb-4 ${msg.senderUid === currentFirebaseUid ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.senderUid !== currentFirebaseUid && (
                                    <img
                                        src={getSenderAvatar(msg.senderUid, msg.senderPhotoURL)}
                                        alt={getSenderDisplayName(msg.senderUid, msg.senderName)}
                                        className="w-8 h-8 rounded-full mr-2 object-cover"
                                    />
                                )}
                                <motion.div
                                    className={`p-3 rounded-lg max-w-xs relative group ${
                                        msg.senderUid === currentFirebaseUid
                                            ? 'bg-blue-600 text-white'
                                            : (isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800')
                                    }`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {/* Hide sender name if it's the current user AND previous message was also from current user (sequential) */}
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
                                        <a
                                            href={msg.fileURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-300 hover:underline text-sm flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2-8a4 4 0 01-2 7.74H5.66A5 5 0 0110 4.5V2a1 1 0 011-1h2a1 1 0 011 1v2.5A4 4 0 0122 8z"/></svg>
                                            {msg.content}
                                        </a>
                                    )}
                                    <div className={`flex items-center mt-1 text-xs ${msg.senderUid === currentFirebaseUid ? 'justify-end text-blue-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                        {editingMessageId === msg.id ? (
                                            <>
                                                <button onClick={() => saveEditedMessage(msg.id)} className="text-green-300 hover:text-green-500 mr-2" title={t('save', 'Sauvegarder')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                                                </button>
                                                <button onClick={cancelEditingMessage} className="text-red-300 hover:text-red-500" title={t('cancel', 'Annuler')}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {/* Edit/Delete icons for own messages */}
                                                {msg.senderUid === currentFirebaseUid && (
                                                    <div className="absolute top-0.5 right-0.5 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEditingMessage(msg)} className="text-gray-200 hover:text-white p-0.5 rounded-full bg-black/20" title={t('edit_message', 'Modifier le message')}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                                        </button>
                                                        <button onClick={() => onDeleteMessage(msg.id)} className="text-red-300 hover:text-red-500 p-0.5 rounded-full bg-black/20" title={t('delete_message', 'Supprimer le message')}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                        </button>
                                                    </div>
                                                )}
                                                <span>{msg.displayTime}</span>
                                                {/* Read status icon for own messages */}
                                                {msg.senderUid === currentFirebaseUid && (
                                                    <span className="ml-1">
                                                        {msg.isReadByAllRecipients ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400" title={t('read_by_all', 'Lu par tous')}>
                                                                <path d="M17.3 6.3L12 11.6l-2.7-2.7L7.6 10l4.4 4.4L18.7 7.7z"/><path d="M2 12s5 9 10 9 10-9 10-9-5-9-10-9-10 9-10 9z"/><circle cx="12" cy="12" r="3"/>
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" title={t('not_read_by_all', 'Non lu par tous')}>
                                                                <path d="M2 12s5 9 10 9 10-9 10-9-5-9-10-9-10 9-10 9z"/><circle cx="12" cy="12" r="3"/>
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {msg.isEphemeral && (
                                        <span className="absolute top-1 right-1 text-xs text-orange-300" title={t('ephemeral_message', 'Message éphémère')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        </span>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} className="h-4 pb-4" />
            </div>
        </div>
    );
};

export default FlowLiveMessagesDisplay;