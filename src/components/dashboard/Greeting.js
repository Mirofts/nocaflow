// src/components/dashboard/Greeting.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Greeting = ({ t }) => {
    const { currentUser, loadingAuth } = useAuth();
    const { isDarkMode } = useTheme(); // Garder pour le style si nécessaire, sinon peut être retiré

    if (loadingAuth) return null;

    const isGuestMode = !currentUser || currentUser.uid === 'guest_noca_flow';
    const userName = currentUser?.displayName;

    const displayUserName = isGuestMode
        ? t('guest_you', 'TOI')
        : userName || t('unknown_user', 'Utilisateur');

    return (
        <div className="flex items-center">
            <div className="text-color-text-primary text-xl font-light inline-flex items-center">
                {t('greeting_ave', 'Ave,')}
                <span className="font-bold animated-gradient-text pink-violet-gradient-text ml-1 whitespace-nowrap">
                    {displayUserName}
                </span>
            </div>
        </div>
    );
};

export default Greeting;