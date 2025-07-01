// components/dashboard/Planning.js
import React from 'react';
import { DashboardCard } from './DashboardComponents';
// Aucuns imports de 'lucide-react', toutes les icônes sont en SVG inline
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { initialMockData } from '../../lib/mockData'; // Import mock data

const PlanningItem = ({ task, t }) => {
    const isOverdue = task.deadline && isPast(parseISO(task.deadline)) && !task.completed;
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5 ${isOverdue ? 'bg-red-500/10' : ''}`}>
            <div className="flex-grow">
                <p className={`font-bold ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                {task.deadline && (
                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                        {t('deadline', 'Échéance')}: {format(parseISO(task.deadline), 'dd/MM/yy', { locale: fr })}
                    </p>
                )}
            </div>
            {task.completed && (
                <span className="text-green-400 text-sm">{t('completed', 'Terminé')}</span>
            )}
        </div>
    );
};

const Planning = ({ t }) => { // Removed tasks prop, will get from mockData
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        // Filter tasks that have a deadline and are not completed, or are overdue.
        // Or simply display all relevant tasks from mockData.tasks
        const relevantTasks = initialMockData.tasks.filter(task => 
            !task.completed || (task.deadline && isPast(parseISO(task.deadline)))
        );
        setTasks(relevantTasks);
    }, []);

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (a.deadline && b.deadline) {
            // Sort by deadline, overdue first
            const dateA = parseISO(a.deadline);
            const dateB = parseISO(b.deadline);
            if (isPast(dateA) && !isPast(dateB)) return -1; // A is overdue, B is not
            if (!isPast(dateA) && isPast(dateB)) return 1;  // B is overdue, A is not
            return dateA.getTime() - dateB.getTime(); // Otherwise, sort by date
        }
        return 0;
    });

    return (
        <DashboardCard icon={
            // CalendarCheck Icon SVG
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H3v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M16 2V6"/><path d="M8 2V6"/><path d="M3 10H21"/><path d="m19 16-2 2-4-4"/></svg>
        } title={t('planning_deadlines_title', 'Planning & Échéances')}>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => <PlanningItem key={task.id} task={task} t={t} />)
                ) : (
                    <p className="text-center p-8 text-sm text-slate-500">{t('empty_planning_message', 'Votre planning est vide. C\'est le moment de le remplir !')}</p>
                )}
            </div>
        </DashboardCard>
    );
};

export default Planning;