// src/components/dashboard/TodoList.js
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { DashboardCard } from './DashboardCard';
import { useTheme } from '../../context/ThemeContext';

const TodoList = ({ todos, loading, onAdd, onToggle, onEdit, onDelete, onAssignTeam, t, className }) => {
    const { isDarkMode } = useTheme();
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = useCallback((e) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            onAdd(newTaskText.trim());
            setNewTaskText('');
        }
    }, [newTaskText, onAdd]);

    // ** 3. NOUVELLE LOGIQUE DE TRI AUTOMATIQUE **
    const sortedTodos = useMemo(() => {
        if (!Array.isArray(todos)) return [];

        const priorityOrder = { urgent: 1, normal: 2, cold: 3 };

        return [...todos].sort((a, b) => {
            // 1. Les tâches terminées vont toujours en bas
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // 2. Pour les tâches non terminées, on trie par priorité
            const priorityA = priorityOrder[a.priority] || 2; // normal par défaut
            const priorityB = priorityOrder[b.priority] || 2; // normal par défaut
            return priorityA - priorityB;
        });
    }, [todos]);

    return (
        <DashboardCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>}
            title={t('todo_list_title', 'Liste de choses à faire')}
            className={className}
            noContentPadding={true}
        >
            <div className="flex flex-col h-full">
                <form onSubmit={handleAddTask} className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex gap-2 items-center`}>
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder={t('add_new_todo_placeholder', 'Ajouter une nouvelle tâche...')}
                        className={`flex-grow p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                    <button type="submit" className="p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0" title={t('add_task', 'Ajouter la tâche')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                </form>

                {loading ? (
                    <div className="flex justify-center items-center h-full p-4"><p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('loading_todos', 'Chargement...')}</p></div>
                ) : !sortedTodos || sortedTodos.length === 0 ? (
                    <div className="flex justify-center items-center h-full p-4"><p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('no_todos', 'Aucune tâche pour le moment.')}</p></div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-2 py-2">
                        <AnimatePresence>
                            {sortedTodos.map((todo) => (
                                <motion.div
                                    key={todo.id}
                                    layout // Garde l'animation de tri
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <TaskItem
                                        task={todo}
                                        onToggle={onToggle}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onAssignTeam={onAssignTeam}
                                        t={t}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
};

export default TodoList;