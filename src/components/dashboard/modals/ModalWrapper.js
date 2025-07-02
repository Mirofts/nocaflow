// src/components/dashboard/modals/ModalWrapper.js
import React from 'react';
import { motion } from 'framer-motion';

const ModalWrapper = ({ children, onClose, size = 'max-w-md' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`glass-card p-6 sm:p-8 rounded-2xl w-full relative ${size}`}
            onClick={e => e.stopPropagation()}
        >
            <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                {/* X Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            {children}
        </motion.div>
    </motion.div>
);

export { ModalWrapper };