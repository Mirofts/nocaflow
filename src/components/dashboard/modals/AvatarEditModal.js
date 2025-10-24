// src/components/dashboard/modals/AvatarEditModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { ModalWrapper } from './ModalWrapper';

const nocaflowAvatars = [
  '/images/avatars/chloe.jpg',
  '/images/avatars/david.jpg',
  '/images/avatars/elena.jpg',
  '/images/avatars/leo.jpg',
  '/images/avatars/marcus.jpg',
  '/images/avatars/sophia.jpg',
  '/images/avatars/yves.jpg',
  '/images/avatars/avatarguest.jpg',
  '/images/avatars/default-avatar.jpg',
];

// On accepte 'user' comme prop ici
const AvatarEditModal = ({ user, onClose, t, isGuestMode, onUpdateGuestAvatar }) => {
  // On utilise TOUJOURS useAuth, mais seulement pour la fonction refreshUser
  const { refreshUser } = useAuth(); 
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    // On utilise l'utilisateur reçu en prop
    if (user?.photoURL) {
      setPreviewUrl(user.photoURL);
    }
  }, [user]);

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t('select_image_error', "Veuillez sélectionner un fichier image."));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(t('file_size_error', "Le fichier est trop volumineux (max 5MB)."));
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const saveAvatarUrlToFirestore = async (url) => {
    if (!user || !user.uid) {
        setError(t('user_not_found', 'Utilisateur non trouvé. Impossible de sauvegarder.'));
        setLoading(false);
        return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
        await updateDoc(userDocRef, { photoURL: url });
        if (refreshUser) {
            await refreshUser();
        }
        setSuccess(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    } catch (err) {
        console.error("Error updating Firestore document:", err);
        setError(t('update_name_error', 'Erreur lors de la sauvegarde du profil.'));
    }
  };

  const handleUpload = async () => {
    if (!user) {
        setError("Vous devez être connecté pour télécharger un avatar.");
        return;
    }
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    try {
        const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}-${selectedFile.name}`);
        const uploadResult = await uploadBytes(avatarRef, selectedFile);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        await saveAvatarUrlToFirestore(downloadURL);
    } catch (err) {
        console.error("Error uploading to Firebase Storage:", err);
        setError(t('storage_upload_error', "Erreur lors du téléchargement de l'image."));
    } finally {
        setLoading(false);
    }
  };

  const handleChooseAvatar = async (avatarUrl) => {
    if (!user) {
        setError("Vous devez être connecté pour choisir un avatar.");
        return;
    }
    if (isGuestMode) {
        onUpdateGuestAvatar(avatarUrl);
        setSuccess(true);
        setTimeout(onClose, 1500);
        return;
    }
    setLoading(true);
    setError('');
    setPreviewUrl(avatarUrl);
    await saveAvatarUrlToFirestore(avatarUrl);
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose} size="max-w-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('change_avatar_title', 'Changer votre avatar')}</h2>
        {!success ? (
            <div className="space-y-6">
                 <div className="flex justify-center mb-4 border-b border-slate-700">
                    <button className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'upload' ? 'border-pink-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('upload')}>{t('upload_tab', 'Télécharger')}</button>
                    <button className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'choose' ? 'border-pink-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('choose')}>{t('choose_tab', 'Choisir')}</button>
                </div>
                {activeTab === 'upload' && (
                    <div className="space-y-4 text-center">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" disabled={loading} />
                        {previewUrl && <div className="mt-4"><p className="text-slate-400 text-sm mb-2">{t('preview', 'Aperçu')} :</p><Image src={previewUrl} alt="Aperçu" width={120} height={120} className="rounded-full mx-auto object-cover border-4 border-slate-700" /></div>}
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        <button onClick={handleUpload} disabled={!selectedFile || loading} className="w-full mt-4 pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-md text-lg disabled:opacity-50 disabled:animate-none main-action-button">{loading ? t('uploading', 'Téléchargement...') : t('upload_and_validate', 'Valider et Sauvegarder')}</button>
                    </div>
                )}
                {activeTab === 'choose' && (
                    <div className="relative">
                        {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10"><div className="loader"></div></div>}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto custom-scrollbar p-2">
                            {nocaflowAvatars.map((avatar, index) => (
                                <motion.div key={index} whileHover={{ scale: 1.05 }} onClick={() => handleChooseAvatar(avatar)} className="rounded-full overflow-hidden cursor-pointer aspect-square border-4 transition-all duration-200" style={{ borderColor: previewUrl === avatar ? '#ec4899' : 'transparent' }}>
                                    <Image src={avatar} alt={`Avatar ${index + 1}`} width={100} height={100} className="w-full h-full object-cover" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-green-400 mx-auto" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="text-xl font-semibold text-white mt-4">{t('avatar_updated_success', 'Avatar mis à jour !')}</p>
            </motion.div>
        )}
    </ModalWrapper>
  );
};

export default AvatarEditModal;