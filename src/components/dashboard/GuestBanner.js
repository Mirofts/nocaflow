import React from 'react';
import { Info, UserPlus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const GuestBanner = ({ onRegisterClick, t }) => {
    const { isDarkMode } = useTheme();

    return (
        // Full width container with background
        <div className={`${isDarkMode 
            ? 'bg-yellow-500/10 text-yellow-300' 
            : 'bg-blue-100 text-blue-800'} w-full`}>
            
            {/* Content limited to max-w and centered */}
            <div className={`max-w-7xl mx-auto px-4 py-4 border-l-4 rounded-r-lg flex items-center justify-between gap-4 text-sm 
                ${isDarkMode 
                    ? 'border-yellow-500' 
                    : 'border-blue-500'}`}>
                
                <div className="flex items-center gap-3">
                    <Info size={20} className={`${isDarkMode ? 'text-yellow-500' : 'text-blue-600'}`} />
                    <p>
                        {t('guest_banner_message', 'Vous êtes en mode invité. Pour sauvegarder vos données et accéder à toutes les fonctionnalités,')}{' '}
                        <strong className={`font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-blue-900'}`}>
                            {t('guest_banner_strong', 'créez un compte gratuit')}
                        </strong>.
                    </p>
                </div>
                
                <button 
                    onClick={onRegisterClick}
                    className={`font-bold px-4 py-2 rounded-lg text-xs whitespace-nowrap hover:bg-yellow-400 transition-colors flex items-center gap-2
                        ${isDarkMode 
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    <UserPlus size={14}/> {t('register_button', "S'inscrire")}
                </button>
            </div>
        </div>
    );
};

export default GuestBanner;
