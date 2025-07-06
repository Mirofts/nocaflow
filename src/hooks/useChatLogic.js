// src/hooks/useChatLogic.js
import { useState, useEffect, useCallback } from 'react';

export const useChatLogic = (currentUser, initialMockData, messagesProp) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]); // Internal state for messages
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] = useState(false);
    const [newDiscussionModalInitialContact, setNewDiscussionModalInitialContact] = useState(null);
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    // Initialize conversations and messages from props or mock data
    useEffect(() => {
        const userConversations = initialMockData.conversations || []; // Ensure conversations is an array
        setConversations(userConversations);
        setMessages(messagesProp || []); // Initialize internal messages state with prop messages
        
        // Try to select a default conversation if none is selected
        if (!selectedConversationId && userConversations.length > 0) {
            setSelectedConversationId(userConversations[0].id);
        }
    }, [initialMockData, messagesProp, selectedConversationId]); // Added selectedConversationId to deps

    // Filter messages based on selected conversation
    useEffect(() => {
        const currentConv = conversations.find(conv => conv.id === selectedConversationId);
        if (currentConv) {
            setFilteredMessages(currentConv.messages || []); // Ensure messages are an array
        } else {
            setFilteredMessages([]);
        }
    }, [selectedConversationId, conversations]);

    // Handle search query
    useEffect(() => {
        if (activeSearchQuery) {
            // Re-filter conversations if search query changes
            // (The filteredConversations in Sidebar will handle this, so this might not be strictly needed here)
        }
    }, [activeSearchQuery]);


    // Return all necessary states and setters
    return {
        conversations,
        selectedConversationId,
        filteredMessages,
        setSelectedConversationId, // <-- Guaranteed to be returned
        setConversations,
        setMessages, // <-- Guaranteed to be returned
        isNewDiscussionModalOpen,
        setIsNewDiscussionModalOpen,
        newDiscussionModalInitialContact,
        setNewDiscussionModalInitialContact,
        activeSearchQuery,
        setActiveSearchQuery
    };
};