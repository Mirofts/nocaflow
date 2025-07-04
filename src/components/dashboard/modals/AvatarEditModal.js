// src/components/dashboard/modals/AvatarEditModal.js

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { ModalWrapper } from './ModalWrapper';

// Avatars existants (ajustés avec noms corrects)
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

  const uploadAndSaveAvatar = async (url) => {
    setLoading(true);
    setError('');
    try {
      if (isGuestMode) {
        onUpdateGuestAvatar(url);
      } else {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { photoURL: url });
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
    <ModalWrapper onClose={onClose} size="max-w-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {t('change_avatar_title', 'Changer votre avatar')}
      </h2>

      {!success ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex justify-center mb-4">
            <button
              className={`px-4 py-2 rounded-l-lg text-sm font-semibold transition-colors ${activeTab === 'upload' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              onClick={() => setActiveTab('upload')}
            >
              {/* Upload Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
              {t('upload_tab', 'Télécharger')}
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors ${activeTab === 'choose' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              onClick={() => setActiveTab('choose')}
            >
              {/* Gallery Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              {t('choose_tab', 'Choisir')}
            </button>
          </div>

          {/* Upload Tab */}
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
                  <Image src={previewUrl} alt="Aperçu" width={120} height={120} className="rounded-full mx-auto object-cover border border-slate-700" />
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-md text-lg disabled:opacity-50 disabled:animate-none main-action-button"
              >
                {loading ? (t('uploading') || 'Téléchargement...') : (t('upload_and_validate', 'Télécharger et Valider'))}
              </button>
            </div>
          )}

          {/* Choose Avatar Tab */}
          {activeTab === 'choose' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto custom-scrollbar p-2">
              {nocaflowAvatars.map((avatar, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
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
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <p className="text-xl font-semibold text-white">{t('avatar_updated_success', 'Avatar mis à jour !')}</p>
        </motion.div>
      )}
    </ModalWrapper>
  );
};

export default AvatarEditModal;
