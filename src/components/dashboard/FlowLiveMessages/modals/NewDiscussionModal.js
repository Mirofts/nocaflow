// components/dashboard/FlowLiveMessages/modals/NewDiscussionModal.js
import React, { useState, useRef } from 'react';
import Image from 'next/image'; // Import Image component

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
    // Basic validation before calling onCreate
    if (showNewContactInput && (!newDiscussionName.trim() || !newContactEmail.trim())) {
        alert(t('fill_all_new_contact_fields', 'Veuillez remplir le nom et l\'email pour le nouveau contact.'));
        return;
    }
    if (!showNewContactInput && selectedTeamMemberUids.length === 0) {
        alert(t('select_members_for_discussion', 'Veuillez sélectionner au moins un membre pour la discussion.'));
        return;
    }

    await onCreate({
      name: newDiscussionName,
      email: newContactEmail,
      selectedUids: selectedTeamMemberUids,
      showNewContact: showNewContactInput
    });
    // Reset form state after submission
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
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <input
              type="email"
              placeholder={t('new_contact_email_placeholder', 'Email du nouveau contact (simulé)')}
              className="form-input w-full"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
              {internalAvailableTeamMembers.filter(member => member.uid !== currentFirebaseUid).map(member => ( // Use member.uid
                <div key={member.uid} className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0" onClick={() => {
                    setSelectedTeamMemberUids(prev =>
                        prev.includes(member.uid) // Use member.uid
                            ? prev.filter(uid => uid !== member.uid) // Use member.uid
                            : [...prev, member.uid] // Use member.uid
                    );
                }}>
                  <input
                    type="checkbox"
                    className="mr-3 form-checkbox text-pink-500 rounded"
                    checked={selectedTeamMemberUids.includes(member.uid)} // Use member.uid
                    onChange={() => {}} // Controlled by div onClick
                  />
                  {/* Display avatar if available, otherwise initials */}
                  {member.photoURL ? (
                    <Image src={member.photoURL} alt={member.displayName || member.name} width={28} height={28} className="rounded-full mr-3 object-cover" />
                  ) : (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white bg-gray-500 mr-3 text-sm`}>
                        {(member.displayName || member.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-white">{member.displayName || member.name}</span>
                </div>
              ))}
              {currentFirebaseUid && !selectedTeamMemberUids.includes(currentFirebaseUid) && (
                  <div className="flex items-center p-3 text-slate-500">
                      <input type="checkbox" className="mr-3" checked disabled />
                      {/* Display current user's avatar or initials */}
                      {currentUser?.photoURL ? (
                        <Image src={currentUser.photoURL} alt={currentUserName} width={28} height={28} className="rounded-full mr-3 object-cover" />
                      ) : (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white bg-gray-500 mr-3 text-sm`}>
                            {currentUserName.charAt(0).toUpperCase()}
                        </div>
                      )}
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