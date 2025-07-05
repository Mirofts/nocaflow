// src/components/dashboard/Greeting.js
import React from 'react';
// import Image from 'next/image'; // Image import is no longer needed here as avatar is handled by Navbar
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Keep if isDarkMode is needed for internal styling, otherwise remove

const Greeting = ({ t }) => {
    const { currentUser, loadingAuth } = useAuth();
    const { isDarkMode } = useTheme(); // Keeping this in case internal Greeting styles depend on it

    if (loadingAuth) return null;

    // isGuestMode logic remains correct
    const isGuestMode = !currentUser || currentUser.uid === 'guest_noca_flow';
    const userName = currentUser?.displayName;
    // photoURL is no longer used here as the Image tag is removed
    // const photoURL = currentUser?.photoURL;

    const displayUserName = isGuestMode
        ? t('guest_you', 'TOI')
        : userName || t('unknown_user', 'Utilisateur');

    return (
        // The div wrapping Greeting should ideally not have a fixed gap if avatar is not rendered here.
        // The styling is now more focused on the text itself for Navbar integration.
        <div className="flex items-center">
            {/* The Image component for the avatar is removed from here.
                It should be rendered in Navbar.js directly where Greeting is called.
            */}

            <div className="text-color-text-primary text-xl font-light inline-flex items-center"> {/* Adjusted font size for Navbar compactness */}
                {t('greeting_ave', 'Ave,')}
                <span className="font-bold animated-gradient-text pink-violet-gradient-text ml-1 whitespace-nowrap"> {/* Adjusted ml- for compactness */}
                    {displayUserName}
                </span>
            </div>
        </div>
    );
};

export default Greeting;