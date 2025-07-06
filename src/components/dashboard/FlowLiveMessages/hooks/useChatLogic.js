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
        const userConversations = initialMockData?.conversations || [];
        setConversations(userConversations);

        // Initialize internal messages state with prop messages
        setMessages(messagesProp || []);

        // Set a default selected conversation if none is active and conversations exist
        // This logic will run on initial load and when initialMockData or messagesProp change.
        if (!selectedConversationId && userConversations.length > 0) {
            setSelectedConversationId(userConversations[0].id);
        }
    }, [initialMockData, messagesProp, selectedConversationId]); // Added selectedConversationId to re-evaluate default selection

    // Effect to filter messages based on the selected conversation
    useEffect(() => {
        const currentConv = conversations.find(conv => conv.id === selectedConversationId);
        // Ensure currentConv and its messages are valid before setting
        if (currentConv) {
            setFilteredMessages(currentConv.messages || []);
        } else {
            setFilteredMessages([]); // Clear filtered messages if no conversation is selected
        }
    }, [selectedConversationId, conversations]); // Re-run when selectedConversationId or conversations change

    // Effect to filter conversations based on search query (for the sidebar display)
    // This logic is actually handled by the FlowLiveMessagesSidebar directly using filteredConversations.
    // The activeSearchQuery is part of the state, but filtering isn't done here for messages.

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