// components/dashboard/modals/AvatarEditModal.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle, Image as ImageIcon } from 'lucide-react'; // Ajout de ImageIcon
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase'; // Assurez-vous du bon chemin
import { useAuth } from '../../../context/AuthContext';

// Avatars NocaFlow prédéfinis
const nocaflowAvatars = [
    '/images/avatars/avatar-1.jpg',
    '/images/avatars/avatar-2.jpg',
    '/images/avatars/avatar-3.jpg',
    '/images/avatars/avatar-4.jpg',
    '/images/avatars/avatar-5.jpg',
    '/images/avatars/avatar-6.jpg',
    '/images/avatars/avatar-7.jpg',
    '/images/avatars/avatar-8.jpg',
    '/images/avatars/avatar-9.jpg',
    '/images/avatars/yves.jpg', // Un avatar personnalisé si vous voulez
];

export const AvatarEditModal = ({ onClose, t, isGuestMode, onUpdateGuestAvatar }) => {
  const { user, refreshUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' ou 'choose'

  // Si en mode invité et qu'il y a un avatar guest, le définir comme preview
  useEffect(() => {
    if (isGuestMode && typeof window !== 'undefined') {
        const guestData = JSON.parse(localStorage.getItem('nocaflow_guest_data') || '{}');
        if (guestData.avatar) {
            setPreviewUrl(guestData.avatar);
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
            // Pour le mode invité, met à jour le localStorage
            onUpdateGuestAvatar(url);
        } else {
            // Pour les utilisateurs authentifiés, télécharge et met à jour Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                photoURL: url,
            });
            if (refreshUser) {
                await refreshUser(user); // Force la mise à jour du contexte Auth
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
        // En mode invité, on ne télécharge pas sur Firebase Storage
        uploadAndSaveAvatar(previewUrl); // Utilise l'URL locale de l'aperçu
    } else {
        // Pour les utilisateurs connectés, télécharge sur Firebase Storage
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
    setSelectedFile(null); // Pas de fichier sélectionné si on choisit un avatar prédéfini
    setPreviewUrl(avatarUrl);
    uploadAndSaveAvatar(avatarUrl); // Sauvegarder l'avatar choisi
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose} // Ferme la modale si on clique à l'extérieur
    >
      <div className="glass-card p-8 rounded-2xl max-w-xl w-full relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6" />
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
                    <UploadCloud size={16} className="inline-block mr-2" /> {t('upload_tab', 'Télécharger')}
                </button>
                <button 
                    className={`px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors ${activeTab === 'choose' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    onClick={() => setActiveTab('choose')}
                >
                    <ImageIcon size={16} className="inline-block mr-2" /> {t('choose_tab', 'Choisir')}
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
                        className="w-full pulse-button bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-md text-lg disabled:opacity-50 disabled:animate-none"
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
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">{t('avatar_updated_success', 'Avatar mis à jour !')}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};