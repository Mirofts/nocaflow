// components/dashboard/GuestBanner.js
import React from 'react';
import { Info, UserPlus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

const GuestBanner = ({ onRegisterClick, t }) => {
    const { isDarkMode } = useTheme();

    return (
        // Adjusting colors for the banner in both modes
        <div className={`border-l-4 p-4 mb-6 rounded-r-lg flex items-center justify-between gap-4 text-sm
                    ${isDarkMode 
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300' 
                        : 'bg-blue-100 border-blue-500 text-blue-800' // Using more standard light mode colors
                    }`}>
            <div className="flex items-center gap-3">
                {/* Icon color conditional */}
                <Info size={20} className={`${isDarkMode ? 'text-yellow-500' : 'text-blue-600'}`} />
                <p>
                    {t('guest_banner_message', 'Vous êtes en mode invité. Pour sauvegarder vos données et accéder à toutes les fonctionnalités,')}{' '}
                    {/* Strong text color conditional */}
                    <strong className={`font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-blue-900'}`}> {t('guest_banner_strong', 'créez un compte gratuit')}</strong>.
                </p>
            </div>
            <button 
                onClick={onRegisterClick} 
                // Button background and text color conditional
                className={`font-bold px-4 py-2 rounded-lg text-xs whitespace-nowrap hover:bg-yellow-400 transition-colors flex items-center gap-2
                            ${isDarkMode 
                                ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                                : 'bg-blue-600 text-white hover:bg-blue-700' // Consistent button color for light mode
                            }`}>
                <UserPlus size={14}/> {t('register_button', 'S\'inscrire')}
            </button>
        </div>
    );
};

export default GuestBanner;