// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesDisplay.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import FlowLiveMessagesInput from './FlowLiveMessagesInput';
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
    handleSelectUserOnMobile,
    openEphemeralImagePreview
}) => {
    const { isDarkMode } = useTheme();
    const messagesEndRef = useRef(null);

    // ✅ ICI les states et refs nécessaires au composant Input
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiButtonRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojis = ['😀', '😅', '😍', '😎', '😭', '👍', '🔥', '💯'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

useEffect(() => {
  const timeout = setTimeout(() => {
    if (messages?.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, 50); // petit délai pour éviter le jump au chargement

  return () => clearTimeout(timeout);
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
            return currentUser?.photoURL || '/images/avatars/avatarguest.jpg'; // Use specific guest avatar
        }
        return senderPhotoURL || '/images/default-avatar.jpg'; // Default for other users
    };

    return (
        <div className={`flex-1 flex flex-col ${isFullScreen ? 'h-full' : 'h-full'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Removed the 'Live Chat' header */}

            <div className="flex-1 overflow-y-auto p-4">
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
                            className={`flex mb-4 ${msg.senderUid === (currentUser?.uid || 'guest_noca_flow') ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.senderUid !== (currentUser?.uid || 'guest_noca_flow') && (
                                <img
                                    src={getSenderAvatar(msg.senderUid, msg.senderPhotoURL)}
                                    alt={getSenderDisplayName(msg.senderUid, msg.senderName)}
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                            )}
                            <motion.div
                                className={`p-3 rounded-lg max-w-xs ${
                                    msg.senderUid === (currentUser?.uid || 'guest_noca_flow')
                                        ? 'bg-blue-600 text-white'
                                        : (isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800')
                                }`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.15 }}
                            >
                                <p className="font-semibold text-sm mb-1">
                                    {getSenderDisplayName(msg.senderUid, msg.senderName)}
                                </p>
                                {msg.type === 'text' && <p className="text-sm break-words">{msg.content || ''}</p>}
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
                                <p className={`text-right text-xs mt-1 ${msg.senderUid === (currentUser?.uid || 'guest_noca_flow') ? 'text-blue-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                    {msg.displayTime}
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
            {currentUser && (
  <div className="flex gap-2 p-2 border-t bg-gray-900">
    <Button onClick={openNewTask}>Nouvelle tâche</Button>
    <Button onClick={openMeeting}>Réunion</Button>
    <Button onClick={blockUser}>Bloquer</Button>
  </div>
)}
            <div className="border-t p-2 bg-gray-900">
  <FlowLiveMessagesInput
    newMessage={newMessage}
    setNewMessage={setNewMessage}
    handleSendNormalMessage={handleSendNormalMessage}
    handleSendEphemeralMessage={handleSendEphemeralMessage}
    handleAttachNormalFile={handleAttachNormalFile}
    handleAttachEphemeralFile={handleAttachEphemeralFile}
    handleEmoticonClick={handleEmoticonClick}
    emojiButtonRef={emojiButtonRef}
    fileInputRef={fileInputRef}
    showEmojiPicker={showEmojiPicker}
    setShowEmojiPicker={setShowEmojiPicker}
    isAttachDisabled={isAttachDisabled}
    isSendDisabled={isSendDisabled}
    isGuestMode={isGuestMode}
    activeConversationId={activeConversationId}
    emojis={emojis}
    t={t}
  />
</div>
        </div>
    );
};

export default FlowLiveMessagesDisplay;