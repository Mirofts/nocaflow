// src/pages/dashboard.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUserTodos } from '@/hooks/useUserTodos';
import { initialMockData } from '@/lib/mockData';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// IMPORTS DES COMPOSANTS DU DASHBOARD :
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TimeAlerts from '../components/dashboard/TimeAlerts';
import TodoList from '../components/dashboard/TodoList';
import Notepad from '../components/dashboard/Notepad';
import Calendar from '../components/dashboard/Calendar';
import Projects from '../components/dashboard/Projects';
import GuestBanner from '../components/dashboard/GuestBanner';
import InvoicesSummary from '../components/dashboard/InvoicesSummary';
import FlowLiveMessages from '../components/dashboard/FlowLiveMessages';
import TeamManagement from '../components/dashboard/TeamManagement';
import ClientManagement from '../components/dashboard/ClientManagement';
import GanttChartPlanning from '../components/dashboard/GanttChartPlanning';
import { DashboardCard } from '../components/dashboard/DashboardCard';


// IMPORTS DES MODALES VIA LE FICHIER CENTRAL D'EXPORTATION dashboardModals.js :
import {
    TaskEditModal, DayDetailsModal, QuickAddTaskModal, GuestNameEditModal, AvatarEditModal,
    MeetingSchedulerModal, ProjectFormModal, InvoiceFormModal, InvoiceListModal, TeamMemberModal,
    QuickChatModal, AssignTaskProjectDeadlineModal, ClientFormModal, UserNameEditModal,
    GanttTaskFormModal, GoogleDriveLinkModal, AddDeadlineModal, AddMeetingModal, AssignTeamModal,
    BlockContactModal, ConfirmDeleteMessageModal, NewDiscussionModal
} from '../components/dashboard/dashboardModals';
import CalculatorModal from '../components/dashboard/CalculatorModal';
import DetailsModal from '@/components/dashboard/modals/DetailsModal';

export default function DashboardPage({ lang, onOpenCalculator, onRegisterClick, onLoginClick }) {
     const { currentUser: authUser, loadingAuth, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { t } = useTranslation('common');

    const isGuestMode = !authUser || authUser.uid === 'guest_noca_flow';
    
    const initialGuestNameSSR = 'Visiteur Curieux';
    const userUid = authUser?.uid;

    const [guestName, setGuestName] = useState(initialGuestNameSSR);
    const [isClient, setIsClient] = useState(false);
    
    // CORRECTION : Ajout de l'état pour le brouillon de facture
    const [invoiceDraft, setInvoiceDraft] = useState(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

const [localData, setLocalData] = useState(() => {
        // Votre structure de base (c'est parfait)
        let initialValue = {
            tasks: [], messages: [], meetings: [], projects: [],
            staffMembers: [], clients: [], ganttTasks: [], invoices: [],
            notes: [], // Assurez-vous que c'est bien un tableau vide
            user: { displayName: initialGuestNameSSR, photoURL: '/images/avatars/avatarguest.jpg' },
        };

        const USE_LOCAL_STORAGE_FOR_GUEST = false;

        if (typeof window !== 'undefined' && USE_LOCAL_STORAGE_FOR_GUEST) {
            try {
                const savedData = JSON.parse(localStorage.getItem('nocaflow_guest_data') || '{}');
                initialValue = {
                    ...initialValue,
                    ...savedData
                };
                const savedGuestName = localStorage.getItem('nocaflow_guest_name');
                if (savedGuestName) {
                    initialValue.user.displayName = savedGuestName;
                }
            } catch (e) {
                console.error("Failed to parse guest data from localStorage, using initial mock data.", e);
                localStorage.removeItem('nocaflow_guest_data');
                localStorage.removeItem('nocaflow_guest_name');
            }
        }
        initialValue = { ...initialValue, ...initialMockData };

        initialValue.tasks = Array.isArray(initialValue.tasks) ? initialValue.tasks : [];
        initialValue.messages = Array.isArray(initialValue.messages) ? initialValue.messages : [];
        initialValue.meetings = Array.isArray(initialValue.meetings) ? initialValue.meetings : [];
        initialValue.projects = Array.isArray(initialValue.projects) ? initialValue.projects : [];
        initialValue.staffMembers = Array.isArray(initialValue.staffMembers) ? initialValue.staffMembers : [];
        initialValue.clients = Array.isArray(initialValue.clients) ? initialValue.clients : [];
         initialValue.ganttTasks = Array.isArray(initialValue.ganttTasks) ? initialValue.ganttTasks : [];
         initialValue.invoices = []; 
        initialValue.notes = Array.isArray(initialValue.notes) ? initialValue.notes : [];
        initialValue.user = initialValue.user || {};

        return initialValue;
    });

    useEffect(() => {
        const USE_LOCAL_STORAGE_FOR_GUEST = false;

        if (typeof window !== 'undefined' && isGuestMode && USE_LOCAL_STORAGE_FOR_GUEST) {
            try {
                localStorage.setItem('nocaflow_guest_data', JSON.stringify(localData));
                if (localData.user?.displayName !== guestName) {
                    localStorage.setItem('nocaflow_guest_name', localData.user?.displayName || initialGuestNameSSR);
                }
            } catch (e) {
                console.error("Failed to save guest data to localStorage.", e);
            }
        }
    }, [localData, isGuestMode, guestName, initialGuestNameSSR]);

    const onUpdateGuestData = useCallback((updater) => {
        setLocalData(prevLocalData => {
            const newData = typeof updater === 'function' ? updater(prevLocalData) : updater;
            const sanitizedData = { ...newData };

            sanitizedData.tasks = Array.isArray(sanitizedData.tasks) ? sanitizedData.tasks : [];
            sanitizedData.messages = Array.isArray(sanitizedData.messages) ? sanitizedData.messages : [];
            sanitizedData.meetings = Array.isArray(sanitizedData.meetings) ? sanitizedData.meetings : [];
            sanitizedData.projects = Array.isArray(sanitizedData.projects) ? sanitizedData.projects : [];
            sanitizedData.staffMembers = Array.isArray(sanitizedData.staffMembers) ? sanitizedData.staffMembers : [];
            sanitizedData.clients = Array.isArray(sanitizedData.clients) ? sanitizedData.clients : [];
            sanitizedData.ganttTasks = Array.isArray(sanitizedData.ganttTasks) ? sanitizedData.ganttTasks : [];
            sanitizedData.invoices = Array.isArray(sanitizedData.invoices) ? sanitizedData.invoices : [];
            sanitizedData.notes = Array.isArray(newData.notes) ? newData.notes : (prevLocalData.notes || []);

            sanitizedData.user = {
                ...(prevLocalData.user || {}),
                ...(newData.user || {}),
                displayName: (newData.user && newData.user.displayName !== undefined) ? newData.user.displayName : prevLocalData.user?.displayName || initialGuestNameSSR,
                photoURL: (newData.user && newData.user.photoURL !== undefined) ? newData.user.photoURL : prevLocalData.user?.photoURL || (initialMockData.user?.photoURL || '/images/avatars/avatarguest.jpg'),
            };

            return sanitizedData;
        });
    }, [initialGuestNameSSR]);


    const onUpdateGuestName = useCallback((newName) => {
        setGuestName(newName);
        onUpdateGuestData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                displayName: newName
            }
        }));
    }, [onUpdateGuestData]);


    const stableGuestInitialTasks = useMemo(() => {
        return isGuestMode ? (localData.tasks || []) : [];
    }, [isGuestMode, localData.tasks]);

    const { todos, setTodos, loading: loadingTodos, addTodo, editTodo, deleteTodo, toggleTodo } =
        useUserTodos(userUid, isGuestMode, onUpdateGuestData, stableGuestInitialTasks);

    const data = useMemo(() => {
        let currentData = { ...localData };

        if (!isGuestMode) {
            currentData.user = authUser;
            currentData.tasks = todos;
        } else {
            currentData.user = {
                ...currentData.user,
                displayName: guestName,
            };
        }

        currentData.messages = Array.isArray(currentData.messages) ? currentData.messages : [];
        currentData.meetings = Array.isArray(currentData.meetings) ? currentData.meetings : [];
        currentData.projects = Array.isArray(currentData.projects) ? currentData.projects : [];
        currentData.staffMembers = Array.isArray(currentData.staffMembers) ? currentData.staffMembers : [];
        currentData.clients = Array.isArray(currentData.clients) ? currentData.clients : [];
        currentData.ganttTasks = Array.isArray(currentData.ganttTasks) ? currentData.ganttTasks : [];
        currentData.invoices = Array.isArray(currentData.invoices) ? currentData.invoices : [];
        currentData.notes = Array.isArray(currentData.notes) ? currentData.notes : [];

        return currentData;
    }, [isGuestMode, localData, todos, guestName, authUser]);

    const visibleTodos = useMemo(() => {
        if (isGuestMode || !authUser) {
            return todos;
        }
        return todos.filter(task => 
            !task.assignedTo || task.assignedTo.length === 0 || task.assignedTo.includes(authUser.uid)
        );
    }, [todos, isGuestMode, authUser]);

    const [activeModal, setActiveModal] = useState(null);
    const [modalProps, setModalProps] = useState(null);

    const openModal = useCallback((name, props = {}) => {
        setActiveModal(name);
        setModalProps(props);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setModalProps(null);
    }, []);


    const addProject = useCallback((newProject) => { onUpdateGuestData(prev => ({ ...prev, projects: [...(prev.projects || []), { ...newProject, id: `p${Date.now()}` }] })); }, [onUpdateGuestData]);
    const editProject = useCallback((updatedProject) => { onUpdateGuestData(prev => ({ ...prev, projects: (prev.projects || []).map(p => p.id === updatedProject.id ? updatedProject : p) })); }, [onUpdateGuestData]);
    const deleteProject = useCallback((projectId) => { onUpdateGuestData(prev => ({ ...prev, projects: (prev.projects || []).filter(p => p.id !== projectId) })); }, [onUpdateGuestData]);
    const updateProjectGoogleDriveLink = useCallback((projectId, link) => { onUpdateGuestData(prev => ({ ...prev, projects: (prev.projects || []).map(p => p.id === projectId ? { ...p, googleDriveLink: link } : p) })); }, [onUpdateGuestData]);
    const addStaffMember = useCallback((newMember) => { onUpdateGuestData(prev => ({ ...prev, staffMembers: [...(prev.staffMembers || []), { ...newMember, id: `s${Date.now()}` }] })); }, [onUpdateGuestData]);
    const updateStaffMember = useCallback((updatedMember) => { onUpdateGuestData(prev => ({ ...prev, staffMembers: (prev.staffMembers || []).map(m => m.id === updatedMember.id ? updatedMember : m) })); }, [onUpdateGuestData]);
    const deleteStaffMember = useCallback((memberId) => { onUpdateGuestData(prev => ({ ...prev, staffMembers: (prev.staffMembers || []).filter(m => m.id !== memberId) })); }, [onUpdateGuestData]);
    const addClient = useCallback((newClient) => { onUpdateGuestData(prev => ({ ...prev, clients: [...(prev.clients || []), { ...newClient, id: `cl${Date.now()}` }] })); }, [onUpdateGuestData]);
    const updateClient = useCallback((updatedClient) => { onUpdateGuestData(prev => ({ ...prev, clients: (prev.clients || []).map(c => c.id === updatedClient.id ? updatedClient : c) })); }, [onUpdateGuestData]);
    const deleteClient = useCallback((clientId) => { onUpdateGuestData(prev => ({ ...prev, clients: (prev.clients || []).filter(c => c.id !== clientId) })); }, [onUpdateGuestData]);

    const handleSaveGanttTask = useCallback((taskData) => {
        onUpdateGuestData(prev => {
            const currentTasks = prev.ganttTasks || [];
            const existingTaskIndex = currentTasks.findIndex(t => t.id === taskData.id);
            let updatedGanttTasks;
            if (existingTaskIndex !== -1) {
                updatedGanttTasks = currentTasks.map(t =>
                    t.id === taskData.id ? taskData : t
                );
            } else {
                const newTask = { ...taskData, id: taskData.id || `gt-${Date.now()}` };
                updatedGanttTasks = [...currentTasks, newTask];
            }
            return { ...prev, ganttTasks: updatedGanttTasks };
        });
    }, [onUpdateGuestData]);


    const handleAddMeeting = useCallback((newMeeting) => { onUpdateGuestData(prev => ({ ...prev, meetings: [...(prev.meetings || []), { ...newMeeting, id: `meeting-${Date.now()}` }] })); }, [onUpdateGuestData]);
    const handleAddDeadline = useCallback((newDeadline) => { onUpdateGuestData(prev => ({ ...prev, projects: [...(prev.projects || []), { ...newDeadline, id: `proj-${Date.now()}` }] })); }, [onUpdateGuestData]);

    // =======================================================================
    //    BLOC DE LOGIQUE POUR LA GESTION DES FACTURES (CORRIGÉ ET COMPLET)
    // =======================================================================
 const handleAddOrEditInvoice = useCallback((invoiceData) => {
        console.log("Sauvegarde de la facture :", invoiceData);
        
        setLocalData(prev => {
            const invoices = prev.invoices || [];
            
            // On s'assure que la variable est bien déclarée ici
            const existingIndex = invoices.findIndex(inv => inv.id === invoiceData.id);
            
            let newInvoices;

            if (existingIndex > -1) {
                // Mode édition
                newInvoices = [...invoices];
                newInvoices[existingIndex] = invoiceData;
            } else {
                // Mode ajout : on ajoute la nouvelle facture au début de la liste
                newInvoices = [{ ...invoiceData, id: `inv-${Date.now()}` }, ...invoices];
            }
            
            return { ...prev, invoices: newInvoices };
        });
    }, []);

        const handleUpdateInvoiceStatus = useCallback((invoiceId, newStatus) => {
        setLocalData(prev => {
            const newInvoices = prev.invoices.map(inv => 
                inv.id === invoiceId ? { ...inv, status: newStatus } : inv
            );
            return { ...prev, invoices: newInvoices };
        });
    }, []);

    const handleDeleteInvoice = useCallback((invoiceId) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
            setLocalData(prev => ({
                ...prev,
                invoices: prev.invoices.filter(inv => inv.id !== invoiceId)
            }));
        }
    }, []);
    
    const openInvoiceModal = useCallback((invoiceToEdit = null) => {
        if (invoiceToEdit) {
            setInvoiceDraft(invoiceToEdit);
        } else {
            const invoices = localData.invoices || [];
            const existingNumbers = invoices.map(inv => parseInt(inv.invoiceNumber?.split('-').pop() || 0));
            const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
            const newInvoiceNumber = `FAC-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;
            setInvoiceDraft({ invoiceNumber: newInvoiceNumber });
        }
        openModal('invoiceForm');
    }, [localData.invoices, openModal]);

    const flowLiveMessagesRef = useRef(null);
    const ganttChartPlanningRef = useRef(null);

    const handleFlowLiveMessagesFullscreen = useCallback(() => { /* ... */ }, []);
    const handleGanttChartPlanningFullscreen = useCallback(() => { /* ... */ }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const messages = data?.messages || [];
        const tasks = data?.tasks || [];
        const meetings = data?.meetings || [];
        return {
            messages: messages.length,
            tasks: tasks.filter(task => !task.completed).length,
            meetings: meetings.filter(meetingItem => new Date(meetingItem.dateTime) > now).length,
        };
    }, [data]);

    const handleOpenAddTaskFromChat = useCallback((chatData) => { /* ... */ }, [openModal, data.staffMembers]);
    const handleOpenCalculatorModal = useCallback(() => { openModal('calculator'); }, [openModal]);
    const handleOpenAlertDetails = useCallback((alertItem) => { /* ... */ }, [openModal, t]);
    const handleSelectUserOnMobile = useCallback((conv) => { /* ... */ }, [openModal, authUser?.uid]);

        if (loadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Chargement...</p> {/* Vous pouvez mettre un spinner ici */}
            </div>
        );
    }

    return (
        <>
            <Head><title>Dashboard - NocaFLOW</title></Head>
            <div className="min-h-screen w-full dashboard-page-content-padding">
                {isClient && isGuestMode && (
                    <div className="guest-banner-wrapper">
                        <GuestBanner onRegisterClick={onRegisterClick} onLoginClick={onLoginClick} t={t} />
                    </div>
                )}
                <motion.div
                    className="max-w-screen-2xl mx-auto space-y-6"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                >
                    <DashboardHeader
                        user={authUser}
                        isGuestMode={isGuestMode}
                        openModal={openModal}
                        handleLogout={logout}
                        stats={stats}
                        t={t}
                        onOpenCalculator={handleOpenCalculatorModal}
                    />

                    <div className="grid grid-cols-12 gap-6">
                        {/* LEFT COLUMN: Flow Live Messages, Notepad, Calendar, InvoicesSummary */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                            <DashboardCard
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>}
                                title={t('flow_messages_title', 'Flow Live Messages')}
                                className="flex-1 min-h-[500px]"
                                onFullscreenClick={handleFlowLiveMessagesFullscreen}
                                t={t}
                                noContentPadding={true}
                            >
                                <FlowLiveMessages
                                    ref={flowLiveMessagesRef}
                                    t={t}
                                    currentLanguage={lang}
                                    onLoginClick={onLoginClick}
                                    onRegisterClick={onRegisterClick}
                                    onOpenAddTaskFromChat={handleOpenAddTaskFromChat}
                                    onAddMeeting={() => openModal('addMeeting')}
                                    onAddDeadline={() => openModal('addDeadline')}
                                    messages={data.messages || []}
                                    user={authUser}
                                    initialMockData={initialMockData}
                                    availableTeamMembers={data.staffMembers || []}
                                    handleSelectUserOnMobile={handleSelectUserOnMobile}
                                />
                            </DashboardCard>

                            <Notepad uid={userUid} isGuest={isGuestMode} onGuestUpdate={onUpdateGuestData} t={t} className="flex-1 min-h-[300px]"/>
                            <Calendar
                                tasks={data.tasks || []}
                                meetings={data.meetings || []}
                                projects={data.projects || []}
                                onDayClick={(date, events) => openModal('dayDetails', { date, events })}
                                t={t}
                                className="flex-1 h-auto"
                            />
                            <InvoicesSummary 
                                invoices={data.invoices || []} 
                                openInvoiceForm={() => openInvoiceModal(null)} 
                                openInvoiceList={() => openModal('invoiceList')} 
                                t={t} 
                                className="flex-1 min-h-[350px]"
                            />
                        </div>

                        {/* RIGHT COLUMN: Time Alerts, TodoList, Projects */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <TimeAlerts
                                projects={data.projects || []}
                                meetings={data.meetings || []}
                                t={t}
                                lang={lang}
                                openModal={openModal}
                                onAlertCardClick={handleOpenAlertDetails}
                            />

                            <TodoList
                                todos={visibleTodos}
                                setTodos={setTodos}
                                loading={loadingTodos}
                                onAdd={addTodo}
                                onToggle={toggleTodo}
                                onEdit={(task) => openModal('taskEdit', task)}
                                onDelete={deleteTodo}
                                onAssignTeam={(task) => openModal('assignTeam', task)}
                                t={t}
                                className="flex-1 h-auto"
                            />
                            <Projects
                                projects={data.projects || []}
                                t={t}
                                onAddProject={addProject}
                                onEditProject={editProject}
                                onDeleteProject={deleteProject}
                                onAddGoogleDriveLink={(projectId) => openModal('googleDriveLink', projectId)}
                                className="flex-1 min-h-[598px]"
                            />
                        </div>

                        {/* Gantt Chart Section (full width) */}
                        <div className="col-span-12">
                            <DashboardCard
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                                title={t('gantt_chart_title', 'Planning Gantt')}
                                className="h-[600px] w-full"
                                onFullscreenClick={handleGanttChartPlanningFullscreen}
                                t={t}
                                noContentPadding={true}
                            >
                                <GanttChartPlanning
                                    ref={ganttChartPlanningRef}
                                    initialTasks={data.ganttTasks || []}
                                    t={t}
                                    staffMembers={data.staffMembers || []}
                                    clients={data.clients || []}
                                    onSaveTask={handleSaveGanttTask}
                                />
                            </DashboardCard>
                        </div>

                        {/* Team Management & Client Management */}
                        <div className="col-span-12 lg:col-span-6">
                            <TeamManagement
                                members={data.staffMembers || []}
                                onAddMember={() => openModal('teamMember', { mode: 'add' })}
                                onEditMember={(member) => openModal('teamMember', { mode: 'edit', member })}
                                onDeleteMember={deleteStaffMember}
                                onQuickChat={(member) => openModal('quickChat', member)}
                                onAssign={(member) => openModal('assignTaskProjectDeadline', member)}
                                t={t}
                                className="h-[400px]"
                            />
                        </div>

                        <div className="col-span-12 lg:col-span-6">
                            <ClientManagement
                                clients={data.clients || []}
                                onAddClient={() => openModal('clientForm', { mode: 'add' })}
                                onEditClient={(client) => openModal('clientForm', { mode: 'edit', client })}
                                onDeleteClient={deleteClient}
                                onInvoiceForm={(client) => openInvoiceModal(null)}
                                onClientInvoices={(client) => openModal('invoiceList', { client })}
                                t={t}
                                className="h-[400px]"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {activeModal === 'taskEdit' && <TaskEditModal t={t} task={modalProps} onSave={editTodo} onClose={closeModal} />}
                {activeModal === 'dayDetails' && <DayDetailsModal t={t} data={modalProps} onAddTask={(date) => openModal('quickTask', { date })} onClose={closeModal} />}
                {activeModal === 'quickTask' && <QuickAddTaskModal t={t} date={modalProps} onSave={addTodo} onClose={closeModal} />}
                {activeModal === 'assignTeam' && modalProps && <AssignTeamModal t={t} task={modalProps} onSave={editTodo} onClose={closeModal} allStaffMembers={data.staffMembers || []} />}
                {activeModal === 'guestName' && isGuestMode && <GuestNameEditModal currentName={guestName} onSave={onUpdateGuestName} onClose={closeModal} t={t} />}
                {activeModal === 'userNameEdit' && !isGuestMode && <UserNameEditModal currentUser={authUser} onClose={closeModal} t={t} />}
                {activeModal === 'avatar' && <AvatarEditModal user={authUser} onClose={closeModal} onUpdateGuestAvatar={(newAvatar) => onUpdateGuestData(prev => ({ ...prev, user: { ...prev.user, photoURL: newAvatar } }))} isGuestMode={isGuestMode} t={t} />}
                {activeModal === 'meeting' && <MeetingSchedulerModal t={t} onSchedule={handleAddMeeting} isGuest={isGuestMode} onClose={closeModal} />}
                {activeModal === 'project' && <ProjectFormModal t={t} onSave={modalProps?.project ? editProject : addProject} initialData={modalProps?.project} onDelete={deleteProject} isGuest={isGuestMode} onClose={closeModal} />}
                
                {/* MODALES DE FACTURATION CORRECTEMENT CONNECTÉES */}
             {activeModal === 'invoiceForm' && (
    <InvoiceFormModal
        t={t}
        authUser={authUser}
        initialDraft={invoiceDraft}
        onUpdateDraft={setInvoiceDraft}
        client={modalProps?.client}
        onAdd={handleAddOrEditInvoice} // <-- CORRECTION APPLIQUÉE
        onClose={closeModal}
    />
)}
                
{activeModal === 'invoiceList' && (
     <InvoiceListModal 
        t={t} 
        invoices={data.invoices || []} 
        onEdit={openInvoiceModal}
        onDelete={handleDeleteInvoice}
        onUpdateStatus={handleUpdateInvoiceStatus} // <-- AJOUTEZ CETTE LIGNE
        onClose={closeModal} 
    />
)}
                
                {activeModal === 'teamMember' && modalProps && <TeamMemberModal t={t} {...modalProps} onSave={modalProps.mode === 'add' ? addStaffMember : updateStaffMember} onDelete={deleteStaffMember} onClose={closeModal} />}
                {activeModal === 'quickChat' && modalProps && <QuickChatModal t={t} member={modalProps} onClose={closeModal} />}
                {activeModal === 'assignTaskProjectDeadline' && modalProps && <AssignTaskProjectDeadlineModal t={t} member={modalProps.member} onClose={closeModal} allStaffMembers={data.staffMembers || []} userUid={userUid} currentUserName={authUser?.displayName || 'Moi'} onAddTask={addTodo} />}
                {activeModal === 'clientForm' && modalProps && <ClientFormModal t={t} {...modalProps} onSave={modalProps.mode === 'add' ? addClient : updateClient} onDelete={deleteClient} onClose={closeModal} />}
                {activeModal === 'ganttTaskForm' && modalProps && <GanttTaskFormModal t={t} initialData={modalProps} onSave={handleSaveGanttTask} onClose={closeModal} allStaffMembers={data.staffMembers || []} allClients={data.clients || []} />}
                {activeModal === 'googleDriveLink' && modalProps && <GoogleDriveLinkModal t={t} projectId={modalProps} onSave={updateProjectGoogleDriveLink} onClose={closeModal} />}
                {activeModal === 'addDeadline' && <AddDeadlineModal t={t} onSave={handleAddDeadline} onClose={closeModal} />}
                {activeModal === 'addMeeting' && <AddMeetingModal t={t} onSave={handleAddMeeting} onClose={closeModal} />}
                {activeModal === 'calculator' && <CalculatorModal t={t} onClose={closeModal} />}
                {activeModal === 'detailsModal' && modalProps && <DetailsModal isOpen={true} onClose={closeModal} title={modalProps.title || ""} content={modalProps.content || ""} />}
            </AnimatePresence>
        </>
    );
}

export async function getServerSideProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common', 'dashboard'])),
        },
    };
}