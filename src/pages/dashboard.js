// src/pages/dashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUserTodos } from '../hooks/useUserTodos';
import { initialMockData } from '../lib/mockData';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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


export default function DashboardPage({ lang, onOpenCalculator, onRegisterClick, onLoginClick }) {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { t } = useTranslation('common');

    console.log('DashboardPage: Start render');

    const isGuestMode = !user || user.uid === 'guest_noca_flow';
    const initialGuestNameSSR = 'Visiteur Curieux';
    const userUid = user?.uid;

    const [guestName, setGuestName] = useState(initialGuestNameSSR);

    const [localData, setLocalData] = useState(() => {
        console.log('DashboardPage: Initializing localData state');
        let initialValue = initialMockData;

        if (typeof window !== 'undefined') {
            const savedData = JSON.parse(localStorage.getItem('nocaflow_guest_data') || '{}');
            initialValue = {
                ...initialMockData,
                ...savedData
            };
            const savedGuestName = localStorage.getItem('nocaflow_guest_name');
            if (savedGuestName) {
                initialValue.user.displayName = savedGuestName;
            }
        }

        initialValue.tasks = Array.isArray(initialValue.tasks) ? initialValue.tasks : [];
        initialValue.messages = Array.isArray(initialValue.messages) ? initialValue.messages : [];
        initialValue.meetings = Array.isArray(initialValue.meetings) ? initialValue.meetings : [];
        initialValue.projects = Array.isArray(initialValue.projects) ? initialValue.projects : [];
        initialValue.staffMembers = Array.isArray(initialValue.staffMembers) ? initialValue.staffMembers : [];
        initialValue.clients = Array.isArray(initialValue.clients) ? initialValue.clients : [];
        initialValue.ganttTasks = Array.isArray(initialValue.planningTasks) ? initialValue.planningTasks : []; // Ensure this uses planningTasks
        initialValue.invoices = Array.isArray(initialValue.invoices) ? initialValue.invoices : [];
        initialValue.notes = typeof initialValue.notes === 'string' ? initialValue.notes : initialMockData.notes || '';
        initialValue.user = initialValue.user || {};

        console.log('DashboardPage: Initial localData state value:', initialValue);
        return initialValue;
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && isGuestMode) {
            localStorage.setItem('nocaflow_guest_data', JSON.stringify(localData));
            if (localData.user?.displayName !== guestName) {
                setGuestName(localData.user?.displayName || initialGuestNameSSR);
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
                photoURL: (newData.user && newData.user.photoURL !== undefined) ? newData.user.photoURL : prevLocalData.user?.photoURL || (initialMockData.user?.photoURL || '/images/avatarguest.jpg'),
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
    console.log('DashboardPage: todos from useUserTodos:', todos);

    console.log('DashboardPage: Before data useMemo - localData:', localData);
    console.log('DashboardPage: Before data useMemo - todos:', todos);
    console.log('DashboardPage: Before data useMemo - user:', user);

    const data = useMemo(() => {
        console.log('DashboardPage: Inside data useMemo - user:', user);
        console.log('DashboardPage: Inside data useMemo - localData:', localData);
        console.log('DashboardPage: Inside data useMemo - todos:', todos);

        let currentData = { ...localData };

        if (!isGuestMode) {
            currentData.user = user;
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
        currentData.ganttTasks = Array.isArray(currentData.ganttTasks) ? currentData.ganttTasks : []; // Ensure this stays as ganttTasks
        currentData.invoices = Array.isArray(currentData.invoices) ? currentData.invoices : [];
        currentData.notes = typeof currentData.notes === 'string' ? currentData.notes : '';


        console.log('DashboardPage: Data object constructed:', currentData);
        return currentData;
    }, [isGuestMode, localData, todos, guestName, user]);


    const [modals, setModals] = useState({
        taskEdit: null, dayDetails: null, quickTask: null, guestName: false, avatar: false,
        meeting: false, project: null, invoiceForm: null, invoiceList: null, teamMember: null,
        quickChat: null, assignTaskProjectDeadline: null, clientForm: null, userNameEdit: false,
        ganttTaskForm: null, googleDriveLink: null, addDeadline: false, addMeeting: false,
        calculator: false,
    });

    const openModal = useCallback((name, modalData = true) => setModals(prev => ({
        ...Object.keys(prev).reduce((acc, key) => (acc[key] = false, acc), {}),
        [name]: modalData
    })), []);

    const closeModal = useCallback(() => setModals({
        taskEdit: null, dayDetails: null, quickTask: null, guestName: false, avatar: false,
        meeting: false, project: null, invoiceForm: null, invoiceList: null, teamMember: null,
        quickChat: null, assignTaskProjectDeadline: null, clientForm: null, userNameEdit: false,
        ganttTaskForm: null, googleDriveLink: null, addDeadline: false, addMeeting: false,
        calculator: false,
    }), []);

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

    // Handle Gantt task saving: ensures it matches the expected model for GanttChartPlanning
    const handleSaveGanttTask = useCallback((taskData) => {
        onUpdateGuestData(prev => ({
            ...prev,
            ganttTasks: taskData.id
                ? (prev.ganttTasks || []).map(task => task.id === taskData.id ? taskData : task)
                : [...(prev.ganttTasks || []), { ...taskData, id: `gt-${Date.now()}` }]
        }));
    }, [onUpdateGuestData]);

    const handleAddMeeting = useCallback((newMeeting) => { onUpdateGuestData(prev => ({ ...prev, meetings: [...(prev.meetings || []), { id: `meeting-${Date.now()}`, title: newMeeting.title, dateTime: newMeeting.dateTime, attendees: newMeeting.attendees, timezone: newMeeting.timezone, sendEmail: newMeeting.sendEmail, googleMeetLink: newMeeting.googleMeetLink || 'https://meet.google.com/new', createdAt: new Date().toISOString() }] })); }, [onUpdateGuestData]);
    const handleAddDeadline = useCallback((newDeadline) => { onUpdateGuestData(prev => ({ ...prev, projects: [...(prev.projects || []), { id: `proj-${Date.now()}`, name: newDeadline.title, client: newDeadline.client || 'General', progress: 0, deadline: newDeadline.date, description: newDeadline.description, staff: [], paidAmount: '0 €', nextPayment: 'N/A', totalAmount: 'N/A', createdAt: new Date().toISOString(), googleDriveLink: null }] })); }, [onUpdateGuestData]);
    const handleAddInvoice = useCallback((newInvoice) => { onUpdateGuestData(prev => ({ ...prev, invoices: [...(prev.invoices || []), { ...newInvoice, id: `inv-${Date.now()}` }] })); }, [onUpdateGuestData]);

    const flowLiveMessagesRef = React.useRef();
    const ganttChartPlanningRef = React.useRef();

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
            console.warn('Gantt Chart Planning Fullscreen function not available yet.');
        }
    }, []);

    console.log('DashboardPage: Before stats useMemo - data for stats:', data);
    const stats = useMemo(() => {
        console.log('DashboardPage: Inside stats useMemo - data being used:', data);
        const now = new Date();

        const messages = data?.messages || [];
        const tasks = data?.tasks || [];
        const meetings = data?.meetings || [];

        return {
            messages: messages.length,
            tasks: tasks.filter(task => !task.completed).length,
            meetings: meetings.filter(m => new Date(m.dateTime) > now).length,
        };
    }, [data]);
    console.log('DashboardPage: Stats calculated:', stats);

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
                        user={isGuestMode ? data.user : user}
                        isGuestMode={isGuestMode}
                        openModal={openModal}
                        handleLogout={logout}
                        stats={stats}
                        t={t}
                        onOpenCalculator={handleOpenCalculatorModal}
                    />

                    <TimeAlerts projects={data.projects} meetings={data.meetings} t={t} lang={lang} openModal={openModal} />

                    <div className="grid grid-cols-12 gap-6">

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
                                    availableTeamMembers={data.staffMembers}
                                    messages={data.messages}
                                    user={user}
                                    initialMockData={initialMockData}
                                />
                            </DashboardCard>

                            <Notepad uid={userUid} isGuest={isGuestMode} onGuestUpdate={onUpdateGuestData} t={t} className="flex-1 min-h-[300px]"/>
                            <Calendar
                                tasks={data.tasks}
                                meetings={data.meetings}
                                projects={data.projects}
                                onDayClick={(date, events) => openModal('dayDetails', { date, events })}
                                t={t}
                                className="flex-1 h-auto"
                            />
                            <InvoicesSummary invoices={data.invoices} openInvoiceForm={() => openModal('invoiceForm')} openInvoiceList={() => openModal('invoiceList', { invoices: data.invoices })} t={t} className="flex-1 min-h-[350px]"/>
                        </div>

                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <TodoList
                                todos={data.tasks}
                                loading={loadingTodos}
                                onAdd={addTodo}
                                onToggle={toggleTodo}
                                onEdit={(task) => openModal('taskEdit', task)}
                                onDelete={deleteTodo}
                                t={t}
                                className="flex-1 h-auto"
                            />
                            <Projects
                                projects={data.projects}
                                t={t}
                                onAddProject={addProject}
                                onEditProject={editProject}
                                onDeleteProject={deleteProject}
                                onAddGoogleDriveLink={(projectId) => openModal('googleDriveLink', projectId)}
                                className="flex-1 min-h-[598px]"
                            />
                        </div>

                        <div className="col-span-12">
                            <GanttChartPlanning
                                ref={ganttChartPlanningRef}
                                initialTasks={data.ganttTasks} // This prop is correctly passed from data
                                t={t}
                                staffMembers={data.staffMembers}
                                clients={data.clients}
                                onAddTask={(taskData) => openModal('ganttTaskForm', taskData)} // taskData is passed here for editing
                                onSave={handleSaveGanttTask} // This receives the saved task from the modal
                                className="h-[600px] w-full"
                                onFullscreenClick={handleGanttChartPlanningFullscreen}
                            />
                        </div>

                        <div className="col-span-12 lg:col-span-6">
                            <TeamManagement
                                members={data.staffMembers}
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
                                clients={data.clients}
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
                {modals.taskEdit && <TaskEditModal t={t} task={modals.taskEdit} onSave={editTodo} onClose={closeModal} />}
                {modals.dayDetails && <DayDetailsModal t={t} data={modals.dayDetails} onAddTask={(date) => openModal('quickTask', date)} onClose={closeModal} />}
                {modals.quickTask && <QuickAddTaskModal t={t} date={modals.quickTask} onSave={addTodo} onClose={closeModal} />}

                {modals.guestName && isGuestMode && (
                    <GuestNameEditModal
                        currentName={guestName}
                        onSave={onUpdateGuestName}
                        onClose={closeModal}
                        t={t}
                    />
                )}
                {modals.userNameEdit && !isGuestMode && (
                    <UserNameEditModal
                        currentUser={user}
                        onClose={closeModal}
                        t={t}
                    />
                )}
                {modals.avatar && (
                    <AvatarEditModal
                        user={user}
                        onClose={closeModal}
                        onUpdateGuestAvatar={(newAvatar) => onUpdateGuestData(prev => ({ ...prev, user: { ...prev.user, photoURL: newAvatar } }))}
                        isGuestMode={isGuestMode}
                        t={t}
                    />
                )}
                {modals.meeting && <MeetingSchedulerModal t={t} onSchedule={handleAddMeeting} isGuest={isGuestMode} onClose={closeModal} />}
                {modals.project && modals.project.mode === 'edit' ? (
                    <ProjectFormModal t={t} initialData={modals.project.project} onSave={editProject} onDelete={deleteProject} isGuest={isGuestMode} onClose={closeModal} />
                ) : (
                    modals.project && <ProjectFormModal t={t} onSave={addProject} isGuest={isGuestMode} onClose={closeModal} />
                )}

                {modals.invoiceForm && <InvoiceFormModal t={t} isGuest={isGuestMode} client={modals.invoiceForm.client} onAdd={handleAddInvoice} onClose={closeModal} />}
                {modals.invoiceList && <InvoiceListModal t={t} invoices={modals.invoiceList.client ? (data.invoices || []).filter(inv => inv.client === modals.invoiceList.client.name) : (data.invoices || [])} onClose={closeModal} />}

                {modals.teamMember && <TeamMemberModal t={t} {...modals.teamMember} onSave={modals.teamMember.mode === 'add' ? addStaffMember : updateStaffMember} onDelete={deleteStaffMember} onClose={closeModal} />}
                {modals.quickChat && <QuickChatModal t={t} member={modals.quickChat} onClose={closeModal} />}
                {modals.assignTaskProjectDeadline && (
                    <AssignTaskProjectDeadlineModal
                        t={t}
                        member={modals.assignTaskProjectDeadline}
                        onClose={closeModal}
                        allStaffMembers={data.staffMembers}
                        userUid={userUid}
                        currentUserName={user?.displayName || 'Moi'}
                        onAddTask={addTodo}
                    />
                )}

                {modals.clientForm && <ClientFormModal t={t} {...modals.clientForm} onSave={modals.clientForm.mode === 'add' ? addClient : updateClient} onDelete={deleteClient} onClose={closeModal} />}

                {modals.ganttTaskForm && (
                    <GanttTaskFormModal
                        t={t}
                        initialData={modals.ganttTaskForm} // This is the task data being passed for editing
                        onSave={handleSaveGanttTask}
                        onClose={closeModal}
                        allStaffMembers={data.staffMembers}
                        allClients={data.clients}
                    />
                )}
                {modals.googleDriveLink && (
                    <GoogleDriveLinkModal
                        t={t}
                        projectId={modals.googleDriveLink}
                        onSave={updateProjectGoogleDriveLink}
                        onClose={closeModal}
                    />
                )}

                {modals.addDeadline && <AddDeadlineModal t={t} onSave={handleAddDeadline} onClose={closeModal} />}
                {modals.addMeeting && <AddMeetingModal t={t} onSave={handleAddMeeting} onClose={closeModal} />}

                {modals.calculator && <CalculatorModal t={t} onClose={closeModal} />}
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