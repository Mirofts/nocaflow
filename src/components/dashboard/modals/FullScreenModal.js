// src/components/dashboard/modals/FullScreenModal.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FullScreenModal = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="fixed inset-0 bg-color-bg-primary z-[999] flex flex-col"
                >
                    {/* Header du Modal */}
                    <div className="flex items-center justify-between p-4 border-b border-color-border-primary flex-shrink-0 bg-color-bg-secondary">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 text-color-text-secondary hover:text-purple-400 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            <span className="font-semibold">{/* Retour */}</span>
                        </button>
                        <h2 className="text-lg font-bold text-color-text-primary">{title}</h2>
                        {/* Espace vide pour centrer le titre */}
                        <div className="w-12"></div>
                    </div>

                    {/* Contenu du Modal */}
                    <div className="flex-grow overflow-y-auto">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullScreenModal;