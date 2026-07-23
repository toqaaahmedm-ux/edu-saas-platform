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
  UserCheck,
  BarChart3,
  Receipt,
  TrendingUp,
} from 'lucide-react';

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
  {
    label: 'Pending Teachers',
    href: '/admin/pending-teachers',
    icon: UserCheck,
  },
  {
    label: 'Academic Structure',
    href: '/admin/academic',
    icon: GraduationCap,
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: TrendingUp,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

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
    label: 'Plans',
    href: '/superadmin/plans',
    icon: CreditCard,
  },
  {
    label: 'Billing',
    href: '/superadmin/billing',
    icon: Receipt,
  },
  {
    label: 'Analytics',
    href: '/superadmin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Audit Logs',
    href: '/superadmin/audit-logs',
    icon: ShieldCheck,
  },
];
