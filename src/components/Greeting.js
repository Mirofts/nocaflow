// components/dashboard/Greeting.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

const Greeting = ({ t }) => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme(); // Get isDarkMode from context
    const isGuestMode = !user || user.uid === 'guest';
    const userName = user?.displayName;

    let displayUserName;
    if (isGuestMode) {
        displayUserName = t('guest_you', 'TOI');
    } else {
        displayUserName = userName || t('unknown_user', 'Utilisateur');
    }

    return (
        // Use text-color-text-primary for "Ave," part for dark text in light mode
        <div className={`text-color-text-primary text-3xl font-light inline-flex items-center`}>
            {t('greeting_ave', 'Ave,')} <span className="font-bold animated-gradient-text pink-violet-gradient-text ml-2">{displayUserName}</span>
        </div>
    );
};

export default Greeting;