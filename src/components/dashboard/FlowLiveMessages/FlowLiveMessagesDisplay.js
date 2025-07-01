// components/dashboard/FlowLiveMessages/FlowLiveMessagesDisplay.js
import React from 'react';

const FlowLiveMessagesDisplay = ({
  messages,
  chatPanelRef,
  currentFirebaseUid,
  activeConversationId,
  activeConversationIsGroup,
  isDarkMode,
  openEphemeralImagePreview,
  t // <--- Ensure t is destructured from props
}) => {
  return (
    <div ref={chatPanelRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar min-h-0">
      {messages.length === 0 && activeConversationId ? (
          <div className="text-center text-slate-500 py-10">{t('start_a_conversation', 'Commencez une conversation !')}</div>
      ) : messages.length === 0 && !activeConversationId ? (
           <div className="text-center text-slate-500 py-10">{t('select_or_create_new_conv', 'Sélectionnez une conversation ou créez-en une nouvelle.')}</div>
      ) : (
          messages.map((msg, idx) => (
              <div
              key={msg.id || idx}
              className={`max-w-[80%] p-2 rounded-lg w-fit ${
                  msg.senderUid === currentFirebaseUid
                  ? 'bg-purple-600 text-white ml-auto rounded-br-none'
                  : isDarkMode
                      ? 'bg-gray-700 text-white rounded-bl-none border border-gray-600'
                      : 'bg-[var(--color-message-other-bg-light)] text-[var(--color-message-other-text-light)] rounded-bl-none border border-gray-200'
              }`}
              >
              {activeConversationIsGroup && msg.senderUid !== currentFirebaseUid && <div className="text-xs font-semibold mb-1">{msg.from}</div>}
              {msg.type === 'image' ? (
                  msg.isEphemeral ? (
                    <button
                      onClick={() => openEphemeralImagePreview(msg.fileURL, msg.id)}
                      className="text-blue-300 underline block text-center"
                    >
                      {t('view_ephemeral_image', 'Voir l\'image éphémère')}
                    </button>
                  ) : (
                    <img src={msg.fileURL} alt="shared" className="max-w-[150px] sm:max-w-xs rounded-md" />
                  )
              ) : msg.type === 'file' ? (
                  <a href={msg.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">
                  {msg.content} ({t('file', 'Fichier')})
                  </a>
              ) : (
                  <div className="flex items-end justify-between gap-2">
                      <p className="leading-tight break-words pr-1 text-sm">{msg.content}</p>

                      <span className={`flex items-center text-[0.6rem] opacity-70 ${
                          msg.senderUid === currentFirebaseUid
                              ? 'text-purple-200'
                              : (isDarkMode ? 'text-gray-300' : 'text-gray-500')
                      } flex-shrink-0 whitespace-nowrap`}>
                          {msg.isEphemeral && (
                              <span className="mr-0.5" title={t('ephemeral', 'Éphémère')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              </span>
                          )}
                          {msg.displayTime}
                          {msg.senderUid === currentFirebaseUid && (
                              <span className="ml-0.5">
                                  {msg.status === 'read' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11 9 22l-7-7"/><path d="m22 4-7 11-4-5"/></svg>
                                  ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                  )}
                              </span>
                          )}
                      </span>
                  </div>
              )}
              </div>
          ))
      )}
    </div>
  );
};

FlowLiveMessagesDisplay.displayName = 'FlowLiveMessagesDisplay';
export default FlowLiveMessagesDisplay;