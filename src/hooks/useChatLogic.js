// src/hooks/useChatLogic.js
import { useState, useEffect, useCallback } from 'react';

export const useChatLogic = (currentUser, initialMockData, messagesProp) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] = useState(false);
    const [newDiscussionModalInitialContact, setNewDiscussionModalInitialContact] = useState(null);
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    useEffect(() => {
        if (messagesProp) {
             setMessages(messagesProp);
        }
    }, [initialMockData, messagesProp]);

    useEffect(() => {
        if (!activeSearchQuery) {
            setFilteredMessages(messages || []);
        } else {
            const lowerQuery = activeSearchQuery.toLowerCase();
            const filtered = (messages || []).filter((msg) =>
                msg.content?.toLowerCase().includes(lowerQuery)
            );
            setFilteredMessages(filtered);
        }
    }, [messages, activeSearchQuery]);

    return {
        conversations,
        selectedConversationId,
        filteredMessages,
        setSelectedConversationId,
        setConversations,
        setMessages,
        isNewDiscussionModalOpen,
        setIsNewDiscussionModalOpen,
        newDiscussionModalInitialContact,
        setNewDiscussionModalInitialContact,
        activeSearchQuery,
        setActiveSearchQuery
    };
};