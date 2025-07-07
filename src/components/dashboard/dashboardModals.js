// src/components/dashboard/dashboardModals.js
// Ce fichier sert de point d'exportation centralisé pour toutes les modales du tableau de bord.
// Il ne doit PAS contenir les définitions complètes des composants modales,
// mais seulement les importer et les ré-exporter depuis leurs fichiers dédiés.

// Importations des modales individuelles depuis le dossier 'modals'
// Assurez-vous que chaque modale listée ici a un fichier correspondant dans 'src/components/dashboard/modals/'
import { ModalWrapper } from './modals/ModalWrapper';
import TaskEditModal from './modals/TaskEditModal';
import DayDetailsModal from './modals/DayDetailsModal';
import QuickAddTaskModal from './modals/QuickAddTaskModal';
import GuestNameEditModal from './modals/GuestNameEditModal';
import AvatarEditModal from './modals/AvatarEditModal';
import MeetingSchedulerModal from './modals/MeetingSchedulerModal';
import ProjectFormModal from './modals/ProjectFormModal';
import InvoiceFormModal from './modals/InvoiceFormModal';
import InvoiceListModal from './modals/InvoiceListModal';
import TeamMemberModal from './modals/TeamMemberModal';
import QuickChatModal from './modals/QuickChatModal';
import AssignTaskProjectDeadlineModal from './modals/AssignTaskProjectDeadlineModal';
import UserNameEditModal from './modals/UserNameEditModal';
import GanttTaskFormModal from './modals/GanttTaskFormModal';
import GoogleDriveLinkModal from './modals/GoogleDriveLinkModal';
import AddDeadlineModal from './modals/AddDeadlineModal';
import AddMeetingModal from './modals/AddMeetingModal';
// Ajout des nouvelles modales spécifiques au chat
import BlockContactModal from './modals/BlockContactModal';
import ConfirmDeleteMessageModal from './modals/ConfirmDeleteMessageModal';
// Import spécifique pour NewDiscussionModal, car il est dans un sous-dossier de FlowLiveMessages
import NewDiscussionModal from './FlowLiveMessages/modals/NewDiscussionModal'; // <-- Chemin corrigé
import ClientFormModal from './modals/ClientFormModal';

// Exportation de toutes les modales pour une importation centralisée
export {
    ModalWrapper,
    TaskEditModal,
    DayDetailsModal,
    QuickAddTaskModal,
    GuestNameEditModal,
    AvatarEditModal,
    MeetingSchedulerModal,
    ProjectFormModal,
    InvoiceFormModal,
    InvoiceListModal,
    TeamMemberModal,
    QuickChatModal,
    AssignTaskProjectDeadlineModal,
    UserNameEditModal,
    GanttTaskFormModal,
    GoogleDriveLinkModal,
    AddDeadlineModal,
    AddMeetingModal,
    BlockContactModal,
    ConfirmDeleteMessageModal,
    NewDiscussionModal,
    ClientFormModal
};