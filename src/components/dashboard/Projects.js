// components/dashboard/Projects.js
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardCard } from './DashboardCard';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format, parseISO, isPast, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { initialMockData } from '../../lib/mockData';
import { useTheme } from '../../context/ThemeContext';

const ProjectItem = ({ project, t, onEditProject, onDeleteProject, onAddGoogleDriveLink }) => {
    const { isDarkMode } = useTheme();

    const deadlineDate = project.deadline ? parseISO(project.deadline) : null;
    const isDeadlineValid = deadlineDate && isValid(deadlineDate);
    const isOverdue = isDeadlineValid && isPast(deadlineDate) && project.progress < 100;

    const startDate = project.createdAt ? parseISO(project.createdAt) : new Date();
    const totalDurationMs = isDeadlineValid ? deadlineDate.getTime() - startDate.getTime() : 1;
    const elapsedDurationMs = new Date().getTime() - startDate.getTime();
    let progressPercentage = 0;
    if (totalDurationMs > 0) {
        progressPercentage = (elapsedDurationMs / totalDurationMs) * 100;
        progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    } else if (isDeadlineValid && deadlineDate <= new Date()) {
        progressPercentage = 100;
    }

    return (
        <div className={`p-3 flex flex-col gap-3 ${isDarkMode ? 'bg-slate-700' : 'bg-color-bg-tertiary border border-color-border-primary'} rounded-lg shadow-sm`}>
            <div className="flex items-center justify-end gap-1 flex-shrink-0 mb-2">
                {project.googleDriveLink ? (
                     <motion.a
                        href={project.googleDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-green-600 text-white' : 'hover:bg-green-200 text-green-600'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={t('view_drive_folder', 'Voir le dossier Drive')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M12 1L3 6v12l9 5 9-5V6l-9-5z"/><path d="M3 6l9 5 9-5"/><path d="M12 1l9 5"/><path d="M12 1v22"/><path d="M3 6v12"/><path d="M21 6v12"/></svg>
                    </motion.a>
                ) : (
                    <motion.button
                        onClick={() => onAddGoogleDriveLink(project.id)}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-amber-600 text-white' : 'hover:bg-amber-200 text-amber-600'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={t('add_drive_link', 'Ajouter lien Drive')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 19.5V8.5a2.1 2.05 0 0 0-2.1-2.1H5.1A2.1 2.05 0 0 0 3 8.5v11A2.1 2.05 0 0 0 5.1 21.6H17.9A2.1 2.05 0 0 0 20 19.5z"/><path d="M17 7.5V4.5a2.1 2.05 0 0 0-2.1-2.1H8.1A2.1 2.05 0 0 0 6 4.5v3.1"/><path d="M12 9v6"/><path d="M9 12h6"/></svg>
                    </motion.button>
                )}

                <motion.button
                    onClick={() => onEditProject(project)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-color-bg-hover text-color-text-secondary hover:text-color-text-primary'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('edit', 'Modifier')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 2.92 2.92L10 16.5l-4 1.5 1.5-4L17 3Z"/><path d="M7.5 7.5 10 10"/></svg>
                </motion.button>
                <motion.button
                    onClick={() => onDeleteProject(project.id)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-red-600 text-red-400 hover:text-white' : 'hover:bg-red-100 text-red-500 hover:text-red-600'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t('delete', 'Supprimer')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </motion.button>
            </div>

            <div className="flex-grow">
                <p className="font-bold text-color-text-primary text-lg truncate">{project.name}</p>
                <p className="text-sm text-color-text-secondary">{project.client}</p>
            </div>

            <div className="flex flex-col gap-2 text-sm text-color-text-secondary mt-4">
                {isDeadlineValid && (
                    <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-400 font-semibold' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {t('deadline', 'Échéance')}: <span className="font-semibold text-color-text-primary">{format(deadlineDate, 'dd/MM/yy', { locale: fr })}</span>
                        {isOverdue && <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'} ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{t('overdue', 'Dépassée')}</span>}
                    </div>
                )}
                {project.totalAmount && (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        {t('total_amount', 'Montant Total')}: <span className="font-semibold text-color-text-primary">{project.totalAmount}</span>
                    </div>
                )}
                {project.paidAmount && (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        {t('paid_amount', 'Déjà Payé')}: <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-violet-700'}`}>{project.paidAmount}</span>
                    </div>
                )}
                {project.nextPayment && (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {t('next_payment', 'Prochain Paiement')}: <span className={`font-semibold ${isDarkMode ? 'text-amber-400' : 'text-blue-700'}`}>{project.nextPayment}</span>
                    </div>
                )}
                {project.staff && project.staff.length > 0 && (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span className="font-semibold text-color-text-primary">{t('assigned_staff', 'Équipe')}:</span>
                        <div className="flex -space-x-1 overflow-hidden">
                            {project.staff.map((avatarUrl, index) => (
                                <Image
                                    key={index}
                                    className={`inline-block h-6 w-6 rounded-full ring-2 object-cover ${isDarkMode ? 'ring-slate-800' : 'ring-color-bg-primary'}`}
                                    src={avatarUrl}
                                    alt={`Staff member ${index}`}
                                    width={24}
                                    height={24}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={`w-full rounded-full h-2 mt-2 ${isDarkMode ? 'bg-slate-700/50' : 'bg-color-bg-tertiary'}`}>
                <div
                    className={`h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-violet-500'}`}
                    style={{ width: `${project.progress}%` }}
                ></div>
            </div>
            <p className="text-right text-xs text-color-text-secondary mt-1">{project.progress}% {t('completed', 'terminé')}</p>
        </div>
    );
};

const Projects = ({ t, onAddProject, onEditProject, onDeleteProject, onAddGoogleDriveLink, className = '' }) => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects(initialMockData.projects.slice(0, 3));
    }, []);

    const totalProjects = initialMockData.projects.length;

    return (
        <DashboardCard icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        } title={t('my_projects', 'Mes Projets')} className={className}>
            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold text-color-text-primary">{t('total_projects', 'Projets Totaux')}</h3>
                    <span className="text-pink-400 text-3xl font-extrabold">{(totalProjects)}</span>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <ProjectItem
                                key={project.id}
                                project={project}
                                t={t}
                                onEditProject={onEditProject}
                                onDeleteProject={onDeleteProject}
                                onAddGoogleDriveLink={onAddGoogleDriveLink}
                            />
                        ))
                    ) : (
                        <p className="text-center p-8 text-sm text-color-text-secondary">{t('no_projects', 'Aucun projet à afficher. Ajoutez-en un !')}</p>
                    )}
                </div>
                <div className="mt-4 flex-shrink-0">
                    <motion.button
                        onClick={onAddProject}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 shadow-lg main-action-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        {t('add_project', 'Ajouter un projet')}
                    </motion.button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default Projects;