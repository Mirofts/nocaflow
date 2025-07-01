// src/components/CalculatorModal.js
import React from 'react';
import { motion } from 'framer-motion';

export default function CalculatorModal({ t, onClose }) {
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
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Calculator Modal (Placeholder)</h2>
        <p className="text-white text-center">This is a placeholder for CalculatorModal.</p>
        <button onClick={onClose} className="mt-4 p-2 bg-red-500 text-white rounded">Close</button>
      </motion.div>
    </motion.div>
  );
}