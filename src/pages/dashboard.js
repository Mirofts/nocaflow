import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUserTodos } from '@/hooks/useUserTodos';
import { initialMockData } from '@/lib/mockData';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { format, parseISO, isValid, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import FullScreenModal from '../components/dashboard/modals/FullScreenModal';
import MobileAppGrid from '../components/dashboard/MobileAppGrid';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import GroupManagement from '../components/dashboard/GroupManagement';
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
import {
    TaskEditModal, DayDetailsModal, QuickAddTaskModal, GuestNameEditModal, AvatarEditModal,
    MeetingSchedulerModal, ProjectFormModal, InvoiceFormModal, InvoiceListModal, TeamMemberModal,
    QuickChatModal, AssignTaskProjectDeadlineModal, ClientFormModal, UserNameEditModal,
    GanttTaskFormModal, GoogleDriveLinkModal, AddDeadlineModal, AddMeetingModal, AssignTeamModal,
    BlockContactModal, ConfirmDeleteMessageModal, NewDiscussionModal
} from '../components/dashboard/dashboardModals';
import CalculatorModal from '../components/dashboard/CalculatorModal';
import DetailsModal from '@/components/dashboard/modals/DetailsModal';

function useAppSensors() {
    return useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {})
    );
}

export default function DashboardPage({ lang, onOpenCalculator, onRegisterClick, onLoginClick }) {
    
    const { currentUser: authUser, loadingAuth, logout } = useAuth();
    const { t } = useTranslation('common');
    const sensors = useAppSensors();
    const isMobileView = useMediaQuery('(max-width: 1023px)');
    const [fullScreenModal, setFullScreenModal] = useState({ isOpen: false, component: null, title: '' });
    const isGuestMode = !authUser || authUser.uid === 'guest_noca_flow';
    const initialGuestNameSSR = 'Visiteur Curieux';
    const userUid = authUser?.uid;
    const [guestName, setGuestName] = useState(initialGuestNameSSR);
    const [isClient, setIsClient] = useState(false);
    const [invoiceDraft, setInvoiceDraft] = useState(null);
    const flowLiveMessagesRef = useRef(null);
    const ganttChartPlanningRef = useRef(null);


// --- FIN DU BLOC DE CODE À COLLER ---

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [localData, setLocalData] = useState(() => {
        let initialValue = { ...initialMockData };
        initialValue.groups = initialMockData.groups || [{ id: 'default', name: 'Non Assignés' }, { id: 'group-1-example', name: 'Groupe 1' }];
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

    // --- COLLEZ VOTRE BLOC DE CODE ICI ---
const unifiedMembers = useMemo(() => {
    const membersMap = new Map();
    // ... (le reste de la logique unifiedMembers)
    return Array.from(membersMap.values());
}, [data.staffMembers, data.messages, authUser?.uid]);

const handleStartChat = useCallback((member) => {
    if (flowLiveMessagesRef.current) {
        flowLiveMessagesRef.current.selectOrCreateConversationWithUser(member);
    } else {
        console.error("La référence à FlowLiveMessages n'est pas prête.");
    }
}, []);
// --- FIN DU BLOC ---

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

    const openFullScreenModal = useCallback((component, title) => {
        setFullScreenModal({ isOpen: true, component, title });
    }, []);

    const closeFullScreenModal = useCallback(() => {
        setFullScreenModal({ isOpen: false, component: null, title: '' });
    }, []);

    const findUserByIdOrEmail = useCallback(async (identifier, searchType) => {
        try {
            console.log(`Simulation de recherche pour l'utilisateur: ${identifier} par ${searchType}`);
            return null;
        } catch (error) {
            console.error("Erreur lors de la recherche de l'utilisateur:", error);
            return null;
        }
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
        if (confirm(t("confirm_delete_invoice", "Supprimer cette facture ?"))) {
            setLocalData(prev => ({ ...prev, invoices: prev.invoices.filter(inv => inv.id !== invoiceId) }));
        }
    }, [t]);
    const handleUpdateInvoiceStatus = useCallback((invoiceId, newStatus) => {
        setLocalData(prev => ({ ...prev, invoices: prev.invoices.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv) }));
    }, []);
    const openInvoiceModal = useCallback((invoiceToEdit = null) => {
        if (invoiceToEdit) {
            setInvoiceDraft(invoiceToEdit);
        } else {
            const invoices = localData.invoices || [];
            const existingNumbers = invoices.map(inv => parseInt(inv.invoiceNumber?.split('-').pop() || 0));
            const nextNumber = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
            const newInvoiceNumber = `FAC-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;
            setInvoiceDraft({ invoiceNumber: newInvoiceNumber });
        }
        openModal('invoiceForm');
    }, [localData.invoices, openModal]);
    const handleProjectAction = useCallback((action, project) => {
        switch (action) {
            case 'edit': openModal('projectForm', { initialData: project, allClients: data.clients, allStaffMembers: data.staffMembers }); break;
            case 'createInvoice': const invoiceDraft = { title: t('invoice_for_project', `Facture pour : ${project.name}`), clientInfo: project.client || {}, lineItems: [{ id: Date.now(), description: project.name, quantity: 1, unitPrice: 0 }], }; openModal('invoiceForm', { initialDraft: invoiceDraft }); break;
            case 'createTask': openModal('quickTask', { projectContext: { id: project.id, name: project.name } }); break;
            case 'assignTeam': openModal('assignTeam', { task: { id: project.id, title: project.name, assignedTo: project.teamIds || [] } }); break;
            case 'delete': deleteProject(project.id); break;
            case 'chatGroup': alert(t('chat_group_feature_coming', `Démarrer un chat de groupe pour le projet "${project.name}" (fonctionnalité à venir).`)); break;
            case 'chatClient': if (project.client) { alert(t('chat_client_feature_coming', `Démarrer un chat avec le client "${project.client.name}" (fonctionnalité à venir).`)); } else { alert(t('no_client_assigned', "Aucun client n'est assigné à ce projet.")); } break;
            default: console.warn(t('unknown_project_action', "Action de projet inconnue:"), action);
        }
    }, [data.clients, data.staffMembers, openModal, deleteProject, t]);
    const addGroup = useCallback((name) => {
        const newGroup = { id: `group_${Date.now()}`, name };
        onUpdateGuestData(prev => ({ ...prev, groups: [...(prev.groups || []), newGroup] }));
    }, [onUpdateGuestData]);
    const deleteGroup = useCallback((groupId) => {
        if (groupId === 'default') return alert(t("default_group_cannot_be_deleted", "Le groupe par défaut ne peut être supprimé."));
        if (confirm(t("confirm_delete_group", "Supprimer ce groupe ? Les membres retourneront dans la liste des non-assignés."))) {
            onUpdateGuestData(prev => {
                const updatedMembers = prev.staffMembers.map(m => m.groupId === groupId ? { ...m, groupId: null } : m);
                const updatedClients = prev.clients.map(c => c.groupId === groupId ? { ...c, groupId: null } : c);
                const updatedGroups = prev.groups.filter(g => g.id !== groupId);
                return { ...prev, groups: updatedGroups, staffMembers: updatedMembers, clients: updatedClients };
            });
        }
    }, [onUpdateGuestData, t]);
    const renameGroup = useCallback((groupId, newName) => {
        onUpdateGuestData(prev => ({ ...prev, groups: prev.groups.map(g => g.id === groupId ? { ...g, name: newName } : g) }));
    }, [onUpdateGuestData]);
    const assignToGroup = useCallback((personId, personType, newGroupId) => {
        setLocalData(prev => {
            if (personType === 'member') { const staffMembers = prev.staffMembers.map(m => m.id === personId ? { ...m, groupId: newGroupId } : m); return { ...prev, staffMembers }; }
            if (personType === 'client') { const clients = prev.clients.map(c => c.id === personId ? { ...c, groupId: newGroupId } : c); return { ...prev, clients }; }
            return prev;
        });
    }, []);
    const handleDragEnd = useCallback((event) => {
        const { over, active } = event;
        if (over && active) { assignToGroup(active.id, active.data.current?.type, over.id); }
    }, [assignToGroup]);
    const handleFlowLiveMessagesFullscreen = useCallback(() => { if (flowLiveMessagesRef.current) flowLiveMessagesRef.current.toggleFullScreen(); }, []);
    const handleGanttChartPlanningFullscreen = useCallback(() => { if (ganttChartPlanningRef.current) ganttChartPlanningRef.current.toggleFullScreen(); }, []);
    const stats = useMemo(() => {
        const now = new Date();
        return {
            messages: (data.messages || []).length,
            tasks: (data.tasks || []).filter(task => !task.completed).length,
            meetings: (data.meetings || []).filter(meetingItem => meetingItem.dateTime && isAfter(parseISO(meetingItem.dateTime), now)).length,
        };
    }, [data]);
    const { nextUpcomingMeeting, nextUpcomingDeadline } = useMemo(() => {
        const now = new Date();
        const futureMeetings = (data.meetings || [])
            .filter(m => m.dateTime && isAfter(parseISO(m.dateTime), now))
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        const futureDeadlines = (data.projects || [])
            .filter(p => p.deadline && isAfter(parseISO(p.deadline), now))
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        return {
            nextUpcomingMeeting: futureMeetings[0],
            nextUpcomingDeadline: futureDeadlines[0],
        };
    }, [data.meetings, data.projects]);
    const handleOpenAddTaskFromChat = useCallback((chatData) => {
        openModal('assignTaskProjectDeadline', { ...chatData, isFromChat: true, availableTeamMembers: data.staffMembers || [] });
    }, [openModal, data.staffMembers]);
    const handleOpenCalculatorModal = useCallback(() => { openModal('calculator'); }, [openModal]);
    const handleGroupAction = useCallback((action, group) => {
        switch (action) {
            case 'addTask': openModal('quickTask', { groupContext: group }); break;
            case 'addDeadline': openModal('addDeadline', { groupContext: group }); break;
            case 'startDiscussion': const membersInGroup = localData.staffMembers.filter(m => m.groupId === group.id); const clientsInGroup = localData.clients.filter(c => c.groupId === group.id); const participants = [...membersInGroup, ...clientsInGroup]; openModal('newDiscussion', { preselectedParticipants: participants, groupName: group.name }); break;
            default: console.warn(t("unknown_group_action", "Action de groupe inconnue:"), action);
        }
    }, [openModal, localData.staffMembers, localData.clients, t]);
    const handleOpenAlertDetails = useCallback((alertItem) => {
        let title = '';
        let content = '';
        if (alertItem.type === 'deadline') {
            title = t('deadline_details_title', `Détails de l'échéance : ${alertItem.name || alertItem.title || ''}`);
            const deadlineDate = parseISO(alertItem.deadline);
            content = `${t('project_task', 'Tâche/Projet')} : ${alertItem?.name || alertItem?.title || ''} ${t('client', 'Client')} : ${alertItem?.client || t('not_specified', 'Non spécifié')} ${t('date', 'Date')} : ${isValid(deadlineDate) ? format(deadlineDate, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A'} ${t('description', 'Description')} : ${alertItem?.description || t('no_description', 'Pas de description.')}`;
        } else if (alertItem.type === 'meeting') {
            title = t('meeting_details_title', `Détails de la réunion : ${alertItem.title || ''}`);
            const meetingDateTime = parseISO(alertItem.dateTime);
            content = `${t('subject', 'Sujet')} : ${alertItem?.title || ''} ${t('date', 'Date')} : ${isValid(meetingDateTime) ? format(meetingDateTime, 'dd/MM/yyyy HH:mm', { locale: fr }) : 'N/A'} ${t('location', 'Lieu')} : ${alertItem?.location || t('not_specified', 'Non spécifié')} ${t('description', 'Description')} : ${alertItem?.description || t('no_description', 'Pas de description.')}`;
        }
        openModal('detailsModal', { title, content: content.trim() });
    }, [openModal, t]);
    const handleSelectUserOnMobile = useCallback((conv) => {
        const otherParticipant = conv.participantsDetails?.find(p => p.uid !== authUser?.uid);
        if (otherParticipant) { openModal('quickChat', otherParticipant); }
    }, [openModal, authUser?.uid]);
    const renderFullScreenComponent = () => {
        if (!fullScreenModal.component) return null;
        switch (fullScreenModal.component) {
            case 'FlowLiveMessages': return (<FlowLiveMessages ref={flowLiveMessagesRef} t={t} currentLanguage={lang} onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} onOpenAddTaskFromChat={handleOpenAddTaskFromChat} onAddMeeting={() => openModal('addMeeting')} onAddDeadline={() => openModal('addDeadline')} messages={data.messages || []} user={authUser} initialMockData={initialMockData} availableTeamMembers={data.staffMembers || []} handleSelectUserOnMobile={handleSelectUserOnMobile} findUserByIdOrEmail={findUserByIdOrEmail} />);
            case 'TodoList': return <TodoList todos={visibleTodos} setTodos={setTodos} loading={loadingTodos} onAdd={addTodo} onToggle={toggleTodo} onEdit={(task) => openModal('taskEdit', task)} onDelete={deleteTodo} onAssignTeam={(task) => openModal('assignTeam', task)} t={t} />;
            case 'Notepad': return <Notepad uid={userUid} isGuest={isGuestMode} onGuestUpdate={onUpdateGuestData} t={t} />;
            case 'Calendar': return <Calendar tasks={data.tasks || []} meetings={data.meetings || []} projects={data.projects || []} onDayClick={(date, events) => openModal('dayDetails', { date, events })} t={t} />;
            case 'GanttChartPlanning': return <GanttChartPlanning ref={ganttChartPlanningRef} initialTasks={data.ganttTasks || []} t={t} staffMembers={data.staffMembers || []} clients={data.clients || []} onSaveTask={handleSaveGanttTask} />;
            case 'Projects': return <Projects projects={data.projects || []} clients={data.clients || []} staffMembers={data.staffMembers || []} onAddProject={() => openModal('projectForm', { allClients: data.clients, allStaffMembers: data.staffMembers })} onAction={handleProjectAction} t={t} />;
            case 'TeamManagement': return <TeamManagement members={data.staffMembers || []} openModal={openModal} t={t} className="h-full" />;
            case 'ClientManagement': return <ClientManagement clients={data.clients || []} onAddClient={() => openModal('clientForm', { mode: 'add' })} onEditClient={(client) => openModal('clientForm', { mode: 'edit', client })} onDeleteClient={deleteClient} onInvoiceForm={(client) => openInvoiceModal(client)} onClientInvoices={(client) => openModal('invoiceList')} t={t} className="h-full" />;
            case 'GroupManagement': return <GroupManagement groups={data.groups || []} allMembers={data.staffMembers || []} allClients={data.clients || []} onAddGroup={addGroup} onDeleteGroup={deleteGroup} onRenameGroup={renameGroup} onGroupAction={handleGroupAction} t={t} />;
            case 'InvoiceListModal': openModal('invoiceList'); closeFullScreenModal(); return null;
            case 'EmailCheckModal': openModal('emailCheck'); closeFullScreenModal(); return null;
            default: return <div>Composant "{fullScreenModal.component}" non trouvé.</div>;
        }
    };

    if (loadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>{t('loading', 'Chargement...')}</p>
            </div>
        );
    }

    return (
        <>
            <Head><title>{t('dashboard_title', 'Dashboard - NocaFLOW')}</title></Head>
            <div className={`w-full ${!isMobileView ? 'dashboard-page-content-padding min-h-screen' : ''}`}>
                <motion.div
                    className="max-w-screen-2xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                >
                    <div className={`${isMobileView ? 'p-4' : ''}`}>
                        {isClient && isGuestMode && !isMobileView && (
                            <div className="guest-banner-wrapper mb-4">
                                <GuestBanner onRegisterClick={onRegisterClick} onLoginClick={onLoginClick} t={t} />
                            </div>
                        )}
                        <DashboardHeader
                            user={authUser}
                            isGuestMode={isGuestMode}
                            openModal={openModal}
                            handleLogout={logout}
                            stats={stats}
                            t={t}
                            onOpenCalculator={handleOpenCalculatorModal}
                            isMobileView={isMobileView}
                            nextUpcomingMeeting={nextUpcomingMeeting}
                            nextUpcomingDeadline={nextUpcomingDeadline}
                        />
                    </div>
                    {!isMobileView ? (
                        <div className="grid grid-cols-12 gap-6 mt-6">
                            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                                <div id="messages-section"><DashboardCard t={t} title={t('live_messages_title', 'Flow Live Messages')} noContentPadding><FlowLiveMessages ref={flowLiveMessagesRef} t={t} currentLanguage={lang} messages={data.messages || []} user={authUser} initialMockData={initialMockData} availableTeamMembers={data.staffMembers || []} onOpenAddTaskFromChat={handleOpenAddTaskFromChat} /></DashboardCard></div>
                                <div id="notepad-section"><Notepad 
    uid={userUid} 
    isGuest={isGuestMode} 
    onGuestUpdate={onUpdateGuestData} 
    t={t}
    availableTeamMembers={data.staffMembers || []}
    clients={data.clients || []}
/></div>
                                <div id="calendar-section"><DashboardCard t={t} title={t('calendar_title', 'Calendrier')}><Calendar tasks={data.tasks || []} meetings={data.meetings || []} projects={data.projects || []} onDayClick={(date, events) => openModal('dayDetails', { date, events })} t={t} /></DashboardCard></div>
                                <div id="invoices-section"><InvoicesSummary invoices={data.invoices || []} openInvoiceForm={() => openInvoiceModal(null)} openInvoiceList={() => openModal('invoiceList')} t={t} /></div>
                            </div>
                            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                                <TimeAlerts projects={data.projects || []} meetings={data.meetings || []} t={t} lang={lang} openModal={openModal} onAlertCardClick={handleOpenAlertDetails} />
                                <TodoList todos={visibleTodos} setTodos={setTodos} loading={loadingTodos} onAdd={addTodo} onToggle={toggleTodo} onEdit={(task) => openModal('taskEdit', task)} onDelete={deleteTodo} onAssignTeam={(task) => openModal('assignTeam', task)} t={t} />
                                <div id="projects-section"><Projects projects={data.projects || []} clients={data.clients || []} staffMembers={data.staffMembers || []} onAddProject={() => openModal('projectForm', { allClients: data.clients, allStaffMembers: data.staffMembers })} onAction={handleProjectAction} t={t} /></div>
                            </div>
                            <div className="col-span-12" id="gantt-section"><DashboardCard t={t} title={t('gantt_title', 'Planning Gantt')}><GanttChartPlanning ref={ganttChartPlanningRef} initialTasks={data.ganttTasks || []} t={t} staffMembers={data.staffMembers || []} clients={data.clients || []} onSaveTask={handleSaveGanttTask} /></DashboardCard></div>
                            <div className="col-span-12" id="management-section">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div id="team-section">
    <TeamManagement
        members={unifiedMembers}
        onStartChat={handleStartChat}
        onDeleteMember={deleteStaffMember}
        openModal={openModal}
        t={t}
        className="h-[400px]"
    />
</div>                                        <div id="groups-section"><GroupManagement groups={data.groups || []} allMembers={data.staffMembers || []} allClients={data.clients || []} onAddGroup={addGroup} onDeleteGroup={deleteGroup} onRenameGroup={renameGroup} onGroupAction={handleGroupAction} t={t} /></div>
                                        <div id="clients-section"><ClientManagement clients={data.clients || []} onAddClient={() => openModal('clientForm', { mode: 'add' })} onEditClient={(client) => openModal('clientForm', { mode: 'edit', client })} onDeleteClient={deleteClient} onInvoiceForm={(client) => openInvoiceModal(client)} onClientInvoices={(client) => openModal('invoiceList')} t={t} className="h-[400px]" /></div>
                                    </div>
                                </DndContext>
                            </div>
                        </div>
                    ) : (
                        <MobileAppGrid t={t} openFullScreenModal={openFullScreenModal} />
                    )}
                </motion.div>
            </div>
            <AnimatePresence>
                {activeModal === 'taskEdit' && <TaskEditModal t={t} task={modalProps} onSave={editTodo} onClose={closeModal} />}
                {activeModal === 'dayDetails' && <DayDetailsModal t={t} data={modalProps} onAddTask={(date) => openModal('quickTask', { date })} onClose={closeModal} />}
                {activeModal === 'quickTask' && <QuickAddTaskModal t={t} date={modalProps} onSave={addTodo} onClose={closeModal} />}
                {activeModal === 'assignTeam' && modalProps && <AssignTeamModal t={t} task={modalProps} onSave={editTodo} onClose={closeModal} allStaffMembers={data.staffMembers || []} />}
                {activeModal === 'guestName' && isGuestMode && <GuestNameEditModal currentName={guestName} onSave={onUpdateGuestName} onClose={closeModal} t={t} />}
                {activeModal === 'userNameEdit' && !isGuestMode && <UserNameEditModal currentUser={authUser} onClose={closeModal} t={t} />}
{activeModal === 'avatar' && <AvatarEditModal user={authUser} onClose={closeModal} onUpdateGuestAvatar={(newAvatar) => onUpdateGuestData(prev => ({ ...prev, user: { ...prev.user, photoURL: newAvatar } }))} isGuestMode={isGuestMode} t={t} />}                {activeModal === 'meeting' && <MeetingSchedulerModal t={t} onSchedule={handleAddMeeting} isGuest={isGuestMode} onClose={closeModal} />}
                {activeModal === 'projectForm' && <ProjectFormModal t={t} onSave={modalProps?.initialData ? editProject : addProject} initialData={modalProps?.initialData} onDelete={deleteProject} isGuest={isGuestMode} onClose={closeModal} allClients={modalProps?.allClients} allStaffMembers={modalProps?.allStaffMembers} />}
                {activeModal === 'invoiceForm' && <InvoiceFormModal t={t} authUser={authUser} initialDraft={invoiceDraft} onUpdateDraft={setInvoiceDraft} onAdd={handleAddOrEditInvoice} onClose={closeModal} />}
{activeModal === 'invoiceList' && <InvoiceListModal t={t} invoices={data.invoices || []} onEdit={openInvoiceModal} onDelete={handleDeleteInvoice} onUpdateStatus={handleUpdateInvoiceStatus} onClose={closeModal} onAdd={() => openInvoiceModal(null)} />}                {activeModal === 'teamMember' && modalProps && (<TeamMemberModal t={t} mode={modalProps.mode} member={modalProps.member} onSave={modalProps.mode === 'add' ? addStaffMember : updateStaffMember} onDelete={deleteStaffMember} onClose={closeModal} />)}
                {activeModal === 'quickChat' && modalProps && <QuickChatModal t={t} member={modalProps} onClose={closeModal} />}
                {activeModal === 'assignTaskProjectDeadline' && modalProps && <AssignTaskProjectDeadlineModal t={t} member={modalProps.member} onClose={closeModal} allStaffMembers={data.staffMembers || []} userUid={userUid} currentUserName={authUser?.displayName || 'Moi'} onAddTask={addTodo} />}
                {activeModal === 'clientForm' && modalProps && <ClientFormModal t={t} {...modalProps} onSave={modalProps.mode === 'add' ? addClient : updateClient} onDelete={deleteClient} onClose={closeModal} />}
                {activeModal === 'ganttTaskForm' && modalProps && <GanttTaskFormModal t={t} initialData={modalProps} onSave={handleSaveGanttTask} onClose={closeModal} allStaffMembers={data.staffMembers || []} allClients={data.clients || []} />}
                {activeModal === 'googleDriveLink' && modalProps && <GoogleDriveLinkModal t={t} projectId={modalProps} onSave={updateProjectGoogleDriveLink} onClose={closeModal} />}
                {activeModal === 'addDeadline' && <AddDeadlineModal t={t} onSave={handleAddDeadline} onClose={closeModal} />}
                {activeModal === 'addMeeting' && <AddMeetingModal t={t} onSave={handleAddMeeting} onClose={closeModal} />}
                {activeModal === 'calculator' && <CalculatorModal t={t} onClose={closeModal} />}
                {activeModal === 'detailsModal' && modalProps && <DetailsModal isOpen={true} onClose={closeModal} title={modalProps.title || ""} content={modalProps.content || ""} />}
                {activeModal === 'newDiscussion' && modalProps && <NewDiscussionModal t={t} onClose={closeModal} preselectedParticipants={modalProps.preselectedParticipants} groupName={modalProps.groupName} />}
            </AnimatePresence>
            <FullScreenModal isOpen={fullScreenModal.isOpen} onClose={closeFullScreenModal} title={fullScreenModal.title}>
                {renderFullScreenComponent()}
            </FullScreenModal>
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