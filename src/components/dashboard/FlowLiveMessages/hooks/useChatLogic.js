// src/hooks/useChatLogic.js
import { useState, useEffect, useCallback } from 'react';

export const useChatLogic = (currentUser, initialMockData, messagesProp) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]); // Internal state for messages, synchronized with messagesProp
    const [filteredMessages, setFilteredMessages] = useState([]); // Messages displayed based on active conversation
    const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] = useState(false);
    const [newDiscussionModalInitialContact, setNewDiscussionModalInitialContact] = useState(null);
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    // Effect to initialize conversations from mock data or set default selected conversation
    useEffect(() => {
        // This part mainly handles initial prop synchronization if messagesProp or initialMockData change.
        // The primary source of conversations is the Firestore onSnapshot in FlowLiveMessages/index.js.
        // This hook's `setConversations` will be overwritten by the parent's `setConversations` passed from the hook return.
        if (initialMockData?.conversations) {
            // setConversations(initialMockData.conversations); // Commented out as index.js handles primary conv state
        }

        // Initialize internal messages state with prop messages
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


    // Return all necessary states and setters for FlowLiveMessages (index.js)
    return {
        conversations,
        selectedConversationId,
        filteredMessages,
        setSelectedConversationId,
        setConversations,
        setMessages, // setMessages is passed back for sync with messagesProp
        isNewDiscussionModalOpen,
        setIsNewDiscussionModalOpen,
        newDiscussionModalInitialContact,
        setNewDiscussionModalInitialContact,
        activeSearchQuery,
        setActiveSearchQuery
    };
};