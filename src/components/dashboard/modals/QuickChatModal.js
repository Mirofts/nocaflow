// src/components/dashboard/modals/QuickChatModal.js
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Importez Image de next/image
import { ModalWrapper } from './ModalWrapper';

const QuickChatModal = ({ member, onClose, t }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (chatHistory.length === 0) {
            setChatHistory([
                { sender: member?.name || 'Partenaire', text: t('chat_intro_message', 'Salut ! Comment vas-tu ?'), timestamp: '14:00' },
                { sender: 'Vous', text: t('chat_my_reply', 'Salut ! Ça va bien et toi ?'), timestamp: '14:01' },
            ]);
        }
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, member?.name, t]);

    const chatEndRef = useRef(null);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            setChatHistory(prev => [...prev, {
                sender: 'Vous',
                text: message.trim(),
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            }]);
            setMessage('');
            setTimeout(() => {
                setChatHistory(prev => [...prev, {
                    sender: member?.name || 'Partenaire',
                    text: t('chat_simulated_reply', 'Je suis occupé en ce moment, je te rappelle plus tard !'),
                    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                }]);
            }, 1500);
        }
    };

    return (
        <ModalWrapper onClose={onClose} size="max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                {/* Users Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {t('chat_with', 'Chat avec')} {member?.name || 'Inconnu'}
            </h2>
            <div className="flex flex-col h-96 bg-slate-800/50 rounded-lg p-4">
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.sender === 'Vous' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender !== 'Vous' && (
                                <Image src={member?.avatar || '/images/default-avatar.png'} alt={member?.name || 'Partenaire'} width={32} height={32} className="rounded-full object-cover flex-shrink-0" />
                            )}
                            <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'Vous' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm">{msg.sender}</span>
                                    <span className="text-xs text-slate-400">{msg.timestamp}</span>
                                </div>
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                            {msg.sender === 'Vous' && (
                                <Image src="/images/avatars/yves.jpg" alt="Vous" width={32} height={32} className="rounded-full object-cover flex-shrink-0" />
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="mt-4 relative">
                    <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder={t('type_message_placeholder', 'Tapez votre message...')} className="form-input pr-12" />
                    <motion.button
                        type="submit"
                        disabled={!message.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg main-action-button"
                    >
                        {/* Send Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>
                        {t('send', 'Envoyer')}
                    </motion.button>
                </form>
            </div>
        </ModalWrapper>
    );
};

export default QuickChatModal;