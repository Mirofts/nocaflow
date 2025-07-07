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
        // Ensure initialMockData and its conversations property are arrays
        // Note: In real app, conversations come from Firestore via onSnapshot in FlowLiveMessages/index.js
        // This part mainly handles initial prop synchronization if messagesProp or initialMockData change.
        if (initialMockData?.conversations) {
            setConversations(initialMockData.conversations);
        }

        // Initialize internal messages state with prop messages
        if (messagesProp) {
             setMessages(messagesProp);
        }

        // Set a default selected conversation if none is active and conversations exist
        // This logic will run on initial load and when initialMockData or messagesProp change.
        // The Firestore listener in FlowLiveMessages/index.js now handles the primary setting
        // of conversations and selectedConversationId.
    }, [initialMockData, messagesProp]); // Removed selectedConversationId from dependencies to avoid re-initializing if already selected

    // Effect to filter messages based on the selected conversation
    useEffect(() => {
        // `messages` state is updated by the Firestore listener in FlowLiveMessages/index.js
        // so `filteredMessages` simply reflects the `messages` state which are already
        // filtered by `selectedConversationId` in the `onSnapshot` callback.
        setFilteredMessages(messages || []);
    }, [messages]); // Re-run when `messages` state changes (which it does via Firestore listener)


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