// components/dashboard/FlowLiveMessages/index.js
// src/components/dashboard/FlowLiveMessages/index.js
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react'; // Assure-toi que toutes ces dépendances sont là
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { initialMockData } from '../../../lib/mockData';
import { db, auth, storage } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs, where, doc, updateDoc, serverTimestamp, arrayUnion, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { format, isToday, isYesterday, isSameWeek, isSameDay, isSameYear, parseISO, isValid, differenceInMinutes, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// CORRECTION ICI : Importer les composants enfants
import FlowLiveMessagesSidebar from './FlowLiveMessagesSidebar';
import FlowLiveMessagesDisplay from './FlowLiveMessagesDisplay';
import FlowLiveMessagesInput from './FlowLiveMessagesInput';
import NewDiscussionModal from './modals/NewDiscussionModal'; // Assure-toi que ce chemin est correct
import { AssignTaskProjectDeadlineModal } from '../modals/AssignTaskProjectDeadlineModal'; // Si AssignTaskProjectDeadlineModal est dans un fichier séparé comme tu l'as uploadé


const FlowLiveMessages = forwardRef((props, ref) => {
  const {
    // ... other props
    t // Ensure t is destructured from props
  } = props;

  // ... (other logic)

  // Pass t to useChatLogic
  const {
    conversations,
    internalAvailableTeamMembers,
    messages,
    filteredMessages,
    showMobileSidebar,
    setShowMobileSidebar,
    markMessagesAsRead
  } = useChatLogic({
    user,
    currentFirebaseUid,
    activeConversationId, setActiveConversationId,
    setActiveConversationPartner, setActiveConversationIsGroup,
    setActiveConversationParticipants,
    currentUserName,
    activeConversationPartner,
    searchTerm,
    setConversations, setInternalAvailableTeamMembers, setMessages, setFilteredMessages,
    t, // <--- Ensure t is passed here
    formatMessageTimeDisplay, safeToDate, setEphemeralImagePreview, db
  });

  // Pass t to useChatActions
  const {
    handleSendMessage, handleFileUpload, handleEmoticonClick,
    handleSendNormalMessage, handleSendEphemeralMessage,
    handleAttachNormalFile, handleAttachEphemeralFile,
    openEphemeralImagePreview, closeEphemeralImagePreview
  } = useChatActions({
    user, handleLoginPrompt, newMessage, activeConversationId, currentFirebaseUid,
    t, // <--- Ensure t is passed here
    setNewMessage, fileInputRef, setEphemeralImagePreview, db, storage
  });

  // ... (other logic)

  return (
    <div ref={chatContainerRef} className={`h-full w-full shadow-lg rounded-lg overflow-hidden flex ${isFullScreen ? 'fixed inset-0 z-[1000] rounded-none' : ''} ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-color-bg-secondary text-color-text-primary'}`}>

      <FlowLiveMessagesSidebar
        // ... other props
        t={t} // <--- Ensure t is passed here
      />

      {(activeConversationId || !showMobileSidebar || isFullScreen) ? (
        <section className={`flex-1 h-full flex flex-col min-h-0 ${showMobileSidebar && !isFullScreen ? 'hidden md:flex' : 'flex w-full'}`}>
          {/* ... header section, ensure t is used */}
          <div className={`flex justify-between items-center px-4 py-3 border-b border-color-border-primary flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'}`}>
            <button onClick={() => setShowMobileSidebar(true)} className={`md:hidden mr-2 p-1 rounded-full ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`} aria-label={t('back_to_conversations', 'Retour aux conversations')}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
            <h3 className={`text-base font-semibold truncate max-w-[calc(100%-80px)] ${isDarkMode ? 'text-white' : 'text-color-text-primary'}`}>
                {activeConversationPartner}
                {activeConversationIsGroup && <span className={`text-xs ml-2 ${isDarkMode ? 'text-slate-400' : 'text-color-text-secondary'}`}>({t('group', 'Groupe')})</span>}
            </h3>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xs text-green-400 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span className="hidden sm:inline">{t('encrypted', 'Chiffré')}</span></span>
              <button className={`text-purple-500 hover:text-purple-600 text-xs font-medium flex items-center ${isDarkMode ? '' : 'text-color-text-secondary hover:text-purple-700'}`}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 hidden sm:inline-block"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg><span className="hidden sm:inline">+ {t('meeting', 'Meeting')}</span></button>
              <button className={`text-purple-500 hover:text-purple-600 text-xs font-medium flex items-center ${isDarkMode ? '' : 'text-color-text-secondary hover:text-purple-700'}`} onClick={handleOpenAddTaskModal}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 hidden sm:inline-block"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span className="hidden sm:inline">+ {t('task', 'Tâche')}</span></button>
              <div className="relative">
                <button className={`options-menu-button p-1 text-sm font-medium ${isDarkMode ? 'text-purple-500 hover:text-purple-600' : 'text-color-text-secondary hover:text-purple-700'}`} onClick={() => setShowOptionsMenu(!showOptionsMenu)}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
                {showOptionsMenu && (
                  <div className={`options-menu-panel absolute right-0 mt-2 rounded-md shadow-lg py-1 z-10 w-48 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'}`}>
                    <button className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 ${isDarkMode ? 'text-white' : 'text-color-text-primary hover:bg-color-bg-hover'}`} onClick={handleSendEphemeralMessage}>{t('send_ephemeral_message', 'Envoyer message éphémère (5min)')}</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 ${isDarkMode ? 'text-white' : 'text-color-text-primary hover:bg-color-bg-hover'}`} onClick={handleAttachEphemeralFile}>{t('send_ephemeral_image', 'Envoyer image éphémère (5min)')}</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 ${isDarkMode ? 'text-white' : 'text-color-text-primary hover:bg-color-bg-hover'}`}>{t('rename_contact', 'Renommer le contact')}</button>
                    <button className={`block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 ${isDarkMode ? 'text-red-400' : 'text-red-600 hover:bg-color-bg-hover'}`}>{t('block_contact', 'Bloquer le contact')}</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 border-b border-color-border-primary flex-shrink-0">
              <input type="text" placeholder={t('search_in_discussion_placeholder', 'Rechercher dans la discussion...')} className="form-input w-full text-sm py-1.5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>

          <FlowLiveMessagesDisplay
            messages={filteredMessages}
            chatPanelRef={chatPanelRef}
            currentFirebaseUid={currentFirebaseUid}
            activeConversationId={activeConversationId}
            activeConversationIsGroup={activeConversationIsGroup}
            isDarkMode={isDarkMode}
            openEphemeralImagePreview={openEphemeralImagePreview}
            t={t} // <--- Ensure t is passed here
          />

          <FlowLiveMessagesInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendNormalMessage={handleSendNormalMessage}
            handleAttachNormalFile={handleAttachNormalFile}
            handleEmoticonClick={handleEmoticonClick}
            emojis={emojis}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            emojiButtonRef={emojiButtonRef}
            isDarkMode={isDarkMode}
            t={t} // <--- Ensure t is passed here
          />
        </section>
      ) : (
        <div className={`flex-1 h-full flex items-center justify-center text-center p-4 md:hidden ${showMobileSidebar ? 'hidden' : 'flex'}`}>
          <p className="text-lg text-slate-400">{t('select_conv_left', 'Sélectionnez une conversation à gauche.')}</p>
        </div>
      )}

      {/* Ephemeral Image Preview Modal (remains here for simplicity of message lifecycle) */}
      {ephemeralImagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1001]"
          onClick={closeEphemeralImagePreview}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="relative p-4 max-w-full max-h-full flex items-center justify-center">
            <img src={ephemeralImagePreview.url} alt="Ephemeral" className="max-w-full max-h-full object-contain" onContextMenu={(e) => e.preventDefault()}/>
            <button onClick={closeEphemeralImagePreview} className="absolute top-4 right-4 text-white text-3xl p-2 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-70" title={t('close_ephemeral_image', 'Fermer l\'image éphémère')}>&times;</button>
            <div className="absolute bottom-4 text-white text-sm bg-gray-800 bg-opacity-70 px-3 py-1 rounded-full">{t('ephemeral_image_warning', 'Cette image est éphémère et ne peut pas être sauvegardée.')}</div>
          </div>
        </div>
      )}

      <NewDiscussionModal
        showModal={showNewDiscussionModal}
        onClose={() => setShowNewDiscussionModal(false)}
        onCreate={handleCreateNewDiscussion}
        internalAvailableTeamMembers={internalAvailableTeamMembers}
        currentFirebaseUid={currentFirebaseUid}
        currentUserName={currentUserName}
        t={t} // <--- Ensure t is passed here
      />
    </div>
  );
});

FlowLiveMessages.displayName = 'FlowLiveMessages';

export default FlowLiveMessages;