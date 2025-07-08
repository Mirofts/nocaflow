// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesDisplay.js
import React, { useRef, useState, useCallback, useEffect } from 'react';
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
        // flex-1 will make this div take up all available vertical space
        // overflow-y-auto will make its content scroll if it exceeds the height
        // A minimal padding-bottom is still beneficial here for the last message
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
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
                                    {/* Removed h-4 div, as padding-bottom on container handles spacing */}
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

export default FlowLiveMessagesDisplay;