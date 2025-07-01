// components/dashboard/FlowLiveMessages/FlowLiveMessagesSidebar.js
import React from 'react';

const FlowLiveMessagesSidebar = ({
  conversations,
  searchTerm,
  setSearchTerm,
  activeConversationId,
  handleSelectUserOnMobile,
  setShowNewDiscussionModal,
  currentUserName,
  showMobileSidebar,
  setShowMobileSidebar,
  isFullScreen,
  isDarkMode,
  t // <--- Ensure t is destructured from props
}) => {
  return (
    <aside className={`w-64 flex-shrink-0 flex flex-col border-r border-color-border-primary md:flex ${showMobileSidebar && !isFullScreen ? 'flex w-full md:w-64' : 'hidden'} ${isFullScreen ? 'hidden' : ''} ${isDarkMode ? 'bg-slate-800' : 'bg-color-bg-primary'}`}>
      <div className={`px-4 py-3 border-b border-color-border-primary shadow-sm flex-shrink-0 flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary'}`}>
        <h2 className="text-lg font-semibold">
          FLOW <span className="text-purple-500">Live</span> Messages
        </h2>
        <button
          className={`md:hidden p-1 rounded-full ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-color-text-secondary hover:text-color-text-primary hover:bg-color-bg-hover'}`}
          onClick={() => setShowMobileSidebar(false)}
          aria-label={t('close_sidebar', 'Fermer la barre latérale')}
          title={t('close_sidebar', 'Fermer la barre latérale')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
      <div className={`px-4 pb-3 text-sm ${isDarkMode ? 'bg-gray-800 text-slate-400' : 'text-color-bg-tertiary text-color-text-secondary'}`}>{currentUserName}</div>

      <div className="p-3 border-b border-color-border-primary flex-shrink-0">
        <input
          type="text"
          placeholder={t('search_conversation_placeholder', 'Rechercher conversation...')}
          className="form-input w-full text-sm py-1.5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {conversations.length === 0 ? (
          <div className={`text-center py-10 text-sm ${isDarkMode ? 'text-slate-500' : 'text-color-text-tertiary'}`}>{t('no_conversations', 'Aucune conversation. Créez-en une nouvelle !')}</div>
        ) : (
          conversations
            .filter(conv =>
              (conv.name && conv.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-200
                            ${conv.id === activeConversationId
                              ? (isDarkMode ? 'bg-gray-800' : 'bg-color-bg-tertiary')
                              : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-color-bg-hover')
                            }`}
                onClick={() => handleSelectUserOnMobile(conv)}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${conv.color} mr-3`}>
                    {conv.initials}
                  </div>
                  <div>
                    <div className={`font-medium truncate max-w-[160px] ${isDarkMode ? 'text-white' : 'text-color-text-primary'}`}>
                        {conv.name}
                        {!conv.isGroup && (
                          <span className={`ml-2 w-2 h-2 rounded-full inline-block ${conv.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} title={conv.isOnline ? t('online', 'En ligne') : t('offline', 'Hors ligne')}></span>
                        )}
                    </div>
                    <div className={`text-sm truncate max-w-[160px] ${isDarkMode ? 'text-gray-400' : 'text-color-text-secondary'}`}>{conv.lastMessage}</div>
                  </div>
                </div>
                {conv.unread > 0 && (
                  <div className="ml-auto bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {conv.unread}
                  </div>
                )}
              </div>
            ))
        )}
      </div>
      <div className="p-3 border-t border-color-border-primary flex-shrink-0">
        <button
          className="main-button-secondary bg-purple-500 hover:bg-purple-600 w-full py-2 rounded text-white"
          onClick={() => setShowNewDiscussionModal(true)}
        >
          {t('new_discussion_button', 'Nouvelle discussion')}
        </button>
      </div>
    </aside>
  );
};

FlowLiveMessagesSidebar.displayName = 'FlowLiveMessagesSidebar';
export default FlowLiveMessagesSidebar;