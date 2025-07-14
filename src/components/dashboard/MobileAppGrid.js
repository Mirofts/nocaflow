// src/components/dashboard/MobileAppGrid.js
import React from 'react';

const iconStyle = "w-7 h-7 text-color-text-secondary group-hover:text-purple-300 transition-colors duration-200";

const MobileAppGrid = ({ t, openFullScreenModal }) => {
    const appIcons = [
        { id: 'messages', title: t('quick_nav_messages', 'Messages'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, component: 'FlowLiveMessages' },
        { id: 'notepad', title: t('quick_nav_notepad', 'Bloc-notes'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>, component: 'Notepad' },
        { id: 'calendar', title: t('quick_nav_calendar', 'Calendrier'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>, component: 'Calendar' },
        { id: 'gantt', title: t('quick_nav_gantt', 'Planning Gantt'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>, component: 'GanttChartPlanning' },
        { id: 'projects', title: t('quick_nav_projects', 'Projets'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>, component: 'Projects' },
        { id: 'team', title: t('quick_nav_team', 'Mon Équipe'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, component: 'TeamManagement' },
        { id: 'clients', title: t('quick_nav_clients', 'Clients'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, component: 'ClientManagement' },
        { id: 'invoices', title: t('quick_nav_invoices', 'Factures'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, component: 'InvoiceListModal' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
            {appIcons.map((anchor) => (
                <button
                    key={anchor.id}
                    onClick={() => openFullScreenModal(anchor.component, anchor.title)}
                    title={anchor.title}
                    className="group relative flex flex-col items-center justify-center p-4 h-28 bg-white/5 border border-white/10 rounded-xl transition-all duration-200 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
                >
                    <div className="mb-2">
                        {React.cloneElement(anchor.icon, { className: iconStyle })}
                    </div>
                    <span className="text-sm text-color-text-primary font-medium">{anchor.title}</span>
                </button>
            ))}
        </div>
    );
};

export default MobileAppGrid;