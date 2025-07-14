// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesSidebar.js
import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';

const FlowLiveMessagesSidebar = ({
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    onNewDiscussionClick,
    activeSearchQuery,
    setActiveSearchQuery,
    currentUser,
    t,
    isFullScreen,
    handleSelectUserOnMobile
}) => {
    const { isDarkMode } = useTheme();

    const currentUserId = currentUser?.uid === 'guest_noca_flow' ? 'guest_noca_flow' : currentUser?.uid;

    const filteredConversations = useMemo(() => {
        if (!activeSearchQuery) {
            return conversations;
        }
        return conversations.filter(conv =>
            (conv.name?.toLowerCase().includes(activeSearchQuery.toLowerCase())) ||
            (conv.lastMessage?.toLowerCase().includes(activeSearchQuery.toLowerCase())) ||
            (conv.attachments && conv.attachments.some(att => att.name?.toLowerCase().includes(activeSearchQuery.toLowerCase())))
        );
    }, [conversations, activeSearchQuery]);

    const handleConversationClick = useCallback((convId) => {
        if (typeof setSelectedConversationId === 'function') {
            setSelectedConversationId(convId);
        } else {
            console.error("setSelectedConversationId is not a function in FlowLiveMessagesSidebar.");
        }
    }, [setSelectedConversationId]);

    const getLastMessageDisplay = useCallback((conv) => {
        return conv.lastMessage || t('no_messages_yet', 'Aucun message pour l\'instant.');
    }, [t]);


    return (
        <div className={`relative flex flex-col h-full ${isFullScreen ? 'w-full md:w-1/3 lg:w-1/4' : 'w-full md:w-1/3 lg:w-1/4'} border-r ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-50'}`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{t('conversations_title', 'Conversations')}</h3>
                <input
                    type="text"
                    placeholder={t('search_short', 'Recherche')}
                    className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    value={activeSearchQuery}
                    onChange={(e) => setActiveSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConversations.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 p-4">{t('no_conversations', 'Aucune conversation trouvée.')}</p>
                ) : (
                    filteredConversations.map(conv => {
                        const otherParticipant = conv.participantsDetails?.find(p => p.uid !== currentUserId);
                        const displayPhotoURL = conv.isGroup ? '/images/default-group-avatar.png' : (otherParticipant?.photoURL || '/images/avatars/default-avatar.jpg');
                        const isOnline = otherParticipant?.isOnline;

                        return (
                            <motion.div
                                key={conv.id || conv.name || `conv-${Math.random()}`}
                                className={`flex items-center p-3 border-b cursor-pointer transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${selectedConversationId === conv.id ? (isDarkMode ? 'bg-indigo-700 bg-opacity-30' : 'bg-indigo-50') : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
                                onClick={() => handleConversationClick(conv.id)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="relative">
                                    <img
                                        src={displayPhotoURL}
                                        alt={conv.name || t('unknown_user', 'Utilisateur inconnu')}
                                        className="w-10 h-10 rounded-full mr-3 object-cover"
                                    />
                                    {isOnline && (
                                        <span className="absolute bottom-0 right-3 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    {/* CORRECTION : On ajoute un conteneur flex pour aligner le nom et l'ID */}
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="font-semibold text-gray-800 dark:text-white truncate">
                                            {conv.name || t('new_chat', 'Nouveau chat')}
                                        </h4>
                                        {/* AJOUT : Affiche l'ID si ce n'est pas un groupe et si l'ID existe */}
                                        {!conv.isGroup && otherParticipant?.customId && (
                                            <span className="text-xs text-slate-500 font-mono">
                                                ({otherParticipant.customId})
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {getLastMessageDisplay(conv)}
                                    </p>
                                </div>
                                {conv.unread > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                                        {conv.unread}
                                    </span>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>

            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                <motion.button
                    onClick={onNewDiscussionClick}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    <span>{t('start_new_discussion', 'Nouvelle discussion')}</span>
                </motion.button>
            </div>
        </div>
    );
};

export default FlowLiveMessagesSidebar;