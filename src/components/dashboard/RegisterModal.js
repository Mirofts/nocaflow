// src/components/RegisterModal.js
import React from 'react';
import { motion } from 'framer-motion';

export default function RegisterModal({ t, onClose, onSwitchToLogin }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "-100vh", opacity: 0 }}
        animate={{ y: "0", opacity: 1 }}
        exit={{ y: "100vh", opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="glass-card p-8 rounded-2xl max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Register Modal (Placeholder)</h2>
        <p className="text-white text-center">This is a placeholder for RegisterModal.</p>
        <button onClick={onClose} className="mt-4 p-2 bg-green-500 text-white rounded">Close</button>
      </motion.div>
    </motion.div>
  );
}