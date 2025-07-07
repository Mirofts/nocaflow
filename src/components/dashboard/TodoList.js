// src/components/dashboard/TodoList.js
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { DashboardCard } from './DashboardCard';
import { useTheme } from '../../context/ThemeContext';

const TodoList = ({ todos, loading, onAdd, onToggle, onEdit, onDelete, t, className }) => {
    const { isDarkMode } = useTheme();
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = useCallback((e) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            // Changed this line to pass a consistent task object structure
           // In TodoList.js, inside handleAddTask
// Assuming onAdd (addTodo) expects only the title string
onAdd(newTaskText.trim());
            setNewTaskText('');
        }
    }, [newTaskText, onAdd]);

    const filteredTodos = useMemo(() => {
        return todos;
    }, [todos]);

    return (
        <DashboardCard
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 2v4"/><path d="M8 6h8"/></svg>
            }
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
                    <button
                        type="submit"
                        className="p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
                        title={t('add_task', 'Ajouter la tâche')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                    </button>
                </form>

                {loading ? (
                    <div className="flex justify-center items-center h-full p-4">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('loading_todos', 'Chargement des tâches...')}</p>
                    </div>
                ) : filteredTodos.length === 0 ? (
                    <div className="flex justify-center items-center h-full p-4">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('no_todos', 'Aucune tâche pour le moment.')}</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        <AnimatePresence initial={false}>
                            {filteredTodos.map((todo) => (
                                <motion.div
                                    key={todo.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <TaskItem
                                        task={todo}
                                        onToggle={onToggle}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
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