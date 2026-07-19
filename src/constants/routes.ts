import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  Award,
  PlusCircle,
  Users,
  Settings,
  Building2,
  CreditCard,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

// Unified route lists per role so every Sidebar just picks the right array —
// prevents dead links / 404s from routes that don't match the actual app folder structure.

export const STUDENT_ROUTES = [
  {
    label: 'Dashboard',
    href: '/student/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Courses',
    href: '/student/courses',
    icon: BookOpen,
  },
  {
    label: 'Quizzes',
    href: '/student/quizzes',
    icon: PenTool,
  },
];

export const TEACHER_ROUTES = [
  {
    label: 'Dashboard',
    href: '/teacher',
    icon: LayoutDashboard,
  },
  {
    label: 'My Courses',
    href: '/teacher/courses',
    icon: BookOpen,
  },
  {
    label: 'Add Course',
    href: '/teacher/courses/new',
    icon: PlusCircle,
  },
];

export const ADMIN_ROUTES = [
  {
    label: 'Admin Panel',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Manage Users',
    href: '/admin/users',
    icon: Users,
  },
  // NEW: this page already existed and worked (we tested it earlier) but
  // had no link anywhere in the admin UI to reach it
  {
    label: 'Academic Structure',
    href: '/admin/academic',
    icon: GraduationCap,
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

// Sprint 1 fix: SuperAdmin sidebar was completely empty — no nav links
// existed at all, only a header with no navigation.
export const SUPERADMIN_ROUTES = [
  {
    label: 'Dashboard',
    href: '/superadmin',
    icon: LayoutDashboard,
  },
  {
    label: 'Tenants',
    href: '/superadmin/tenants',
    icon: Building2,
  },
  {
    label: 'Plans & Billing',
    href: '/superadmin/plans',
    icon: CreditCard,
  },
  {
    label: 'Audit Logs',
    href: '/superadmin/audit-logs',
    icon: ShieldCheck,
  },
];