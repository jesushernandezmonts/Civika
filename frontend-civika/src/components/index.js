/**
 * Central Component Registry - Colegio Cívika
 * Agrupación semántica de componentes para importación limpia y modular.
 */

// ==========================================
// 🎨 UI PRIMITIVES & CONTROLS
// ==========================================
export { default as StatCard } from './StatCard';
export { default as SearchBar } from './SearchBar';
export { default as Pagination } from './Pagination';
export { default as StatusBadge } from './StatusBadge';
export { default as FilterDropdown } from './FilterDropdown';
export { default as CustomDatePicker } from './CustomDatePicker';
export { default as FileInput } from './FileInput';
export { default as Toast } from './Toast';
export { default as EmptyState } from './EmptyState';
export { SkeletonTable, SkeletonCardGrid } from './Skeleton';

// ==========================================
// 🪟 MODALS & OVERLAYS
// ==========================================
export { default as Modal } from './Modal';
export { default as ConfirmModal } from './ConfirmModal';
export { default as DocumentViewerModal } from './DocumentViewerModal';
export { default as InstallPwaModal } from './InstallPwaModal';
export { default as ModalJustificante } from './ModalJustificante';
export { default as ModalRecordatorioColegiatura } from './ModalRecordatorioColegiatura';

// ==========================================
// 📝 FORMS
// ==========================================
export { default as AlumnoForm } from './AlumnoForm';
export { default as InstructorForm } from './InstructorForm';
export { default as TallerForm } from './TallerForm';

// ==========================================
// 🧭 ONBOARDING & TOURS
// ==========================================
export { default as AdminTour } from './AdminTour';
export { default as TeacherTour } from './TeacherTour';
export { default as SecretariaTour } from './SecretariaTour';

// ==========================================
// 📐 LAYOUT & NAVIGATION
// ==========================================
export { default as Layout } from './Layout';
export { default as Sidebar } from './Sidebar';
export { default as PrivateRoute } from './PrivateRoute';
export { PageTransition } from './PageTransition';

// ==========================================
// 📊 FEATURES & DOMAIN COMPONENTS
// ==========================================
export { default as DashboardCharts } from './DashboardCharts';
export { default as AlumnoDetail } from './AlumnoDetail';
export { default as ExpedienteDigital } from './ExpedienteDigital';
