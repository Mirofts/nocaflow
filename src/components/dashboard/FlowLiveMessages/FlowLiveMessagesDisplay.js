// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesDisplay.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Import sub-components if any
// import ChatBubble from './ChatBubble'; // Assuming you have a ChatBubble component

const FlowLiveMessagesDisplay = ({
    messages,
    currentUser,
    onMessageAction,
    onOpenAddTaskFromChat,
    availableTeamMembers,
    t,
    isFullScreen,
    handleSelectUserOnMobile
}) => {
    const { isDarkMode } = useTheme();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isGuest = currentUser?.uid === 'guest_noca_flow';

    const getSenderDisplayName = (senderId, senderName) => {
        if (senderId === (currentUser?.uid || 'guest_noca_flow')) {
            return t('you', 'You');
        }
        return senderName || t('unknown_user', 'Unknown User');
    };

    const getSenderAvatar = (senderId, senderPhotoURL) => {
        if (senderId === (currentUser?.uid || 'guest_noca_flow')) {
            return currentUser?.photoURL || '/images/default-avatar.jpg';
        }
        return senderPhotoURL || '/images/default-avatar.jpg';
    };

    return (
        <div className={`flex-1 flex flex-col ${isFullScreen ? 'h-full' : 'h-full'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {t('live_chat', 'Live Chat')}
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Added optional chaining for messages - Removed problematic comment syntax */}
                {messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <p className="text-lg font-semibold">{t('no_messages', 'Aucun message pour l\'instant.')}</p>
                        <p className="text-sm mt-2">{t('start_conversation', 'Commencez une nouvelle conversation ou sélectionnez-en une.')}</p>
                    </div>
                ) : (
                    messages?.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex mb-4 ${msg.senderId === (currentUser?.uid || 'guest_noca_flow') ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.senderId !== (currentUser?.uid || 'guest_noca_flow') && (
                                <img
                                    src={getSenderAvatar(msg.senderId, msg.senderPhotoURL)}
                                    alt={getSenderDisplayName(msg.senderId, msg.senderName)}
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                            )}
                            <motion.div
                                className={`p-3 rounded-lg max-w-xs ${
                                    msg.senderId === (currentUser?.uid || 'guest_noca_flow')
                                        ? 'bg-blue-600 text-white'
                                        : (isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800')
                                }`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.15 }}
                            >
                                <p className="font-semibold text-sm mb-1">
                                    {getSenderDisplayName(msg.senderId, msg.senderName)}
                                </p>
                                <p className="text-sm break-words">{msg.text || ''}</p>
                                <p className={`text-right text-xs mt-1 ${msg.senderId === (currentUser?.uid || 'guest_noca_flow') ? 'text-blue-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                    {format(new Date(msg.timestamp), 'HH:mm', { locale: fr })}
                                </p>
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {msg.actions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onMessageAction(msg.id, action.type, action.payload)}
                                                className={`text-xs px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-800'} hover:opacity-80 transition-opacity`}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default FlowLiveMessagesDisplay;