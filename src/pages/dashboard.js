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

// IMPORTS POUR LES NOUVELLES FONCTIONNALITÉS
import { DndContext } from '@dnd-kit/core';
import GroupManagement from '../components/dashboard/GroupManagement';

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
    const [invoiceDraft, setInvoiceDraft] = useState(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [localData, setLocalData] = useState(() => {
        let initialValue = { ...initialMockData };

        // Préparation pour la fonctionnalité des groupes
        initialValue.groups = initialMockData.groups || [{ id: 'default', name: 'Non Assignés' }];
        initialValue.staffMembers = (initialValue.staffMembers || []).map(m => ({ ...m, groupId: m.groupId || null }));
        initialValue.clients = (initialValue.clients || []).map(c => ({ ...c, groupId: c.groupId || null }));
        initialValue.invoices = []; 

        return initialValue;
    });

    useEffect(() => {
        const USE_LOCAL_STORAGE_FOR_GUEST = false;
        if (typeof window !== 'undefined' && isGuestMode && USE_LOCAL_STORAGE_FOR_GUEST) {
            localStorage.setItem('nocaflow_guest_data', JSON.stringify(localData));
            if (localData.user?.displayName !== guestName) {
                localStorage.setItem('nocaflow_guest_name', localData.user?.displayName || initialGuestNameSSR);
            }
        }
    }, [localData, isGuestMode, guestName, initialGuestNameSSR]);

    const onUpdateGuestData = useCallback((updater) => {
        setLocalData(prev => ({ ...prev, ...(typeof updater === 'function' ? updater(prev) : updater) }));
    }, []);

    const onUpdateGuestName = useCallback((newName) => {
        setGuestName(newName);
        onUpdateGuestData(prev => ({ ...prev, user: { ...prev.user, displayName: newName } }));
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
            currentData.user = { ...currentData.user, displayName: guestName };
        }
        return currentData;
    }, [isGuestMode, localData, todos, guestName, authUser]);

    const visibleTodos = useMemo(() => {
        if (isGuestMode || !authUser) return todos;
        return todos.filter(task => !task.assignedTo || task.assignedTo.length === 0 || task.assignedTo.includes(authUser.uid));
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
            if (existingTaskIndex > -1) {
                updatedGanttTasks = currentTasks.map(t => t.id === taskData.id ? taskData : t);
            } else {
                updatedGanttTasks = [...currentTasks, { ...taskData, id: taskData.id || `gt-${Date.now()}` }];
            }
            return { ...prev, ganttTasks: updatedGanttTasks };
        });
    }, [onUpdateGuestData]);

    const handleAddMeeting = useCallback((newMeeting) => { onUpdateGuestData(prev => ({ ...prev, meetings: [...(prev.meetings || []), { ...newMeeting, id: `meeting-${Date.now()}` }] })); }, [onUpdateGuestData]);
    const handleAddDeadline = useCallback((newDeadline) => { onUpdateGuestData(prev => ({ ...prev, projects: [...(prev.projects || []), { ...newDeadline, id: `proj-${Date.now()}` }] })); }, [onUpdateGuestData]);

    // =======================================================================
    //    LOGIQUE COMPLÈTE POUR LES GROUPES ET LES FACTURES
    // =======================================================================

    const handleAddOrEditInvoice = useCallback((invoiceData) => {
        setLocalData(prev => {
            const invoices = prev.invoices || [];
            const existingIndex = invoices.findIndex(inv => inv.id === invoiceData.id);
            let newInvoices;
            if (existingIndex > -1) {
                newInvoices = [...invoices];
                newInvoices[existingIndex] = invoiceData;
            } else {
                newInvoices = [{ ...invoiceData, id: `inv-${Date.now()}` }, ...invoices];
            }
            return { ...prev, invoices: newInvoices };
        });
    }, []);

    const handleDeleteInvoice = useCallback((invoiceId) => {
        if (confirm("Supprimer cette facture ?")) {
            setLocalData(prev => ({ ...prev, invoices: prev.invoices.filter(inv => inv.id !== invoiceId) }));
        }
    }, []);
    
    const handleUpdateInvoiceStatus = useCallback((invoiceId, newStatus) => {
        setLocalData(prev => ({ ...prev, invoices: prev.invoices.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv) }));
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

    const addGroup = useCallback((name) => {
        const newGroup = { id: `group_${Date.now()}`, name };
        onUpdateGuestData(prev => ({ ...prev, groups: [...(prev.groups || []), newGroup] }));
    }, [onUpdateGuestData]);

    const deleteGroup = useCallback((groupId) => {
        if (groupId === 'default') return alert("Le groupe par défaut ne peut être supprimé.");
        if (confirm("Supprimer ce groupe ? Les membres retourneront dans la liste des non-assignés.")) {
            onUpdateGuestData(prev => {
                const updatedMembers = prev.staffMembers.map(m => m.groupId === groupId ? { ...m, groupId: null } : m);
                const updatedClients = prev.clients.map(c => c.groupId === groupId ? { ...c, groupId: null } : c);
                const updatedGroups = prev.groups.filter(g => g.id !== groupId);
                return { ...prev, groups: updatedGroups, staffMembers: updatedMembers, clients: updatedClients };
            });
        }
    }, [onUpdateGuestData]);

    const assignToGroup = useCallback((personId, personType, newGroupId) => {
        setLocalData(prev => {
            if (personType === 'member') {
                return { ...prev, staffMembers: prev.staffMembers.map(m => m.id === personId ? { ...m, groupId: newGroupId } : m) };
            }
            if (personType === 'client') {
                return { ...prev, clients: prev.clients.map(c => c.id === personId ? { ...c, groupId: newGroupId } : c) };
            }
            return prev;
        });
    }, []);

    const handleDragEnd = useCallback((event) => {
        const { over, active } = event;
        if (over && active) {
            assignToGroup(active.id, active.data.current?.type, over.id);
        }
    }, [assignToGroup]);

    const flowLiveMessagesRef = useRef(null);
    const ganttChartPlanningRef = useRef(null);

    const handleFlowLiveMessagesFullscreen = useCallback(() => {
        if (flowLiveMessagesRef.current && flowLiveMessagesRef.current.toggleFullScreen) {
            flowLiveMessagesRef.current.toggleFullScreen();
        }
    }, []);

    const handleGanttChartPlanningFullscreen = useCallback(() => {
        if (ganttChartPlanningRef.current && ganttChartPlanningRef.current.toggleFullScreen) {
            ganttChartPlanningRef.current.toggleFullScreen();
        }
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        return {
            messages: (data.messages || []).length,
            tasks: (data.tasks || []).filter(task => !task.completed).length,
            meetings: (data.meetings || []).filter(meetingItem => new Date(meetingItem.dateTime) > now).length,
        };
    }, [data]);

    const handleOpenAddTaskFromChat = useCallback((chatData) => {
        openModal('assignTaskProjectDeadline', { ...chatData, isFromChat: true, availableTeamMembers: data.staffMembers || [] });
    }, [openModal, data.staffMembers]);

    const handleOpenCalculatorModal = useCallback(() => { openModal('calculator'); }, [openModal]);
    const handleOpenAlertDetails = useCallback((alertItem) => {
        let title = '';
        let content = '';
        if (alertItem.type === 'deadline') {
            title = t('deadline_details_title', `Détails de l'échéance : ${alertItem.name || alertItem.title || ''}`);
            const deadlineDate = parseISO(alertItem.deadline);
            content = `${t('project_task', 'Tâche/Projet')} : ${alertItem?.name || alertItem?.title || ''}\n` +
                      `${t('client', 'Client')} : ${alertItem?.client || t('not_specified', 'Non spécifié')}\n` +
                      `${t('date', 'Date')} : ${isValid(deadlineDate) ? format(deadlineDate, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A'}\n` +
                      `${t('description', 'Description')} : ${alertItem?.description || t('no_description', 'Pas de description.')}`;
        } else if (alertItem.type === 'meeting') {
            title = t('meeting_details_title', `Détails de la réunion : ${alertItem.title || ''}`);
            const meetingDateTime = parseISO(alertItem.dateTime);
            content = `${t('subject', 'Sujet')} : ${alertItem?.title || ''}\n` +
                      `${t('date', 'Date')} : ${isValid(meetingDateTime) ? format(meetingDateTime, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A'}\n` +
                      `${t('location', 'Lieu')} : ${alertItem?.location || t('not_specified', 'Non spécifié')}\n` +
                      `${t('description', 'Description')} : ${alertItem?.description || t('no_description', 'Pas de description.')}`;
        }
        openModal('detailsModal', { title, content });
    }, [openModal, t]);

    const handleSelectUserOnMobile = useCallback((conv) => {
        const otherParticipant = conv.participantsDetails?.find(p => p.uid !== authUser?.uid);
        if (otherParticipant) {
            openModal('quickChat', otherParticipant);
        }
    }, [openModal, authUser?.uid]);


    if (loadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Chargement...</p>
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
                        {/* LEFT COLUMN */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                            <DashboardCard
                                title={t('flow_messages_title', 'Flow Live Messages')}
                                className="flex-1 min-h-[500px]" noContentPadding={true}
                            >
                                <FlowLiveMessages
                                    ref={flowLiveMessagesRef} t={t} currentLanguage={lang} onLoginClick={onLoginClick}
                                    onRegisterClick={onRegisterClick} onOpenAddTaskFromChat={handleOpenAddTaskFromChat}
                                    onAddMeeting={() => openModal('addMeeting')} onAddDeadline={() => openModal('addDeadline')}
                                    messages={data.messages || []} user={authUser} initialMockData={initialMockData}
                                    availableTeamMembers={data.staffMembers || []} handleSelectUserOnMobile={handleSelectUserOnMobile}
                                />
                            </DashboardCard>
                            <Notepad uid={userUid} isGuest={isGuestMode} onGuestUpdate={onUpdateGuestData} t={t} className="flex-1 min-h-[300px]"/>
                            <Calendar tasks={data.tasks || []} meetings={data.meetings || []} projects={data.projects || []} onDayClick={(date, events) => openModal('dayDetails', { date, events })} t={t} className="flex-1 h-auto" />
                            <InvoicesSummary invoices={data.invoices || []} openInvoiceForm={() => openInvoiceModal(null)} openInvoiceList={() => openModal('invoiceList')} t={t} className="flex-1 min-h-[350px]"/>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <TimeAlerts projects={data.projects || []} meetings={data.meetings || []} t={t} lang={lang} openModal={openModal} onAlertCardClick={handleOpenAlertDetails} />
                            <TodoList todos={visibleTodos} setTodos={setTodos} loading={loadingTodos} onAdd={addTodo} onToggle={toggleTodo} onEdit={(task) => openModal('taskEdit', task)} onDelete={deleteTodo} onAssignTeam={(task) => openModal('assignTeam', task)} t={t} className="flex-1 h-auto" />
                            <Projects projects={data.projects || []} t={t} onAddProject={addProject} onEditProject={editProject} onDeleteProject={deleteProject} onAddGoogleDriveLink={(projectId) => openModal('googleDriveLink', projectId)} className="flex-1 min-h-[598px]" />
                        </div>

                        {/* FULL-WIDTH SECTIONS */}
                        <div className="col-span-12">
                            <DashboardCard title={t('gantt_chart_title', 'Planning Gantt')} className="h-[600px] w-full" noContentPadding={true}>
                                <GanttChartPlanning ref={ganttChartPlanningRef} initialTasks={data.ganttTasks || []} t={t} staffMembers={data.staffMembers || []} clients={data.clients || []} onSaveTask={handleSaveGanttTask} />
                            </DashboardCard>
                        </div>

                        {/* NOUVELLE SECTION À 3 COLONNES AVEC DRAG & DROP */}
                        <DndContext onDragEnd={handleDragEnd}>
                            <div className="col-span-12 lg:col-span-4">
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
                            <div className="col-span-12 lg:col-span-4">
                                <GroupManagement
                                    groups={data.groups || []}
                                    allMembers={data.staffMembers || []}
                                    allClients={data.clients || []}
                                    onAddGroup={addGroup}
                                    onDeleteGroup={deleteGroup}
                                    t={t}
                                />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <ClientManagement
                                    clients={data.clients || []}
                                    onAddClient={() => openModal('clientForm', { mode: 'add' })}
                                    onEditClient={(client) => openModal('clientForm', { mode: 'edit', client })}
                                    onDeleteClient={deleteClient}
                                    onInvoiceForm={(client) => openInvoiceModal(null)}
                                    onClientInvoices={(client) => openModal('invoiceList')}
                                    t={t}
                                    className="h-[400px]"
                                />
                            </div>
                        </DndContext>
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
                
                {activeModal === 'invoiceForm' && <InvoiceFormModal t={t} authUser={authUser} initialDraft={invoiceDraft} onUpdateDraft={setInvoiceDraft} onAdd={handleAddOrEditInvoice} onClose={closeModal} />}
                {activeModal === 'invoiceList' && <InvoiceListModal t={t} invoices={data.invoices || []} onEdit={openInvoiceModal} onDelete={handleDeleteInvoice} onUpdateStatus={handleUpdateInvoiceStatus} onClose={closeModal} />}
                
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