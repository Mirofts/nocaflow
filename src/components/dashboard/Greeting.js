import React from 'react';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Greeting = ({ t }) => {
    const { currentUser, loadingAuth } = useAuth(); // ✅ CHANGÉ : currentUser et loadingAuth
    const { isDarkMode } = useTheme();

    if (loadingAuth) return null; // ✅ Attendre que l’auth soit prête

    const isGuestMode = !currentUser || currentUser.uid === 'guest';
    const userName = currentUser?.displayName;
    const photoURL = currentUser?.photoURL;

    const displayUserName = isGuestMode
        ? t('guest_you', 'TOI')
        : userName || t('unknown_user', 'Utilisateur');

    return (
        <div className="flex items-center gap-4">
            {/* Avatar image */}
            {photoURL && (
                <Image
                    src={photoURL}
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="rounded-full border border-slate-500 object-cover"
                />
            )}

            {/* Greeting with name */}
            <div className="text-color-text-primary text-3xl font-light inline-flex items-center">
                {t('greeting_ave', 'Ave,')}
                <span className="font-bold animated-gradient-text pink-violet-gradient-text ml-2">
                    {displayUserName}
                </span>
            </div>
        </div>
    );
};

export default Greeting;
