 // components/dashboard/TodoList.js
    import React, { useState } from 'react';
    import { DashboardCard } from './DashboardCard';
    import { TaskItem } from './TaskItem';
    import { motion } from 'framer-motion';
    import { useTheme } from '../../context/ThemeContext'; 

    const TodoList = ({ todos, loading, onAdd, onToggle, onDelete, onEdit, t }) => {
      const [newTitle, setNewTitle] = useState('');
      const { isDarkMode } = useTheme(); 

      const handleAdd = (e) => {
        e.preventDefault();
        if (newTitle.trim()) {
          onAdd(newTitle.trim(), 'normal', null);
          setNewTitle('');
        }
      };

      return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
        } title={t('todo_list_title', 'Liste de Tâches')} className="bg-blue-900/20 h-full">
          {loading ? (
            <div className="text-center p-4">
              <p className="text-white">{t('loading_tasks', 'Chargement des tâches...')}</p>
              <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-500 mx-auto mt-4"></div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-grow space-y-1 overflow-y-auto max-h-80 custom-scrollbar pr-2">
                {Array.isArray(todos) && todos.length > 0 // Added Array.isArray check
                  ? todos.map(task => <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} t={t} />)
                  : <p className="text-center p-8 text-sm text-slate-500">{t('no_tasks_message', 'Vous êtes maître de votre destin... et de vos tâches. Ajoutez-en une !')}</p>
                }
              </div>
              <form onSubmit={handleAdd} className="mt-4 relative flex-shrink-0">
                <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder={t('add_task_placeholder', 'Ajouter une tâche et appuyer sur Entrée...')}
                    className={`w-full rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-pink-500 focus:border-pink-500 transition-all
                               ${isDarkMode 
                                   ? 'bg-slate-800 border border-slate-700 text-white' 
                                   : 'bg-white border border-gray-300 text-gray-800'
                               }`}
                />
                <button
                    type="submit"
                    className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md shadow-lg flex items-center justify-center w-10 h-10
                               ${isDarkMode 
                                   ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' 
                                   : 'bg-blue-500 hover:bg-blue-600 text-white' 
                               }`}
                    aria-label={t('add_task', 'Ajouter une tâche')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                </button>
              </form>
            </div>
          )}
        </DashboardCard>
      );
    };

    export default TodoList;