// src/components/dashboard/modals/modals.js
// N'importez ici que les modales individuelles et les utilitaires partagés
// comme ModalWrapper si d'autres composants en ont besoin directement depuis ce fichier.

import { ModalWrapper } from './ModalWrapper'; // Si d'autres fichiers doivent l'importer de ici

// Importation des modales individuelles
import TaskEditModal from './TaskEditModal';
import DayDetailsModal from './DayDetailsModal';
import QuickAddTaskModal from './QuickAddTaskModal';
import GuestNameEditModal from './GuestNameEditModal';
import AvatarEditModal from './AvatarEditModal';
import MeetingSchedulerModal from './MeetingSchedulerModal';
import ProjectFormModal from './ProjectFormModal';
import InvoiceFormModal from './InvoiceFormModal';
import InvoiceListModal from './InvoiceListModal';
import TeamMemberModal from './TeamMemberModal';
import QuickChatModal from './QuickChatModal';
import AssignTaskProjectDeadlineModal from './AssignTaskProjectDeadlineModal';
import UserNameEditModal from './UserNameEditModal';
import ClientFormModal from './ClientFormModal';
import GanttTaskFormModal from './GanttTaskFormModal'; // Assurez-vous que ce chemin est correct
import GoogleDriveLinkModal from './GoogleDriveLinkModal';
import AddDeadlineModal from './AddDeadlineModal';
import AddMeetingModal from './AddMeetingModal';


// Exportation de toutes les modales
export {
    ModalWrapper, // Si d'autres composants l'importent via ce fichier
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
    ClientFormModal,
    GanttTaskFormModal,
    GoogleDriveLinkModal,
    AddDeadlineModal,
    AddMeetingModal
};