// src/components/dashboard/FlowLiveMessages/FlowLiveMessagesInput.js
import React from 'react';

const FlowLiveMessagesInput = ({
  newMessage,
  setNewMessage,
  handleSendNormalMessage,
  handleTriggerFileInput, // Corrected: This prop is now passed from index.js
  handleFileChange,       // Corrected: This prop is now passed from index.js
  handleEmoticonClick,
  emojis,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiButtonRef,
  fileInputRef,
  isDarkMode,
  t,
  handleSendEphemeralMessage,
  // Removed handleAttachEphemeralFile as it's replaced by handleTriggerFileInput('ephemeral')
  activeConversationId,
  isGuestMode
}) => {

  const isSendDisabled = !activeConversationId || !newMessage.trim();
  const isAttachDisabled = !activeConversationId;

  return (
    <div className="flex items-end p-3 sm:p-4 border-t border-color-border-primary glass-card-input flex-shrink-0 relative">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleFileChange} // Connect the onChange handler here
      />
      {/* Normal File Button */}
      <button
        className="text-gray-400 hover:text-purple-500 p-2 rounded"
        onClick={() => handleTriggerFileInput('normal')} // Call the new trigger function
        title={t('attach_file', 'Joindre un fichier')}
        disabled={isAttachDisabled || isGuestMode}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.2"/></svg>
      </button>

      {/* Ephemeral File Button */}
      <button
        className="text-gray-400 hover:text-orange-500 p-2 rounded ml-1"
        onClick={() => handleTriggerFileInput('ephemeral')} // Call the new trigger function
        title={t('attach_ephemeral_file', 'Joindre un fichier éphémère (disparaît après lecture)')}
        disabled={isAttachDisabled || isGuestMode}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <path d="M14 2v6h6"></path>
            <circle cx="12" cy="13" r="3"></circle>
            <path d="M16 11l-4 4-4-4"></path>
        </svg>
      </button>

      <div className="relative">
        <button
          ref={emojiButtonRef}
          className="text-gray-400 hover:text-purple-500 p-2 rounded"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title={t('pick_emoji', 'Choisir un emoji')}
          disabled={isGuestMode}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
        </button>
        {showEmojiPicker && (
          <div className="emoji-picker-panel absolute bottom-full mb-2 left-0 bg-gray-800 rounded-lg shadow-lg p-2 grid grid-cols-6 sm:grid-cols-8 gap-1 border border-gray-700 w-full max-h-48 overflow-y-auto sm:w-64">
            {emojis.map((emoji, index) => (
              <span
                key={index}
                className="cursor-pointer text-xl p-1 hover:bg-gray-700 rounded-md flex items-center justify-center"
                onClick={() => {
                  handleEmoticonClick(emoji);
                  setShowEmojiPicker(false); // Close emoji picker after selection
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
      <textarea
        className="flex-1 mx-2 sm:mx-3 form-input form-input-glow min-w-0 resize-none bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-purple-500 focus:ring-purple-500 text-xs py-1.5"
        placeholder={t('write_here_placeholder', 'Écrire ici')}
        rows={1}
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isSendDisabled && !isGuestMode) {
                handleSendNormalMessage();
            }
          }
        }}
        disabled={!activeConversationId || isGuestMode}
      />
      {/* Normal Send Button */}
      <button
        className={`main-action-button bg-purple-500 hover:bg-purple-600 text-white p-2 rounded transition-colors duration-200 ${isSendDisabled || isGuestMode ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSendNormalMessage}
        title={t('send_message', 'Envoyer le message')}
        disabled={isSendDisabled || isGuestMode}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>
      </button>
      {/* Ephemeral Send Button */}
      <button
        className={`main-action-button bg-orange-500 hover:bg-orange-600 text-white p-2 rounded transition-colors duration-200 ml-2 ${isSendDisabled || isGuestMode ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSendEphemeralMessage}
        title={t('send_ephemeral_message_btn', 'Envoyer le message éphémère')}
        disabled={isSendDisabled || isGuestMode}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </button>
    </div>
  );
};

FlowLiveMessagesInput.displayName = 'FlowLiveMessagesInput';
export default FlowLiveMessagesInput;