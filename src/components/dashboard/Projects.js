import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseISO, isPast, isValid } from 'date-fns';
import { DashboardCard } from './DashboardCard';

// SOUS-COMPOSANT POUR UNE CARTE DE PROJET
const ProjectItem = ({ project, onAction }) => {
    const deadlineDate = project.deadline ? parseISO(project.deadline) : null;
    const isDeadlineValid = deadlineDate && isValid(deadlineDate);
    const isOverdue = isDeadlineValid && isPast(deadlineDate) && (project.progress || 0) < 100;
    const progressPercentage = project.progress || 0;

    return (
        <div className="futuristic-card p-4 flex flex-col gap-3 bg-slate-800/50 border border-slate-700 hover:border-pink-500/50 transition-colors rounded-xl w-80 flex-shrink-0 h-full scroll-snap-align-center">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-white text-base">{project.name}</h4>
                    <p className="text-xs text-slate-400">{project.client?.name || 'Client interne'}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onAction('edit', project)} title="Modifier" className="action-icon-button">✏️</button>
                    <button onClick={() => onAction('delete', project)} title="Supprimer" className="action-icon-button text-red-400">🗑️</button>
                </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed flex-grow min-h-[40px]">{project.description || 'Aucune description.'}</p>
            <div className="text-xs text-slate-400 space-y-1 border-t border-slate-700 pt-2">
                <div className="flex justify-between"><span>Montant Total:</span><span className="font-semibold text-white">{project.totalAmount || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Montant Payé:</span><span className="font-semibold text-green-400">{project.paidAmount || '0 €'}</span></div>
            </div>
            <div className="mt-auto pt-2">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex -space-x-2">
                        {(project.team || []).map((member) => (
                            <img key={member.id} src={member.avatar || '/images/avatars/default.png'} alt={member.name} title={member.name} className="w-6 h-6 rounded-full border-2 border-slate-800 object-cover" />
                        ))}
                        <button onClick={() => onAction('assignTeam', project)} className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-600" title="Gérer l'équipe">+</button>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-violet-500'}`} style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

// COMPOSANT PRINCIPAL
const Projects = ({ projects, clients, staffMembers, onAddProject, onAction }) => {
    
    const enrichedProjects = useMemo(() => {
        return (projects || []).map(p => ({
            ...p,
            client: (clients || []).find(c => c.id === p.clientId),
            team: (p.teamIds || []).map(id => (staffMembers || []).find(m => m.id === id)).filter(Boolean)
        }));
    }, [projects, clients, staffMembers]);
    
    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container && container.children[activeIndex]) {
            const activeElement = container.children[activeIndex];
            
            const containerWidth = container.offsetWidth;
            const elementWidth = activeElement.offsetWidth;
            const elementLeft = activeElement.offsetLeft;
            
            const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [activeIndex, enrichedProjects]);

    const handleNavigation = (direction) => {
        setActiveIndex(prevIndex => {
            const newIndex = direction === 'right' ? prevIndex + 1 : prevIndex - 1;
            return Math.max(0, Math.min(newIndex, enrichedProjects.length - 1));
        });
    };
    
    const canScrollLeft = activeIndex > 0;
    const canScrollRight = activeIndex < enrichedProjects.length - 1;

    return (
        <DashboardCard 
            // ✅ Icône "Vector Flat" pour le titre de la carte
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M3 3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2H3zm5 2h8v2H8V5zm0 4h8v2H8V9zm0 4h5v2H8v-2z" clipRule="evenodd" /></svg>}
            title="Mes Projets"
            className="h-[520px]"
        >
            <div className="flex flex-col h-full">
                <div className="flex-grow relative overflow-hidden">
                    <AnimatePresence>
                        {canScrollLeft && (
                            <motion.button onClick={() => handleNavigation('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full backdrop-blur-sm" initial={{ opacity:0, scale: 0.5 }} animate={{ opacity:1, scale: 1 }} exit={{ opacity:0, scale: 0.5 }}>
                                {/* ✅ Icône flèche "Vector Flat" */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" /></svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
                    
                    <div 
                        ref={scrollContainerRef} 
                        className="flex gap-4 p-4 h-full overflow-x-auto hide-scrollbar scroll-smooth"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {enrichedProjects.length > 0 ? (
                            enrichedProjects.map(project => (
                                <ProjectItem key={project.id} project={project} onAction={onAction} />
                            ))
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-center p-8 text-sm text-slate-500">Aucun projet à afficher.</div>
                        )}
                    </div>
                    
                    <AnimatePresence>
                        {canScrollRight && (
                            <motion.button onClick={() => handleNavigation('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full backdrop-blur-sm" initial={{ opacity:0, scale: 0.5 }} animate={{ opacity:1, scale: 1 }} exit={{ opacity:0, scale: 0.5 }}>
                                {/* ✅ Icône flèche "Vector Flat" */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" /></svg>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-4 flex-shrink-0">
                    <motion.button 
                        onClick={onAddProject}
                        className="w-full main-action-button bg-gradient-to-r from-pink-500 to-red-600"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        + Ajouter un Projet
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default Projects;