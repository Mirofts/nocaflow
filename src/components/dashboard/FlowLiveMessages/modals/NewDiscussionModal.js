// components/dashboard/FlowLiveMessages/modals/NewDiscussionModal.js
import React, { useState, useRef } from 'react';

const NewDiscussionModal = ({
  showModal,
  onClose,
  onCreate, // This will be the handleCreateNewDiscussion function from the parent
  internalAvailableTeamMembers,
  currentFirebaseUid,
  currentUserName,
  t
}) => {
  const [showNewContactInput, setShowNewContactInput] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [selectedTeamMemberUids, setSelectedTeamMemberUids] = useState([]);
  const [newDiscussionName, setNewDiscussionName] = useState('');
  const newContactNameRef = useRef(null); // Ref for autoFocus

  if (!showModal) return null;

  const handleSubmit = async () => {
    await onCreate({
      name: newDiscussionName,
      email: newContactEmail,
      selectedUids: selectedTeamMemberUids,
      showNewContact: showNewContactInput
    });
    setNewContactEmail('');
    setSelectedTeamMemberUids([]);
    setNewDiscussionName('');
    setShowNewContactInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4 text-white">{t('new_discussion_title', 'Nouvelle discussion')}</h3>

        <div className="mb-4 flex space-x-2">
          <button
            className={`flex-1 p-2 rounded-md font-semibold transition-colors ${!showNewContactInput ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setShowNewContactInput(false)}
          >
            {t('choose_team_member', 'Choisir membre d\'équipe')}
          </button>
          <button
            className={`flex-1 p-2 rounded-md font-semibold transition-colors ${showNewContactInput ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setShowNewContactInput(true)}
          >
            {t('add_new_email', 'Ajouter nouvel email')}
          </button>
        </div>

        {showNewContactInput ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('new_contact_name_placeholder', 'Nom du nouveau contact (simulé)')}
              className="form-input w-full"
              value={newDiscussionName}
              onChange={(e) => setNewDiscussionName(e.target.value)}
              ref={newContactNameRef}
              autoFocus={true}
            />
            <input
              type="email"
              placeholder={t('new_contact_email_placeholder', 'Email du nouveau contact (simulé)')}
              className="form-input w-full"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('discussion_name_optional', 'Nom de la discussion (facultatif si 1 seul membre)')}
              className="form-input w-full"
              value={newDiscussionName}
              onChange={(e) => setNewDiscussionName(e.target.value)}
              autoFocus={true}
            />
            <div className="max-h-60 overflow-y-auto custom-scrollbar mb-4 border border-gray-700 rounded-md">
              {internalAvailableTeamMembers.filter(member => member.firebaseUid !== currentFirebaseUid).map(member => (
                <div key={member.firebaseUid} className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0" onClick={() => {
                    setSelectedTeamMemberUids(prev =>
                        prev.includes(member.firebaseUid)
                            ? prev.filter(uid => uid !== member.firebaseUid)
                            : [...prev, member.firebaseUid]
                    );
                }}>
                  <input
                    type="checkbox"
                    className="mr-3 form-checkbox text-pink-500 rounded"
                    checked={selectedTeamMemberUids.includes(member.firebaseUid)}
                    onChange={() => {}}
                  />
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white bg-gray-500 mr-3 text-sm`}>
                      {member.initials}
                  </div>
                  <span className="text-white">{member.name}</span>
                </div>
              ))}
              {currentFirebaseUid && !selectedTeamMemberUids.includes(currentFirebaseUid) && (
                  <div className="flex items-center p-3 text-slate-500">
                      <input type="checkbox" className="mr-3" checked disabled />
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white bg-gray-500 mr-3 text-sm`}>
                          {currentUserName.charAt(0).toUpperCase()}
                      </div>
                      <span>{currentUserName} ({t('you', 'Vous')})</span>
                  </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="main-button-secondary bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">{t('cancel', 'Annuler')}</button>
          <button onClick={handleSubmit} className="main-action-button bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">{t('create_discussion', 'Créer la discussion')}</button>
        </div>
      </div>
    </div>
  );
};

NewDiscussionModal.displayName = 'NewDiscussionModal';
export default NewDiscussionModal;