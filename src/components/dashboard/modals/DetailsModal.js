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
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {content}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold"
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