// src/components/dashboard/modals/TeamMemberModal.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ModalWrapper } from './ModalWrapper';

// --- Default Avatars (MAKE SURE THESE PATHS EXIST IN public/images/avatars/) ---
const defaultAvatars = [
    '/images/avatars/chloe.jpg',
    '/images/avatars/david.jpg',
    '/images/avatars/elena.jpg',
    '/images/avatars/leo.jpg',
    '/images/avatars/marcus.jpg',
    '/images/avatars/sophia.jpg',
    '/images/avatars/default-avatar.jpg' // Add a generic default here too, as a fallback example
];

// --- Icon Components ---
const MailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const AtSignIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>;
const LinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>;
const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;

const TeamMemberModal = ({ mode, member, onSave, onDelete, onClose, t }) => {
    // States for general member info (used in both add/edit)
    const [name, setName] = useState(''); // Display name for new member, actual name for existing
    const [role, setRole] = useState('');
    const [email, setEmail] = useState(''); // Email for existing member, or used to build for new if 'email' method
    const [avatar, setAvatar] = useState(defaultAvatars[0]); // Current avatar selected/displayed

    // States specific to 'add' mode (invitation methods, link generation)
    const [addMethod, setAddMethod] = useState('email'); // 'email' or 'id'
    const [identifier, setIdentifier] = useState(''); // The actual email or user ID for invitation
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false); // New: for loading state during API calls
    const [error, setError] = useState('');

    // Effect to initialize state when modal opens or mode/member changes
    useEffect(() => {
        if (mode === 'edit' && member) {
            // Populate fields for editing an existing member
            setName(member.name || '');
            setRole(member.role || '');
            setEmail(member.email || '');
            setAvatar(member.avatar || '/images/avatars/default-avatar.jpg'); // Fallback to default if no avatar
            // Reset add-specific states
            setAddMethod('email'); // Default to email tab for consistency
            setIdentifier('');
            setGeneratedUrl('');
            setCopySuccess('');
        } else if (mode === 'add') {
            // Reset fields for adding a new member
            setName('');
            setRole('Membre'); // Default role for new members
            setEmail(''); // Ensure email is empty, as it comes from identifier for add mode
            setAvatar(defaultAvatars[0]); // Set initial selected avatar to the first one
            setAddMethod('email'); // Default to email invitation
            setIdentifier('');
            setGeneratedUrl('');
            setCopySuccess('');
        }
    }, [mode, member]); // Re-run effect if mode or member prop changes

    const handleSubmit = async (e) => { // Made async for API calls
        e.preventDefault(); // Prevent default form submission behavior
        setIsLoading(true); // Start loading

        try {
            if (mode === 'add') {
                // Validation for adding a new member
                if (!name.trim()) {
                    alert(t("please_enter_display_name", "Veuillez entrer un nom d'affichage."));
                    return;
                }
                if (!role.trim()) {
                    alert(t("please_enter_role", "Veuillez entrer un rôle."));
                    return;
                }
                if (addMethod === 'email' && !identifier.trim()) {
                    alert(t("please_enter_email", "Veuillez entrer un email."));
                    return;
                }

                // Data to send to the backend for invitation
                const invitationData = {
                    memberName: name.trim(),
                    memberRole: role.trim(),
                    memberAvatar: avatar,
                    inviteMethod: addMethod,
                    inviteIdentifier: identifier.trim(),
                    // Include the sender's info if needed for the email (e.g., fromAuthUser.displayName)
                };

                // --- CALL BACKEND API FOR INVITATION ---
                const response = await fetch('/api/invite-member', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invitationData),
                });

                const result = await response.json();

                if (response.ok) {
                    setGeneratedUrl(result.joinUrl); // Store the generated URL from backend
                    alert(t('invitation_sent_or_link_generated', 'Invitation envoyée (ou lien généré) !'));

                    // For the frontend's local data management:
                    // We add the member as 'pending' until they accept the invitation via the link.
                    const memberDataForFrontend = {
                        id: result.memberId || `temp-${Date.now()}`, // Backend should return an ID, else temporary
                        name: name.trim(),
                        role: role.trim(),
                        email: addMethod === 'email' ? identifier.trim() : '',
                        avatar: avatar,
                        status: 'pending', // Mark as pending until actual registration via link
                        // Store the invitation token or URL if needed for display/tracking
                        invitationUrl: result.joinUrl,
                    };
                    onSave(memberDataForFrontend); // Update frontend state with pending member
                    onClose(); // Close the modal
                } else {
                    setError(result.error || t('invitation_failed', 'Échec de l\'invitation. Veuillez réessayer.'));
                }

            } else if (mode === 'edit') {
                // Validation for editing an existing member
                if (!name.trim() || !role.trim() || !email.trim()) {
                    alert(t("please_fill_all_fields", "Veuillez remplir tous les champs."));
                    return;
                }

                const memberData = {
                    id: member.id, // Use existing ID for update
                    name: name.trim(),
                    role: role.trim(),
                    email: email.trim(),
                    avatar: avatar,
                };
                onSave(memberData); // Call the onSave function passed from dashboard.js
                onClose(); // Close the modal
            }
        } catch (error) {
            console.error("Error during member operation:", error);
            setError(t('an_error_occurred', 'Une erreur est survenue.'));
        } finally {
            setIsLoading(false); // End loading
        }
    };

    const handleDelete = () => {
        if (member && window.confirm(t('confirm_delete_member', 'Êtes-vous sûr de vouloir supprimer ce membre ?'))) {
            onDelete(member.id); // Call the onDelete function passed from dashboard.js
            onClose(); // Close the modal
        }
    };

    const generateDirectUrl = async () => {
        setIsLoading(true);
        try {
            if (!name || !role || !avatar) {
                alert(t("define_name_role_avatar_for_link", "Veuillez définir un nom, un rôle et un avatar pour générer le lien."));
                return;
            }

            // This should ideally make an API call to your backend to generate a secure token and URL.
            // It uses the same /api/invite-member endpoint with 'id' method.
            const invitationData = {
                memberName: name.trim(),
                memberRole: role.trim(),
                memberAvatar: avatar,
                inviteMethod: 'id', // Force 'id' method for direct link generation
                inviteIdentifier: '', // No specific identifier needed for direct link
            };

            const response = await fetch('/api/invite-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invitationData),
            });

            const result = await response.json();

            if (response.ok) {
                setGeneratedUrl(result.joinUrl);
                alert(t('link_generated', 'Lien généré !'));
            } else {
                setError(result.error || t('link_generation_failed', 'Échec de la génération du lien.'));
            }
        } catch (error) {
            console.error("Error generating direct link:", error);
            setError(t('an_error_occurred', 'Une erreur est survenue lors de la génération du lien.'));
        } finally {
            setIsLoading(false);
        }
    };


    const copyToClipboard = () => {
        if (!generatedUrl) {
            alert(t('no_link_to_copy', 'Aucun lien à copier. Générez-en un d\'abord.'));
            return;
        }
        navigator.clipboard.writeText(generatedUrl).then(() => {
            setCopySuccess(t('copied', 'Copié !'));
            setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
        }, () => {
            setCopySuccess(t('error', 'Erreur'));
        });
    };

    return (
        <ModalWrapper onClose={onClose}>
            {/* Added padding for overall modal content */}
            <div className="p-1 sm:p-6">
                <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                    {mode === 'add' ? (
                        // PlusCircle Icon SVG for Add mode
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                    ) : (
                        // Edit Icon SVG for Edit mode
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                    )}
                    {mode === 'add' ? t('add_member_title', 'Ajouter un membre') : t('edit_member_title', 'Modifier le membre')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Display error message */}
                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

                    {/* Section 1: Choose Avatar (only for Add mode) */}
                    {mode === 'add' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('choose_avatar', '1. Choisir un avatar')}</label>
                            {/* MODIFIED: Use grid for 2 rows of 3 avatars */}
                            <div className="grid grid-cols-3 gap-4 justify-items-center">
                                {defaultAvatars.map(avatarPath => (
                                    <Image
                                        key={avatarPath}
                                        src={avatarPath}
                                        alt="Avatar"
                                        width={64} // Set a fixed width
                                        height={64} // Set a fixed height
                                        onClick={() => setAvatar(avatarPath)} // Update the 'avatar' state
                                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full cursor-pointer transition-all duration-200 object-cover ${avatar === avatarPath ? 'ring-4 ring-pink-500 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 2: Define Information (for both modes) */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('define_info', '2. Définir les informations')}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                value={name} // 'name' state is used for both modes' display name
                                onChange={e => setName(e.target.value)}
                                placeholder={t('member_name_placeholder', "Nom du membre...")}
                                className="form-input"
                                required
                                disabled={isLoading}
                            />
                            <input
                                type="text"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                placeholder={t('member_role_placeholder', 'Rôle...')}
                                className="form-input"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Section 3: Invite Member (only for Add mode) */}
                    {mode === 'add' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('invite_member', '3. Inviter le membre')}</label>
                                <div className="flex bg-slate-800 p-1 rounded-lg mb-4">
                                    {/* Inline Tailwind styles for tab-buttons for guaranteed application if not global */}
                                    <button
                                        type="button"
                                        onClick={() => { setAddMethod('email'); setIdentifier(''); setGeneratedUrl(''); setError(''); }} // Clear on method change
                                        className={`flex-grow flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${addMethod === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                                        disabled={isLoading}
                                    >
                                        <MailIcon /> {t('by_email', 'Par Email')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setAddMethod('id'); setIdentifier(''); setGeneratedUrl(''); setError(''); }} // Clear on method change
                                        className={`flex-grow flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${addMethod === 'id' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                                        disabled={isLoading}
                                    >
                                        <AtSignIcon /> {t('by_id', 'Par ID')}
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div key={addMethod} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <input
                                            type={addMethod === 'email' ? 'email' : 'text'}
                                            value={identifier}
                                            onChange={e => setIdentifier(e.target.value)}
                                            placeholder={addMethod === 'email' ? t('email_example_placeholder', "email@exemple.com") : t('user_id_placeholder', "ID de l'utilisateur...")}
                                            className="form-input"
                                            required={addMethod === 'email'} // Email is required if method is email
                                            disabled={isLoading} // Disable input when loading
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Optional: Generate Direct Link (only for Add mode) */}
                            <div className="mb-6 p-4 bg-slate-800 rounded-lg">
                                <label className="block text-sm font-medium text-slate-300 mb-3">{t('optional_generate_link', 'Optionnel : Générer un lien d\'accès direct')}</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <motion.button
                                        type="button"
                                        onClick={generateDirectUrl}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-grow main-button-secondary"
                                        disabled={isLoading || !name.trim() || !role.trim() || !avatar} // Disable if crucial info missing
                                    >
                                        <LinkIcon /> {t('generate_link', 'Générer le lien')}
                                    </motion.button>
                                    {generatedUrl && (
                                        <motion.button
                                            type="button"
                                            onClick={copyToClipboard}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="main-button-tertiary"
                                            disabled={isLoading} // Disable button when loading
                                        >
                                            <CopyIcon/> {copySuccess || t('copy', 'Copier')}
                                        </motion.button>
                                    )}
                                </div>
                                {generatedUrl && (
                                    <p className="text-xs text-slate-400 mt-3 break-all bg-slate-900 p-2 rounded">
                                        {generatedUrl}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Email for Edit Mode (always visible in edit mode) */}
                    {mode === 'edit' && (
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('member_email_placeholder', 'Email...')} className="form-input" required disabled={isLoading} />
                    )}

                    {/* Action Buttons */}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 main-action-button"
                        disabled={isLoading} // Disable button when loading
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('processing', 'Traitement...')}
                            </div>
                        ) : (
                            mode === 'add' ? t('add_member_button', 'Ajouter le membre') : t('save_changes', 'Sauvegarder les changements')
                        )}
                    </motion.button>

                    {/* Delete Button (only for Edit mode) */}
                    {mode === 'edit' && (
                        <motion.button
                            type="button"
                            onClick={handleDelete}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white mt-2 main-button-secondary"
                            disabled={isLoading} // Disable button when loading
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            {t('delete_member_button', 'Supprimer le membre')}
                        </motion.button>
                    )}
                </form>
            </div>
        </ModalWrapper>
    );
};

export default TeamMemberModal;