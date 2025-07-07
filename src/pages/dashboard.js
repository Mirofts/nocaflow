// src/pages/dashboard.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Corrected import path for ThemeContext
import { useUserTodos } from '../hooks/useUserTodos';
import { initialMockData } from '../lib/mockData';
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


// IMPORTS DES MODALES :
import {
    TaskEditModal, DayDetailsModal, QuickAddTaskModal, GuestNameEditModal, AvatarEditModal,
    MeetingSchedulerModal, ProjectFormModal, InvoiceFormModal, InvoiceListModal, TeamMemberModal,
    QuickChatModal, AssignTaskProjectDeadlineModal, ClientFormModal, UserNameEditModal,
    GanttTaskFormModal, GoogleDriveLinkModal, AddDeadlineModal, AddMeetingModal
} from '../components/dashboard/modals/modals';
import CalculatorModal from '../components/dashboard/CalculatorModal';
import DetailsModal from '@/components/dashboard/modals/DetailsModal';


export default function DashboardPage({ lang, onOpenCalculator, onRegisterClick, onLoginClick }) {
    const { user: authUser, logout } = useAuth(); // Renommé 'user' en 'authUser' pour éviter la confusion
    const { isDarkMode, toggleTheme } = useTheme();
    const { t } = useTranslation('common');

    // Déterminez isGuestMode en se basant sur authUser
    const isGuestMode = !authUser || authUser.uid === 'guest_noca_flow';
    
    const initialGuestNameSSR = 'Visiteur Curieux';
    const userUid = authUser?.uid; // Utilisez authUser pour l'UID

    const [guestName, setGuestName] = useState(initialGuestNameSSR);

    const [localData, setLocalData] = useState(() => {
        let initialValue = {
            tasks: [], messages: [], meetings: [], projects: [],
            staffMembers: [], clients: [], ganttTasks: [], invoices: [],
            notes: '',
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
        initialValue.invoices = Array.isArray(initialValue.invoices) ? initialValue.invoices : [];
        initialValue.notes = typeof initialValue.notes === 'string' ? initialValue.notes : '';
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
            sanitizedData.notes = typeof sanitizedData.notes === 'string' ? sanitizedData.notes : (prevLocalData.notes || initialMockData.notes || '');

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

    const { todos, loading: loadingTodos, addTodo, editTodo, deleteTodo, toggleTodo } =
        useUserTodos(userUid, isGuestMode, onUpdateGuestData, stableGuestInitialTasks);

    const data = useMemo(() => {
        let currentData = { ...localData };

        if (!isGuestMode) {
            currentData.user = authUser; // Utilisez authUser pour l'utilisateur connecté
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
        currentData.notes = typeof currentData.notes === 'string' ? currentData.notes : '';

        return currentData;
    }, [isGuestMode, localData, todos, guestName, authUser]);


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
                const newTask = {
                    ...taskData,
                    id: taskData.id || `gt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };
                updatedGanttTasks = [...currentTasks, newTask];
            }

            return {
                ...prev,
                ganttTasks: updatedGanttTasks
            };
        });
    }, [onUpdateGuestData]);


    const handleAddMeeting = useCallback((newMeeting) => { onUpdateGuestData(prev => ({ ...prev, meetings: [...(prev.meetings || []), { id: `meeting-${Date.now()}`, title: newMeeting.title, dateTime: newMeeting.dateTime, attendees: newMeeting.attendees, timezone: newMeeting.timezone, sendEmail: newMeeting.sendEmail, googleMeetLink: newMeeting.googleMeetLink || 'https://meet.google.com/new', createdAt: new Date().toISOString(), description: newMeeting.description || '', location: newMeeting.location || '' }] })); }, [onUpdateGuestData]);
    const handleAddDeadline = useCallback((newDeadline) => { onUpdateGuestData(prev => ({ ...prev, projects: [...(prev.projects || []), { id: `proj-${Date.now()}`, name: newDeadline.title, client: newDeadline.client || 'General', progress: 0, deadline: newDeadline.date, description: newDeadline.description, staff: [], paidAmount: '0 €', nextPayment: 'N/A', totalAmount: 'N/A', createdAt: new Date().toISOString(), googleDriveLink: null }] })); }, [onUpdateGuestData]);
    const handleAddInvoice = useCallback((newInvoice) => { onUpdateGuestData(prev => ({ ...prev, invoices: [...(prev.invoices || []), { ...newInvoice, id: `inv-${Date.now()}` }] })); }, [onUpdateGuestData]);

    const flowLiveMessagesRef = useRef(null);
    const ganttChartPlanningRef = useRef(null);

    const handleFlowLiveMessagesFullscreen = useCallback(() => {
        if (flowLiveMessagesRef.current && flowLiveMessagesRef.current.toggleFullScreen) {
            flowLiveMessagesRef.current.toggleFullScreen();
        } else {
            console.warn('Flow Live Messages Fullscreen function not available yet.');
        }
    }, []);

    const handleGanttChartPlanningFullscreen = useCallback(() => {
        if (ganttChartPlanningRef.current && ganttChartPlanningRef.current.toggleFullScreen) {
            ganttChartPlanningRef.current.toggleFullScreen();
        } else {
            console.warn('Gantt Chart Planning Fullscreen function not available via ref.');
        }
    }, []);

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

    const handleOpenAddTaskFromChat = useCallback((chatData) => {
        openModal('assignTaskProjectDeadline', {
            ...chatData,
            isFromChat: true,
            availableTeamMembers: data.staffMembers || []
        });
    }, [openModal, data.staffMembers]);

    const handleOpenCalculatorModal = useCallback(() => {
        openModal('calculator');
    }, [openModal]);

    const handleOpenAlertDetails = useCallback((alertItem) => {
        let title = '';
        let content = '';

        if (alertItem.type === 'deadline') {
            title = t('deadline_details_title', `Détails de l'échéance : ${alertItem.name || alertItem.title || ''}`);
            const deadlineDate = parseISO(alertItem.deadline);
            content = `${t('project_task', 'Tâche/Projet')} : ${alertItem.name || alertItem.title || ''}\n` +
                      `${t('client', 'Client')} : ${alertItem.client || t('not_specified', 'Non spécifié')}\n` +
                      `${t('date', 'Date')} : ${isValid(deadlineDate) ? format(deadlineDate, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A'}\n` +
                      `${t('description', 'Description')} : ${alertItem.description || t('no_description', 'Pas de description.')}`;
        } else if (alertItem.type === 'meeting') {
            title = t('meeting_details_title', `Détails de la réunion : ${alertItem.title || ''}`);
            const meetingDateTime = parseISO(alertItem.dateTime);
            content = `${t('subject', 'Sujet')} : ${alertItem.title || ''}\n` +
                      `${t('date', 'Date')} : ${isValid(meetingDateTime) ? format(meetingDateTime, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A'}\n` +
                      `${t('location', 'Lieu')} : ${alertItem.location || t('not_specified', 'Non spécifié')}\n` +
                      `${t('description', 'Description')} : ${alertItem.description || t('no_description', 'Pas de description.')}`;
        }

        openModal('detailsModal', { title, content });
    }, [openModal, t]);

    // New handler to pass down to FlowLiveMessages
    const handleSelectUserOnMobile = useCallback((conv) => {
        // This function is intended to open a quick chat or profile for the selected user
        // from the conversation sidebar on mobile.
        // `conv` here might be the conversation object, not necessarily a 'user' object.
        // We need to extract the other participant's details.
        const otherParticipant = conv.participantsDetails?.find(p => p.uid !== authUser?.uid); // Utilisez authUser
        if (otherParticipant) {
            openModal('quickChat', otherParticipant); // Pass the actual member object to QuickChatModal
        } else {
            console.warn("handleSelectUserOnMobile received invalid conversation data or could not find other participant:", conv);
        }
    }, [openModal, authUser?.uid]);


    return (
        <>
            <Head><title>Dashboard - NocaFLOW</title></Head>
            <div className="min-h-screen w-full dashboard-page-content-padding">
                {isGuestMode && (
                    <div className="guest-banner-wrapper">
                        <GuestBanner
                            onRegisterClick={onRegisterClick}
                            onLoginClick={onLoginClick}
                            t={t}
                        />
                    </div>
                )}
                <motion.div
                    className="max-w-screen-2xl mx-auto space-y-6"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                >
                    <DashboardHeader
                        user={authUser} // Passez directement authUser
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
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                }
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
                                    onAddMeeting={() => openModal('addMeeting')} // Pass handler to open AddMeetingModal
                                    onAddDeadline={() => openModal('addDeadline')} // Pass handler to open AddDeadlineModal
                                    messages={data.messages || []}
                                    user={authUser} // Passez directement authUser
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
                            <InvoicesSummary invoices={data.invoices || []} openInvoiceForm={() => openModal('invoiceForm')} openInvoiceList={() => openModal('invoiceList', { invoices: data.invoices })} t={t} className="flex-1 min-h-[350px]"/>
                        </div>

                        {/* RIGHT COLUMN: Time Alerts, TodoList, Projects */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            {/* Time Alerts (Prochaine Échéance et Prochaine Réunion) */}
                            <TimeAlerts
                                projects={data.projects || []}
                                meetings={data.meetings || []}
                                t={t}
                                lang={lang}
                                openModal={openModal}
                                onAlertCardClick={handleOpenAlertDetails}
                            />

                            <TodoList
                                todos={data.tasks || []}
                                loading={loadingTodos}
                                onAdd={addTodo}
                                onToggle={toggleTodo}
                                onEdit={(task) => openModal('taskEdit', task)}
                                onDelete={deleteTodo}
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
                                title={t('gantt_chart_title', 'Planning Gantt')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                }
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

                        {/* Team Management & Client Management (full width or 2 columns below Gantt) */}
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
                                onInvoiceForm={(client) => openModal('invoiceForm', { client })}
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
                {activeModal === 'dayDetails' && <DayDetailsModal t={t} data={modalProps} onAddTask={(date) => openModal('quickTask', date)} onClose={closeModal} />}
                {activeModal === 'quickTask' && <QuickAddTaskModal t={t} date={modalProps} onSave={addTodo} onClose={closeModal} />}

                {activeModal === 'guestName' && isGuestMode && (
                    <GuestNameEditModal
                        currentName={guestName}
                        onSave={onUpdateGuestName}
                        onClose={closeModal}
                        t={t}
                    />
                )}
                {activeModal === 'userNameEdit' && !isGuestMode && (
                    <UserNameEditModal
                        currentUser={user} // Pass original 'user' from useAuth for this modal
                        onClose={closeModal}
                        t={t}
                    />
                )}
                {activeModal === 'avatar' && (
                    <AvatarEditModal
                        user={user} // Pass original 'user' from useAuth for this modal
                        onClose={closeModal}
                        onUpdateGuestAvatar={(newAvatar) => onUpdateGuestData(prev => ({ ...prev, user: { ...prev.user, photoURL: newAvatar } }))}
                        isGuestMode={isGuestMode}
                        t={t}
                    />
                )}
                {activeModal === 'meeting' && <MeetingSchedulerModal t={t} onSchedule={handleAddMeeting} isGuest={isGuestMode} onClose={closeModal} />}
                {activeModal === 'project' && modalProps && modalProps.mode === 'edit' ? (
                    <ProjectFormModal t={t} initialData={modalProps.project} onSave={editProject} onDelete={deleteProject} isGuest={isGuestMode} onClose={closeModal} />
                ) : (
                    activeModal === 'project' && <ProjectFormModal t={t} onSave={addProject} isGuest={isGuestMode} onClose={closeModal} />
                )}

                {activeModal === 'invoiceForm' && modalProps && <InvoiceFormModal t={t} isGuest={isGuestMode} client={modalProps.client} onAdd={handleAddInvoice} onClose={closeModal} />}
                {activeModal === 'invoiceList' && modalProps && <InvoiceListModal t={t} invoices={modalProps.client ? (data.invoices || []).filter(inv => inv.client === modalProps.client.name) : (data.invoices || [])} onClose={closeModal} />}

                {activeModal === 'teamMember' && modalProps && <TeamMemberModal t={t} {...modalProps} onSave={modalProps.mode === 'add' ? addStaffMember : updateStaffMember} onDelete={deleteStaffMember} onClose={closeModal} />}
                {activeModal === 'quickChat' && modalProps && <QuickChatModal t={t} member={modalProps} onClose={closeModal} />}
                {activeModal === 'assignTaskProjectDeadline' && modalProps && (
                    <AssignTaskProjectDeadlineModal
                        t={t}
                        member={modalProps.member}
                        onClose={closeModal}
                        allStaffMembers={data.staffMembers || []}
                        userUid={userUid}
                        currentUserName={authUser?.displayName || 'Moi'} // Utilisez authUser ici
                        onAddTask={addTodo}
                    />
                )}

                {activeModal === 'clientForm' && modalProps && <ClientFormModal t={t} {...modalProps} onSave={modalProps.mode === 'add' ? addClient : updateClient} onDelete={deleteClient} onClose={closeModal} />}

                {activeModal === 'ganttTaskForm' && modalProps && (
                    <GanttTaskFormModal
                        t={t}
                        initialData={modalProps}
                        onSave={handleSaveGanttTask}
                        onClose={closeModal}
                        allStaffMembers={data.staffMembers || []}
                        allClients={data.clients || []}
                    />
                )}
                {activeModal === 'googleDriveLink' && modalProps && (
                    <GoogleDriveLinkModal
                        t={t}
                        projectId={modalProps}
                        onSave={updateProjectGoogleDriveLink}
                        onClose={closeModal}
                    />
                )}

                {activeModal === 'addDeadline' && <AddDeadlineModal t={t} onSave={handleAddDeadline} onClose={closeModal} />}
                {activeModal === 'addMeeting' && <AddMeetingModal t={t} onSave={handleAddMeeting} onClose={closeModal} />}

                {activeModal === 'calculator' && <CalculatorModal t={t} onClose={closeModal} />}

                {/* Modale de détails pour les alertes (Deadlines et Meetings) */}
                {activeModal === 'detailsModal' && modalProps && (
                    <DetailsModal
                        isOpen={true}
                        onClose={closeModal}
                        title={modalProps.title || ""}
                        content={modalProps.content || ""}
                    />
                )}
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