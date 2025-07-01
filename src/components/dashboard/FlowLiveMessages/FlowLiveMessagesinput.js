// components/dashboard/FlowLiveMessages/FlowLiveMessagesInput.js
import React from 'react';

const FlowLiveMessagesInput = ({
  newMessage,
  setNewMessage,
  handleSendNormalMessage,
  handleAttachNormalFile,
  handleEmoticonClick,
  emojis,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiButtonRef,
  isDarkMode,
  t // <--- Ensure t is destructured from props
}) => {
  return (
    <div className="flex items-end p-3 sm:p-4 border-t border-color-border-primary glass-card-input flex-shrink-0 relative">
      <input
        type="file"
        ref={null} // Ref managed by parent (FlowLiveMessages/index.js)
        className="hidden"
      />
      <button
        className="text-gray-400 hover:text-purple-500 p-2 rounded"
        onClick={handleAttachNormalFile}
        title={t('attach_file', 'Joindre un fichier')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.2"/></svg>
      </button>
      <div className="relative">
        <button
          ref={emojiButtonRef}
          className="text-gray-400 hover:text-purple-500 p-2 rounded"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title={t('pick_emoji', 'Choisir un emoji')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
        </button>
        {showEmojiPicker && (
          <div className="emoji-picker-panel absolute bottom-full mb-2 left-0 bg-gray-800 rounded-lg shadow-lg p-2 grid grid-cols-6 sm:grid-cols-8 gap-1 border border-gray-700 w-full max-h-48 overflow-y-auto sm:w-64">
            {emojis.map((emoji, index) => (
              <span
                key={index}
                className="cursor-pointer text-xl p-1 hover:bg-gray-700 rounded-md flex items-center justify-center"
                onClick={() => handleEmoticonClick(emoji)}
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
            handleSendNormalMessage();
          }
        }}
      />
      {/* Normal Send Button */}
      <button
        className="main-action-button bg-purple-500 hover:bg-purple-600 text-white p-2 rounded transition-colors duration-200"
        onClick={handleSendNormalMessage}
        title={t('send_message', 'Envoyer le message')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>
      </button>
      {/* Ephemeral Send Button - Removed direct handler, will pass from parent */}
      <button
        className="main-action-button bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors duration-200 ml-2"
        onClick={() => { /* Handled in parent via options menu for now */ }}
        title={t('send_ephemeral_message_btn', 'Envoyer le message éphémère')}
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