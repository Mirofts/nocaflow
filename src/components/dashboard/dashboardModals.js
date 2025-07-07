// components/dashboard/modals.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { format, parseISO, isToday, isValid, intervalToDuration } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

// Avatars NocaFlow prédéfinis (réutilisés ici)
// MODIFICATION ICI : Chemins mis à jour pour correspondre à vos fichiers réels
const nocaflowAvatars = [
    '/images/avatars/avatarguest.jpg', // Vous avez avatarguest.jpg
    '/images/avatars/chloe.jpg',
    '/images/avatars/david.jpg',
    '/images/avatars/default-avatar.jpg', // Vous avez default-avatar.png
    '/images/avatars/elena.jpg',
    '/images/avatars/leo.jpg',
    '/images/avatars/marcus.jpg',
    '/images/avatars/sophia.jpg',
    '/images/avatars/yves.jpg', // Vous avez yves.jpg
];

// --- Conteneur de Modale Standardisé ---
const ModalWrapper = ({ children, onClose, size = 'max-w-md' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`glass-card p-6 sm:p-8 rounded-2xl w-full relative ${size}`}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      {children}
    </motion.div>
  </motion.div>
);
// --- Modale d'Édition de Tâche ---
const TaskEditModal = ({ task, onSave, onClose, t }) => {
  const [title, setTitle] = useState(task.title || '');
  const [priority, setPriority] = useState(task.priority || 'normal');
  const [deadline, setDeadline] = useState(task.deadline ? format(parseISO(task.deadline), 'yyyy-MM-dd') : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    // CORRECTED: Ensure onSave is called with the full task object for editing
    await onSave({ ...task, title: title.trim(), priority, deadline: deadline || null });
    setLoading(false);
    onClose();
  };

  const priorityOptions = [
    { id: 'urgent', text: t('priority_urgent', 'Urgent'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M12 11.5a3 3 0 1 0 0 7 3 3 0 0 0 0-7Z"/><path d="M12 2C8.68 2 6 4.68 6 8a6 6 0 0 0 5.09 5.92c.32.32.69.64 1.11.9L22 22 20 20l-3.51-3.51A6 6 0 0 0 12 2Z"/></svg>, color: 'red' },
    { id: 'normal', text: t('priority_normal', 'Normal'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>, color: 'sky' },
    { id: 'cold', text: t('priority_cold', 'Froid'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M2 12h20"/><path d="M12 2V22"/><path d="m4 16 1.4-1.4A4.5 4.5 0 0 1 8.8 12c.7-.7 1.5-1 2.3-1.2l.9-.1C13 10.5 14 10 14 9a2 2 0 0 0-2-2c-.7 0-1.4.2-2 .5L8 6"/><path d="m20 8-1.4 1.4A4.5 4.5 0 0 1 15.2 12c-.7.7-1.5 1-2.3 1.2l-.9.1C11 13.5 10 14 10 15a2 2 0 0 0 2 2c.7 0-1.4-.2-2-.5L16 18"/></svg>, color: 'slate' }
  ];

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('edit_task_title', 'Modifier la tâche')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="taskTitle" className="block text-slate-300 text-sm mb-2 font-medium">{t('task_title_label', 'Titre de la tâche')}</label>
          <input id="taskTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-2 font-medium">{t('priority_label', 'Priorité')}</label>
          <div className="flex justify-center items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1.5">
            {priorityOptions.map(opt => (
              <button key={opt.id} type="button" onClick={() => setPriority(opt.id)} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${priority === opt.id ? `bg-${opt.color}-500 text-white shadow-lg` : 'text-slate-300 hover:bg-slate-700'}`}>
                {opt.icon}{opt.text}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="taskDeadline" className="block text-slate-300 text-sm mb-2 font-medium">{t('deadline_label', 'Échéance')}</label>
          <input id="taskDeadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="form-input" />
        </div>
        <button type="submit" disabled={loading} className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg !mt-8 disabled:opacity-50 main-action-button">
          {loading ? t('saving', 'Sauvegarde...') : t('save_changes', 'Sauvegarder les changements')}
        </button>
      </form>
    </ModalWrapper>
  );
};
// --- Modale des Détails du Jour (Calendrier) ---
const DayDetailsModal = ({ data, onAddTask, onClose, t }) => {
    const { date, events } = data;

    const eventTypeMap = {
        meeting: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg>, label: t('event_meeting', 'Réunion') },
        task: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: t('event_task', 'Tâche') },
        project: { icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, label: t('event_project', 'Projet') },
    };

    const getEventType = (event) => {
        if (event.dateTime) return eventTypeMap.meeting;
        if (event.progress !== undefined) return eventTypeMap.project;
        return eventTypeMap.task;
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4 text-center capitalize">
                {isToday(date) ? t('today', "Aujourd'hui") : format(date, 'eeee dd MMMM', { locale: fr })}
            </h2>
            <p className="text-slate-400 text-center mb-6">{t('day_events_summary', 'Voici les événements prévus pour ce jour.')}</p>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {Array.isArray(events) && events.length > 0 ? events.map(event => {
                    const type = getEventType(event);
                    return (
                        <div key={event.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
                            <div className="flex-shrink-0">{type.icon}</div>
                            <div>
                                <p className="font-bold text-white">{event.title || event.name}</p>
                                <p className="text-xs text-slate-400">
                                    {type.label}
                                    {event.dateTime && isValid(parseISO(event.dateTime)) ? ` ${t('at', 'à')} ${format(parseISO(event.dateTime), 'HH:mm')}` : ''}
                                    {event.deadline && isValid(parseISO(event.deadline)) ? ` ${t('until', 'jusqu\'au')} ${format(parseISO(event.deadline), 'dd/MM/yy')}` : ''}
                                </p>
                            </div>
                        </div>
                    );
                }) : <p className="text-slate-400 text-center py-4">{t('no_events_for_day', 'Aucun événement pour ce jour.')}</p>}
            </div>
            <motion.button
                onClick={() => { onClose(); onAddTask(date); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2.5 rounded-lg hover:from-pink-600 hover:to-violet-600 transition-all shadow-lg main-action-button"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                {t('add_event_for_day', 'Ajouter un événement pour ce jour')}
            </motion.button>
        </ModalWrapper>
  );
};

// --- Modale d'Ajout Rapide de Tâche (Réutilisée par DayDetailsModal) ---
const QuickAddTaskModal = ({ date, onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('task');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);

        if (type === 'task') {
            // CORRECTED: Pass only the title string to onSave (addTodo)
            await onSave(title.trim());
        } else if (type === 'note') {
            alert(t('note_feature_placeholder', 'Fonctionnalité d\'ajout de note non implémentée directement ici.'));
        } else if (type === 'meeting') {
            alert(t('meeting_feature_placeholder', 'Fonctionnalité d\'ajout de réunion non implémentée directement ici.'));
        } else if (type === 'project-deadline') {
            alert(t('project_deadline_feature_placeholder', 'Fonctionnalité d\'ajout de deadline de projet non implémentée directement ici.'));
        }

        setLoading(false);
        onClose();
    };

    const eventTypeOptions = [
        { id: 'task', label: t('add_type_task', 'Tâche'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
        { id: 'note', label: t('add_type_note', 'Note'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> },
        { id: 'meeting', label: t('add_type_meeting', 'Réunion'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg> },
        { id: 'project-deadline', label: t('add_type_deadline', 'Deadline Projet'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    ];

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4 text-center">{t('add_event_title_for', 'Ajouter un événement pour le')} {format(date, 'dd MMMM', { locale: fr })}</h2>

            <div className="mb-4 flex justify-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1.5">
                {eventTypeOptions.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setType(option.id)}
                        className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold
                                    ${type === option.id ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        {option.icon} {option.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('event_title_placeholder', 'Titre de l\'événement...')}
                    className="form-input mb-4"
                    required
                    autoFocus
                />
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 main-action-button"
                >
                    {loading ? t('adding', 'Ajout...') : t('add_event', 'Ajouter l\'événement')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};
// --- Modale pour changer le nom de l'invité ---
const GuestNameEditModal = ({ currentName, onSave, onClose, t }) => {
    const [name, setName] = useState(currentName);
    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {t('edit_guest_name_title', 'Modifier votre pseudo')}
            </h2>
            <form onSubmit={e => { e.preventDefault(); onSave(name); onClose(); }}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input text-center text-lg mb-6 w-full" autoFocus placeholder={t('guest_name_placeholder', 'Votre pseudo')} />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg main-action-button"
                >
                    {t('save', 'Sauvegarder')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

// --- Modale pour changer le nom d'utilisateur connecté ---
const UserNameEditModal = ({ currentUser, onClose, t }) => {
    const { refreshUser } = useAuth();
    const [name, setName] = useState(currentUser?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError(t('name_empty_error', 'Le nom ne peut pas être vide.'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (currentUser && currentUser.uid) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userDocRef, {
                    displayName: name.trim()
                });
                if (refreshUser) {
                    await refreshUser();
                }
                onClose();
            } else {
                setError(t('user_not_found', 'Utilisateur non trouvé.'));
            }
        } catch (err) {
            console.error("Error updating user display name:", err);
            setError(t('update_name_error', 'Erreur lors de la mise à jour du nom.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {t('edit_user_name_title', 'Modifier votre nom')}
            </h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input text-center text-lg mb-4 w-full"
                    autoFocus
                    placeholder={t('your_name_placeholder', 'Votre nom')}
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50 main-action-button"
                >
                    {loading ? t('saving', 'Sauvegarde...') : t('save', 'Sauvegarder')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

// --- Modale pour changer l'avatar ---
const AvatarEditModal = ({ onClose, t, isGuestMode, onUpdateGuestAvatar }) => {
    const { user, refreshUser } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('upload');

    useEffect(() => {
    if (isGuestMode && typeof window !== 'undefined') {
        const guestData = JSON.parse(localStorage.getItem('nocaflow_guest_data') || '{}');
        // MODIFICATION ICI: guestData.user?.photoURL pour récupérer l'avatar du guest
        if (guestData.user?.photoURL) {
            setPreviewUrl(guestData.user.photoURL);
        }
    } else if (user?.photoURL) {
        setPreviewUrl(user.photoURL);
    }
    }, [user, isGuestMode]);

    const handleFileChange = (e) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
        setError(t('select_image_error', "Veuillez sélectionner un fichier image."));
        setSelectedFile(null);
        setPreviewUrl('');
        return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError(t('file_size_error', "Le fichier est trop volumineux (max 5MB)."));
            setSelectedFile(null);
            setPreviewUrl('');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    } else {
        setSelectedFile(null);
        setPreviewUrl('');
    }
    };

    const uploadAndSaveAvatar = async (url) => {
    setLoading(true);
    setError('');
    try {
        if (isGuestMode) {
            // MODIFICATION ICI: Passe l'URL de l'avatar et met à jour l'objet user du guest
            onUpdateGuestAvatar(url);
        } else {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                photoURL: url,
            });
            if (refreshUser) {
                await refreshUser();
            }
        }
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            onClose();
        }, 1500);
    } catch (err) {
        console.error("Error updating avatar:", err);
        setError(t('avatar_upload_error', "Échec de l'upload de l'avatar. Veuillez réessayer."));
    } finally {
        setLoading(false);
    }
    };

    const handleUpload = async () => {
    if (!selectedFile) {
        setError(t('no_file_selected', "Aucun fichier sélectionné."));
        return;
    }
    if (isGuestMode) {
        uploadAndSaveAvatar(previewUrl);
    } else {
        if (!user || !user.uid) {
            setError(t('user_not_connected', "Utilisateur non connecté."));
            return;
        }
        setLoading(true);
        try {
            const avatarRef = ref(storage, `avatars/${user.uid}/${selectedFile.name}`);
            const uploadResult = await uploadBytes(avatarRef, selectedFile);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            await uploadAndSaveAvatar(downloadURL);
        } catch (err) {
            console.error("Error uploading image to storage:", err);
            setError(t('storage_upload_error', "Erreur lors du téléchargement vers le stockage."));
            setLoading(false);
        }
    }
    };

    const handleChooseAvatar = (avatarUrl) => {
    setSelectedFile(null);
    setPreviewUrl(avatarUrl);
    uploadAndSaveAvatar(avatarUrl);
    };

    return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]"
        onClick={onClose}
    >
        <div className="glass-card p-8 rounded-2xl max-w-xl w-full relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {t('change_avatar_title', 'Changer votre avatar')}
        </h2>

        {!success ? (
            <div className="space-y-6">
            <div className="flex justify-center mb-4">
                <button
                    className={`px-4 py-2 rounded-l-lg text-sm font-semibold transition-colors ${activeTab === 'upload' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    onClick={() => setActiveTab('upload')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                    {t('upload_tab', 'Télécharger')}
                </button>
                <button
                    className={`px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors ${activeTab === 'choose' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    onClick={() => setActiveTab('choose')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    {t('choose_tab', 'Choisir')}
                </button>
            </div>

            {activeTab === 'upload' && (
                <div className="space-y-4 text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100"
                        disabled={loading}
                    />

                    {previewUrl && (
                    <div className="mt-4">
                        <p className="text-slate-400 text-sm mb-2">{t('preview', 'Aperçu')} :</p>
                        <Image src={previewUrl} alt={t('preview', 'Aperçu')} width={120} height={120} className="rounded-full mx-auto object-cover border border-slate-700" />
                    </div>
                    )}

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || loading}
                        className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-md text-lg disabled:opacity-50 disabled:animate-none main-action-button"
                    >
                    {loading ? (t('uploading') || 'Téléchargement...') : (t('upload_and_validate', 'Télécharger et Valider'))}
                    </button>
                </div>
            )}

            {activeTab === 'choose' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto custom-scrollbar p-2">
                    {nocaflowAvatars.map((avatar, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.6)' }}
                            onClick={() => handleChooseAvatar(avatar)}
                            className="rounded-full overflow-hidden cursor-pointer aspect-square border-4 transition-all duration-200"
                            style={{ borderColor: previewUrl === avatar ? '#ec4899' : 'transparent' }}
                        >
                            <Image src={avatar} alt={`Avatar ${index + 1}`} width={100} height={100} className="w-full h-full object-cover" />
                        </motion.div>
                    ))}
                </div>
            )}
            </div>
        ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p className="text-xl font-semibold text-white">{t('avatar_updated_success', 'Avatar mis à jour !')}</p>
            </motion.div>
        )}
        </div>
    </motion.div>
);
};

// --- Modale pour Planifier une Réunion (Legacy, si encore utilisée directement) ---
const MeetingSchedulerModal = ({ onSchedule, isGuest, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(new Date(), 'HH:mm'));
    const [attendees, setAttendees] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isGuest) {
            alert(t('guest_feature_disabled', "L'ajout de réunions est désactivé en mode invité. Veuillez vous inscrire pour profiter de toutes les fonctionnalités !"));
            return;
        }
        onSchedule({ id: `meeting-${Date.now()}`, createdAt: new Date().toISOString(), dateTime: `${date}T${time}:00`, title, attendees: (attendees || '').split(',').map(e => e.trim()) });
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg>
                {t('schedule_meeting_title', 'Planifier une réunion')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder={t('meeting_title_placeholder', 'Titre de la réunion...')} className="form-input" required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="form-input"/>
                    <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="form-input"/>
                </div>
                {isGuest && <p className="text-xs text-amber-400 text-center flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    {t('guest_feature_restricted', 'Fonctionnalité réservée aux membres inscrits.')}</p>}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isGuest ? 'bg-slate-600 cursor-not-allowed' : 'pulse-button bg-gradient-to-r from-violet-600 to-indigo-600'} main-action-button`}
                >
                    {t('schedule', 'Planifier')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

// --- Modale pour Créer/Éditer un Projet ---
const ProjectFormModal = ({ initialData = {}, onSave, onDelete, onClose, isGuest, t }) => {
    const [name, setName] = useState(initialData.name || '');
    const [client, setClient] = useState(initialData.client || '');
    const [progress, setProgress] = useState(initialData.progress || 0);
    const [deadline, setDeadline] = useState(initialData.deadline ? format(parseISO(initialData.deadline), 'yyyy-MM-dd') : '');
    const [paidAmount, setPaidAmount] = useState(initialData.paidAmount || '');
    const [nextPayment, setNextPayment] = useState(initialData.nextPayment || '');
    const [totalAmount, setTotalAmount] = useState(initialData.totalAmount || '');
    const [staff, setStaff] = useState(initialData.staff || []);
    const [googleDriveLink, setGoogleDriveLink] = useState(initialData.googleDriveLink || '');


    const handleSubmit = (e) => {
        e.preventDefault();
        if (isGuest) {
            alert(t('guest_feature_disabled_project', "L'ajout/modification de projets est désactivé en mode invité. Veuillez vous inscrire !"));
            return;
        }
        if (!name.trim()) return;

        const projectData = {
            id: initialData.id || `proj-${Date.now()}`,
            createdAt: initialData.createdAt || new Date().toISOString(),
            name: name.trim(),
            client: client.trim(),
            progress: Number(progress),
            deadline: deadline || null,
            paidAmount: paidAmount.trim(),
            nextPayment: nextPayment.trim(),
            totalAmount: totalAmount.trim(),
            staff: staff,
            googleDriveLink: googleDriveLink.trim() || null
        };
        onSave(projectData);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {/* Briefcase Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {initialData.id ? t('edit_project_title', 'Modifier le projet') : t('create_project_title', 'Créer un nouveau projet')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={t('project_name_placeholder', 'Nom du projet...')} className="form-input" required />
                <input type="text" value={client} onChange={e=>setClient(e.target.value)} placeholder={t('client_name_placeholder', 'Nom du client...')} className="form-input" />

                {/* Champs supplémentaires pour le projet */}
                <div>
                    <label htmlFor="projectProgress" className="block text-slate-300 text-sm mb-2 font-medium">{t('progress', 'Progression')} (%)</label>
                    <input id="projectProgress" type="number" value={progress} onChange={e => setProgress(e.target.value)} min="0" max="100" className="form-input" />
                </div>
                <div>
                    <label htmlFor="projectDeadline" className="block text-slate-300 text-sm mb-2 font-medium">{t('deadline', 'Échéance')}</label>
                    <input id="projectDeadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="form-input" />
                </div>
                <input type="text" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder={t('paid_amount_placeholder', 'Déjà payé (€)...')} className="form-input" />
                <input type="text" value={nextPayment} onChange={e => setNextPayment(e.target.value)} placeholder={t('next_payment_placeholder', 'Prochain paiement (date ou montant)...')} className="form-input" />
                <input type="text" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder={t('total_amount_placeholder', 'Paiement global (€)...')} className="form-input" />
                <input type="url" value={googleDriveLink} onChange={e => setGoogleDriveLink(e.target.value)} placeholder={t('google_drive_link_placeholder', 'URL du dossier Google Drive')} className="form-input" />


                {isGuest && <p className="text-xs text-amber-400 text-center flex items-center gap-2">
                    {/* Info Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    {t('guest_feature_restricted', 'Fonctionnalité réservée aux membres inscrits.')}</p>}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isGuest ? 'bg-slate-600 cursor-not-allowed' : 'pulse-button bg-gradient-to-r from-pink-600 to-red-500'} main-action-button`}
                >
                    {initialData.id ? t('save_changes', 'Sauvegarder les changements') : t('create_project_button', 'Créer le Projet')}
                </motion.button>
                {initialData.id && ( // Bouton Supprimer en mode édition
                    <motion.button
                        type="button"
                        onClick={() => { if(window.confirm(t('confirm_delete_project', 'Êtes-vous sûr de vouloir supprimer ce projet ?'))) onDelete(initialData.id); onClose(); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2 main-button-secondary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        {t('delete_project_button', 'Supprimer le Projet')}
                    </motion.button>
                )}
            </form>
        </ModalWrapper>
    );
};
// --- Modale de Formulaire de Facture ---
const InvoiceFormModal = ({ isGuest, client = null, onAdd, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [invoiceClient, setInvoiceClient] = useState(client ? client.name : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isGuest) {
            alert(t('guest_feature_disabled_invoice', "L'ajout de factures est désactivé en mode invité. Veuillez vous inscrire !"));
            return;
        }
        if (!title.trim() || !amount.trim()) return;

        onAdd({
            id: `inv-${Date.now()}`,
            title: title.trim(),
            client: invoiceClient.trim(),
            amount: `${parseFloat(amount).toFixed(2)} €`,
            date: format(new Date(), 'dd/MM/yyyy'),
            status: 'Pending'
        });
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {t('create_invoice_title', 'Créer une nouvelle facture')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('invoice_title_placeholder', 'Titre de la facture...')} className="form-input" required />
                <input type="text" value={invoiceClient} onChange={e => setInvoiceClient(e.target.value)} placeholder={t('invoice_client_placeholder', 'Nom du client...')} className="form-input" required />
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t('invoice_amount_placeholder', 'Montant (€)...')} className="form-input" step="0.01" required />
                {isGuest && <p className="text-xs text-amber-400 text-center flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    {t('guest_feature_restricted', 'Fonctionnalité réservée aux membres inscrits.')}</p>}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${isGuest ? 'bg-slate-600 cursor-not-allowed' : 'pulse-button bg-gradient-to-r from-green-500 to-teal-500'} main-action-button`}
                >
                    {t('create_invoice_button', 'Créer la facture')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

// --- Modale de Liste de Factures ---
const InvoiceListModal = ({ invoices = [], onClose, t }) => {
    return (
        <ModalWrapper onClose={onClose} size="max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                {t('all_invoices_title', 'Toutes les factures')}
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar p-2">
                {Array.isArray(invoices) && invoices.length > 0 ? (
                    invoices.map(invoice => (
                        <div key={invoice.id} className="futuristic-card flex items-center justify-between p-3 rounded-lg">
                            <div>
                                <p className="font-bold text-white">{invoice.title}</p>
                                <p className="text-sm text-slate-400">{invoice.client} - {invoice.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white">{invoice.amount}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center p-8 text-sm text-slate-500">{t('no_invoices_to_display', 'Aucune facture à afficher.')}</p>
                )}
            </div>
            <div className="mt-6 text-center">
                <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="main-button-secondary w-full"
                >
                    {t('close', 'Fermer')}
                </motion.button>
            </div>
        </ModalWrapper>
    );
};

// --- Modale de Membre d'Équipe (Ajout/Édition/Suppression) ---
const TeamMemberModal = ({ mode, member, onSave, onDelete, onClose, t }) => {
    const [name, setName] = useState(member?.name || '');
    const [role, setRole] = useState(member?.role || '');
    const [email, setEmail] = useState(member?.email || '');
    // MODIFICATION ICI: Utilise default-avatar.png comme fallback
    const [avatar, setAvatar] = useState(member?.avatar || '/images/avatars/default-avatar.jpg');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !role.trim() || !email.trim()) return;

        const memberData = {
            id: member?.id || `member-${Date.now()}`,
            name: name.trim(),
            role: role.trim(),
            email: email.trim(),
            avatar: avatar,
        };
        onSave(memberData);
        onClose();
    };

    const handleDelete = () => {
        if (member && window.confirm(t('confirm_delete_member', 'Êtes-vous sûr de vouloir supprimer ce membre ?'))) {
            onDelete(member.id);
            onClose();
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {mode === 'add' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                )}
                {mode === 'add' ? t('add_member_title', 'Ajouter un membre') : t('edit_member_title', 'Modifier le membre')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                    <Image src={avatar} alt="Member Avatar" width={80} height={80} className="rounded-full object-cover border-2 border-pink-500" />
                </div>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('member_name_placeholder', 'Nom du membre...')} className="form-input" required />
                <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder={t('member_role_placeholder', 'Rôle...')} className="form-input" required />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('member_email_placeholder', 'Email...')} className="form-input" required />

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 main-action-button"
                >
                    {mode === 'add' ? t('add_member_button', 'Ajouter le membre') : t('save_changes', 'Sauvegarder les changements')}
                </motion.button>
                {mode === 'edit' && (
                    <motion.button
                        type="button"
                        onClick={handleDelete}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2 main-button-secondary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        {t('delete_member_button', 'Supprimer le membre')}
                    </motion.button>
                )}
            </form>
        </ModalWrapper>
    );
};

// --- Modale de Chat Rapide ---
const QuickChatModal = ({ member, onClose, t }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        // MODIFICATION ICI: Assure que l'historique de chat est initialisé une seule fois
        if (chatHistory.length === 0) {
            setChatHistory([
                { sender: member?.name || 'Partenaire', text: t('chat_intro_message', 'Salut ! Comment vas-tu ?'), timestamp: '14:00' },
                { sender: 'Vous', text: t('chat_my_reply', 'Salut ! Ça va bien et toi ?'), timestamp: '14:01' },
            ]);
        }
        // MODIFICATION ICI: S'assurer que le scrollIntoView est appelé après le rendu
        const timer = setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100); // Petit délai pour le rendu
        return () => clearTimeout(timer);
    }, [chatHistory, member?.name, t]);

    const chatEndRef = useRef(null);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            setChatHistory(prev => [...prev, {
                sender: 'Vous',
                text: message.trim(),
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            }]);
            setMessage('');
            setTimeout(() => {
                setChatHistory(prev => [...prev, {
                    sender: member?.name || 'Partenaire',
                    text: t('chat_simulated_reply', 'Je suis occupé en ce moment, je te rappelle plus tard !'),
                    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                }]);
            }, 1500);
        }
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {t('chat_with', 'Chat avec')} {member?.name || 'Inconnu'}
            </h2>
            <div className="flex flex-col h-96 bg-slate-800/50 rounded-lg p-4">
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.sender === 'Vous' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender !== 'Vous' && (
                                // MODIFICATION ICI: Utilise default-avatar.png comme fallback pour le membre
                                <Image src={member?.avatar || '/images/avatars/default-avatar.jpg'} alt={member?.name || 'Partenaire'} width={32} height={32} className="rounded-full object-cover flex-shrink-0" />
                            )}
                            <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'Vous' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm">{msg.sender}</span>
                                    <span className="text-xs text-slate-400">{msg.timestamp}</span>
                                </div>
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                            {msg.sender === 'Vous' && (
                                // MODIFICATION ICI: Utilise default-avatar.png pour l'utilisateur
                                <Image src="/images/avatars/default-avatar.jpg" alt="Vous" width={32} height={32} className="rounded-full object-cover flex-shrink-0" />
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="mt-4 relative">
                    <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder={t('type_message_placeholder', 'Tapez votre message...')} className="form-input pr-12" />
                    <motion.button
                        type="submit"
                        disabled={!message.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg main-action-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>
                    </motion.button>
                </form>
            </div>
        </ModalWrapper>
    );
};

// --- Modale d'Attribution (Tâche/Projet/Deadline) ---
const AssignTaskProjectDeadlineModal = ({ member, onClose, t, allStaffMembers = [], userUid, currentUserName, onAddTask }) => {
    const [assignmentType, setAssignmentType] = useState('task');
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState(member?.name || currentUserName || '');
    const [loading, setLoading] = useState(false);

    const assignableStaff = (Array.isArray(allStaffMembers) ? allStaffMembers : []).filter(staffMember => staffMember.firebaseUid !== userUid);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);

        const assignmentData = {
            title: title.trim(),
            assignedTo: assignedTo,
            deadline: deadline || null,
        };

        if (assignmentType === 'task') {
            // CORRECTED: Pass only the title string to onAddTask (addTodo)
            await onAddTask(assignmentData.title);
            alert(t('task_assigned_success', `Tâche "${assignmentData.title}" assignée à ${assignedTo} et ajoutée !`));
        } else if (assignmentType === 'project') {
            alert(t('project_assignment_placeholder', `Attribution de projet à ${assignedTo} : "${assignmentData.title}" - Non implémentée.`));
        } else if (assignmentType === 'deadline') {
            alert(t('deadline_assignment_placeholder', `Attribution de deadline à ${assignedTo} : "${assignmentData.title}" - Non implémentée.`));
        }

        setLoading(false);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {t('assign_to', 'Assigner à')} {member?.name || currentUserName || 'cet utilisateur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-slate-300 text-sm mb-2 font-medium">{t('assignment_type', 'Type d\'attribution')}</label>
                    <div className="flex space-x-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1.5">
                        <button type="button" onClick={() => setAssignmentType('task')} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${assignmentType === 'task' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11L12 14L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            {t('task', 'Tâche')}
                        </button>
                        <button type="button" onClick={() => setAssignmentType('project')} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${assignmentType === 'project' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0  0 0-2 2v16"/></svg>
                            {t('project', 'Projet')}
                        </button>
                        <button type="button" onClick={() => setAssignmentType('deadline')} className={`flex-1 p-2 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-semibold ${assignmentType === 'deadline' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            {t('deadline', 'Deadline')}
                        </button>
                    </div>
                </div>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('assignment_title_placeholder', 'Titre de l\'attribution...')} className="form-input" required />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="form-input" />

                {/* Nouveau champ de sélection pour "Assigner à" */}
                <div>
                    <label className="block text-slate-300 text-sm mb-2 font-medium">{t('assign_to_label', 'Assigner à')}</label>
                    <div className="relative"> {/* Added relative for positioning custom arrow */}
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="form-input appearance-none pr-10" // Added appearance-none and pr-10
                            required
                        >
                            <option value={currentUserName}>{currentUserName} ({t('me', 'Moi')})</option>
                            {(Array.isArray(assignableStaff) ? assignableStaff : []).map(member => (
                                <option key={member.firebaseUid} value={member.name}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>


                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-bold py-3 rounded-lg text-lg text-white pulse-button bg-gradient-to-r from-pink-500 to-violet-500 main-action-button"
                >
                    {loading ? t('assigning', 'Assignation...') : t('assign_button', 'Assigner')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

// --- NOUVELLE MODALE : GanttTaskFormModal ---
const GanttColors = [ // Define GanttColors array here or import it
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
    { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
];
const GanttTaskFormModal = ({ initialData = {}, onSave, onClose, allStaffMembers = [], allClients = [], t }) => {
    const [title, setTitle] = useState(initialData.title || '');
    const [person, setPerson] = useState(initialData.person || '');
    const [startDate, setStartDate] = useState(initialData.startDate || format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(initialData.endDate || format(new Date(), 'yyyy-MM-dd'));
    const [color, setColor] = useState(initialData.color || 'blue');
    const [isNewPerson, setIsNewPerson] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !person.trim() || !startDate || !endDate) {
            alert(t('gantt_form_error_message', 'Veuillez remplir tous les champs obligatoires.'));
            return;
        }

        const taskData = {
            id: initialData.id || `gantt-${Date.now()}`,
            title: title.trim(),
            person: person.trim(),
            startDate: startDate,
            endDate: endDate,
            color: color,
            completed: initialData.completed || false,
        };
        onSave(taskData);
        onClose();
    };

    const allPeople = [...new Set([
        ...(Array.isArray(allStaffMembers) ? allStaffMembers.map(m => m.name) : []),
        ...(Array.isArray(allClients) ? allClients.map(c => c.name) : [])
    ])].sort();

    const availablePeople = [...new Set([
        ...(Array.isArray(allStaffMembers) ? allStaffMembers.map(m => m.name) : []),
        ...(Array.isArray(allClients) ? allClients.map(c => c.name) : []),
        ...(initialData.person ? [initialData.person] : [])
    ])].sort();


    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 11h10"/><path d="M7 15h10"/></svg>
                {t('gantt_form_title', 'Ajouter/Modifier une tâche Planning')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('gantt_task_title_placeholder', 'Titre de la tâche...')} className="form-input" required />

                {!isNewPerson ? (
                    <div className="relative">
                        <select
                            value={person}
                            onChange={e => setPerson(e.target.value)}
                            className="form-input appearance-none pr-10"
                            required
                        >
                            <option value="">{t('select_person_placeholder', 'Sélectionner une personne...')}</option>
                            {(Array.isArray(availablePeople) ? availablePeople : []).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        <button type="button" onClick={() => setIsNewPerson(true)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-xs text-pink-400 hover:underline">
                            {t('add_new', 'Nouvelle ?')}
                        </button>
                    </div>
                ) : (
                    <input type="text" value={person} onChange={e => setPerson(e.target.value)} placeholder={t('new_person_name_placeholder', 'Nom de la nouvelle personne...')} className="form-input" required />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">{t('start_date', 'Date de début')}</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" required />
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">{t('end_date', 'Date de fin')}</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" required />
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm mb-1">{t('gantt_color', 'Couleur')}</label>
                    <div className="grid grid-cols-5 gap-2">
                        {GanttColors.map(c => (
                            <div
                                key={c.value}
                                className={`h-8 w-8 rounded-full cursor-pointer border-2 transition-all ${c.class} ${color === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                                onClick={() => setColor(c.value)}
                                title={c.name}
                            ></div>
                        ))}
                    </div>
                </div>

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-bold py-3 rounded-lg text-lg text-white pulse-button bg-gradient-to-r from-pink-500 to-violet-500 main-action-button"
                >
                    {initialData.id ? t('save_changes', 'Sauvegarder les changements') : t('add_gantt_task_button', 'Ajouter la tâche')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};
// --- NOUVELLE MODALE : GoogleDriveLinkModal (pour Projects.js) ---
const GoogleDriveLinkModal = ({ projectId, onSave, onClose, t }) => {
    const [link, setLink] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!link.trim()) {
            setError(t('drive_link_empty_error', 'Veuillez entrer un lien.'));
            return;
        }
        // Basic URL validation
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            setError(t('drive_link_invalid_error', 'Veuillez entrer un lien valide (doit commencer par http:// ou https://).'));
            return;
        }
        onSave(projectId, link.trim());
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1L3 6v12l9 5 9-5V6l-9-5z"/><path d="M3 6l9 5 9-5"/><path d="M12 1l9 5"/><path d="M12 1v22"/><path d="M3 6v12"/><path d="M21 6v12"/></svg>
                {t('add_drive_link_title', 'Ajouter un dossier Google Drive')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="url"
                    value={link}
                    onChange={e => {setLink(e.target.value); setError('');}}
                    placeholder={t('drive_link_placeholder', 'URL du dossier Google Drive...')}
                    className="form-input"
                    required
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg text-lg main-action-button"
                >
                    {t('save_link', 'Enregistrer le lien')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

// --- NOUVELLE MODALE : AddDeadlineModal ---
const AddDeadlineModal = ({ onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [description, setDescription] = useState('');
    const [client, setClient] = useState(''); // Added client field for deadlines
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !date) {
            alert(t('deadline_form_error', 'Veuillez remplir le titre et la date.'));
            return;
        }
        setLoading(true);
        // Simulate saving a new project with deadline
        await onSave({
            title: title.trim(),
            date: date, // Format 'yyyy-MM-dd' is fine for projects
            description: description.trim(),
            client: client.trim() || 'General' // Assign client
        });
        setLoading(false);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                {t('add_deadline', 'Ajouter une deadline')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('deadline_title_placeholder', 'Titre de la deadline...')}
                    className="form-input"
                    required
                />
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="form-input"
                    required
                />
                <input
                    type="text"
                    value={client}
                    onChange={e => setClient(e.target.value)}
                    placeholder={t('client_name_placeholder', 'Nom du client (optionnel)...')}
                    className="form-input"
                />
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={t('deadline_description_placeholder', 'Contenu / description de la deadline...')}
                    className="form-input min-h-[80px]"
                />
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50 main-action-button"
                >
                    {loading ? t('adding', 'Ajout...') : t('add_deadline_button', 'Ajouter la deadline')}
                </motion.button>
            </form>
        </ModalWrapper>
    );
};

// --- NOUVELLE MODALE : AddMeetingModal ---
const AddMeetingModal = ({ onSave, onClose, t }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(new Date(), 'HH:mm'));
    const [attendees, setAttendees] = useState(''); // Comma-separated emails
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone); // Default to user's timezone
    const [sendEmail, setSendEmail] = useState(true); // Send email checkbox
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        setError('');

        const selectedDateTime = parseISO(`${date}T${time}:00`);
        if (!isValid(selectedDateTime) || selectedDateTime <= new Date()) {
            setError(t('invalid_future_date', 'Veuillez sélectionner une date et heure futures valides.'));
            return;
        }

        setLoading(true);

        // Simulate Google Meet link creation
        const googleMeetLink = `https://meet.google.com/simulated-meet-id?authuser=0&hl=${t('lang_code', 'fr')}`; // Generic link for simulation

        const newMeetingData = {
            title: title.trim(),
            dateTime: selectedDateTime.toISOString(),
            attendees: (attendees || '').split(',').map(email => email.trim()).filter(email => email),
            timezone: timezone,
            sendEmail: sendEmail,
            googleMeetLink: googleMeetLink
        };

        await onSave(newMeetingData); // Save the new meeting data
        setLoading(false);
        onClose();
        alert(t('meeting_scheduled_success', 'Meeting planifié avec succès !') + ` ${newMeetingData.googleMeetLink}`);
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><path d="M14 12H2V4h12v8Z"/></svg>
                {t('add_meeting', 'Ajouter une réunion')}
            </h2>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('meeting_title_placeholder', 'Titre de la réunion...')}
                    className="form-input"
                    required
                />
                <input
                    type="text"
                    value={attendees}
                    onChange={e => setAttendees(e.target.value)}
                    placeholder={t('invitee_emails_placeholder', 'Emails des participants (sép. par virgule)...')}
                    className="form-input"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">{t('meeting_date', 'Date')}</label>
                        <input type="date" value={date} onChange={e => {setDate(e.target.value); setError('');}} className="form-input" required />
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">{t('meeting_time', 'Heure')}</label>
                        <input type="time" value={time} onChange={e => {setTime(e.target.value); setError('');}} className="form-input" required />
                    </div>
                </div>
                <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} className="form-input" placeholder={t('timezone_placeholder', 'Europe/Paris')} />
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                    <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={e => setSendEmail(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-pink-500 rounded border-slate-600 bg-slate-700 focus:ring-pink-500 cursor-pointer"
                    />
                    {t('send_email_confirmation', 'Envoyer un email de confirmation aux participants')}
                </label>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50 main-action-button"
                >
                    {loading ? t('scheduling', 'Planification...') : t('schedule_meeting', 'Planifier la réunion')}
                </motion.button>
                {/* Simulate opening Google Meet */}
                {!loading && (
                    <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full flex items-center justify-center gap-2 main-button-secondary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {t('open_google_meet_button', 'Ouvrir Google Meet (Simulation)')}
                    </a>
                )}
            </form>
        </ModalWrapper>
    );
};

// --- Modale de Client (Ajout/Édition/Suppression) ---
export const ClientFormModal = ({ mode, client, onSave, onDelete, onClose, t }) => {
    const [name, setName] = useState(client?.name || '');
    const [contactEmail, setContactEmail] = useState(client?.contactEmail || '');
    const [phone, setPhone] = useState(client?.phone || ''); // Added phone field
    const [lastContact, setLastContact] = useState(client?.lastContact ? format(parseISO(client.lastContact), 'yyyy-MM-dd') : ''); // Added lastContact

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !contactEmail.trim()) return;

        const clientData = {
            id: client?.id || `cl-${Date.now()}`,
            name: name.trim(),
            contactEmail: contactEmail.trim(),
            phone: phone.trim(),
            lastContact: lastContact || null,
        };
        onSave(clientData);
        onClose();
    };

    const handleDelete = () => {
        if (client && window.confirm(t('confirm_delete_client', 'Êtes-vous sûr de vouloir supprimer ce client ?'))) {
            onDelete(client.id);
            onClose();
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {mode === 'add' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                )}
                {mode === 'add' ? t('add_client_title', 'Ajouter un client') : t('edit_client_title', 'Modifier le client')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('client_name_placeholder', 'Nom du client...')} className="form-input" required />
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder={t('client_email_placeholder', 'Email du client...')} className="form-input" required />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('client_phone_placeholder', 'Téléphone (optionnel)...')} className="form-input" />
                <div>
                    <label htmlFor="lastContact" className="block text-slate-300 text-sm mb-2 font-medium">{t('last_contact_date', 'Date du dernier contact')}</label>
                    <input id="lastContact" type="date" value={lastContact} onChange={e => setLastContact(e.target.value)} className="form-input" />
                </div>

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full pulse-button bg-gradient-to-r from-teal-500 to-cyan-600 main-action-button"
                >
                    {mode === 'add' ? t('add_client_button', 'Ajouter le client') : t('save_changes', 'Sauvegarder les changements')}
                </motion.button>
                {mode === 'edit' && (
                    <motion.button
                        type="button"
                        onClick={handleDelete}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2 main-button-secondary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        {t('delete_client_button', 'Supprimer le client')}
                    </motion.button>
                )}
            </form>
        </ModalWrapper>
    );
};


// Exportation de toutes les modales
export {
    ModalWrapper,
    TaskEditModal,
    DayDetailsModal,
    QuickAddTaskModal,
    GuestNameEditModal,
    AvatarEditModal,
    MeetingSchedulerModal,
    ProjectFormModal,
    InvoiceFormModal,
    InvoiceListModal,
    TeamMemberModal,
    QuickChatModal,
    AssignTaskProjectDeadlineModal,
    UserNameEditModal,
    GanttTaskFormModal,
    GoogleDriveLinkModal,
    AddDeadlineModal,
    AddMeetingModal
};