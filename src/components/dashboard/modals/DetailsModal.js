// src/components/dashboard/modals/DetailsModal.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// IMPORTANT: Assurez-vous que ModalWrapper est importé, car nous allons l'utiliser
import { ModalWrapper } from './ModalWrapper'; // <<< Assurez-vous de cette importation

// MODIFICATION: Ajout de la prop 'children' et 'isFullScreen'
const DetailsModal = ({ isOpen, onClose, title, content, children, isFullScreen = false }) => {
    if (!isOpen) return null;

    // Décomposer le contenu en paires clé-valeur pour un affichage structuré
    // Cette logique ne sera utilisée que si 'children' n'est PAS fourni (pour le mode 'détails' classique)
    const parsedContent = (content || "").split('\n').map(line => {
        const parts = line.split(':');
        const key = parts[0]?.trim();
        const value = parts.slice(1).join(':').trim();
        return { key, value };
    }).filter(item => item.key && item.value);

    // MODIFICATION: Nous allons maintenant envelopper le contenu dans ModalWrapper
    return (
        <ModalWrapper
            isOpen={isOpen} // Passer isOpen à ModalWrapper
            onClose={onClose}
            title={title || "Détails"} // Utiliser le titre passé ou un défaut
            isFullScreen={isFullScreen} // Passer la prop isFullScreen à ModalWrapper
        >
            {/* Si 'children' est fourni, cela signifie que nous affichons un composant entier (ex: Notepad) */}
            {/* Sinon, nous affichons le contenu textuel structuré (pour les alertes, etc.) */}
            {children ? (
                // Si des enfants sont fournis, les rendre directement
                // Ces enfants seront déjà le composant complet (Notepad, Calendar, etc.)
                children
            ) : (
                // Si pas d'enfants, c'est le mode "détails" classique (pour les alertes par exemple)
                <div className="text-gray-300 leading-relaxed text-lg space-y-3">
                    {parsedContent.length > 0 ? parsedContent.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-start">
                            <span className="font-semibold text-indigo-300 sm:w-1/3 flex-shrink-0">
                                {item.key}:
                            </span>
                            <span className="text-gray-200 sm:w-2/3 break-words">
                                {item.value}
                            </span>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400">{content || "Aucun détail disponible."}</p>
                    )}
                    {/* Bouton de fermeture pour le mode 'détails' classique */}
                    <div className="flex justify-end mt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 text-lg shadow-md hover:shadow-lg"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </ModalWrapper>
    );
};

export default DetailsModal;