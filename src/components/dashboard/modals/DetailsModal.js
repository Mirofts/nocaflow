// src/components/dashboard/modals/DetailsModal.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailsModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" // Opacité plus forte
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg relative transform transition-all duration-300 ease-out" // Pading plus grand, ombre plus forte
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-extrabold mb-5 text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700"> {/* Titre plus grand et souligné */}
                            {title}
                        </h2>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base"> {/* Texte plus grand, meilleur interligne */}
                            {content.split('\n').map((line, index) => (
                                <p key={index} className="mb-2 last:mb-0"> {/* Chaque ligne dans un paragraphe */}
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{line.split(':')[0]}:</span> {/* Sépare clé/valeur */}
                                    <span>{line.split(':').slice(1).join(':')}</span>
                                </p>
                            ))}
                        </div>
                        <div className="flex justify-end mt-8"> {/* Bouton en bas à droite */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-lg font-semibold" // Bouton plus grand et pro
                            >
                                Fermer
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl font-bold transition-colors" // Bouton de fermeture plus grand
                        >
                            &times;
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DetailsModal;