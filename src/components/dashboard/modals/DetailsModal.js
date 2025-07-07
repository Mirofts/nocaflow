// src/components/dashboard/modals/DetailsModal.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailsModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    // Décomposer le contenu en paires clé-valeur pour un affichage structuré
    const parsedContent = (content || "").split('\n').map(line => {
        const parts = line.split(':');
        const key = parts[0]?.trim();
        const value = parts.slice(1).join(':').trim();
        return { key, value };
    }).filter(item => item.key && item.value);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        className="bg-gray-900 text-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative transform transition-all duration-300 ease-out border border-indigo-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-3xl font-extrabold mb-6 text-indigo-400 border-b pb-4 border-indigo-700">
                            {title || "Détails de l'Événement"}
                        </h2>
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
                        </div>
                        <div className="flex justify-end mt-10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 text-lg shadow-md hover:shadow-lg"
                            >
                                Fermer
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-3xl font-bold"
                            title="Fermer"
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