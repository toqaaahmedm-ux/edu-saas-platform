import { PlayCircle } from 'lucide-react';
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

// labelKey points into messages/{locale}.json under "sidebar" — the
// Sidebar component looks it up with useTranslations("sidebar") so the
// same route list works for every locale without duplicating arrays.
export const STUDENT_ROUTES = [
  {
    labelKey: 'dashboard',
    href: '/student/dashboard',
    icon: LayoutDashboard,
  },
  {
    labelKey: 'myCourses',
    href: '/student/courses',
    icon: BookOpen,
  },
  {
    labelKey: 'quizzes',
    href: '/student/quizzes',
    icon: PenTool,
  },
  {
    labelKey: 'enrolledCourses',
    href: '/student/my-courses',
    icon: PlayCircle,
  },
  {
    labelKey: 'certificates',
    href: '/student/certificates',
    icon: Award,
  },
];

export const TEACHER_ROUTES = [
  {
    labelKey: 'dashboard',
    href: '/teacher',
    icon: LayoutDashboard,
  },
  {
    labelKey: 'myCourses',
    href: '/teacher/courses',
    icon: BookOpen,
  },
  {
    labelKey: 'addCourse',
    href: '/teacher/courses/new',
    icon: PlusCircle,
  },
];

export const ADMIN_ROUTES = [
  {
    labelKey: 'adminPanel',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    labelKey: 'manageUsers',
    href: '/admin/users',
    icon: Users,
  },
  {
    labelKey: 'pendingTeachers',
    href: '/admin/pending-teachers',
    icon: UserCheck,
  },
  {
    labelKey: 'academicStructure',
    href: '/admin/academic',
    icon: GraduationCap,
  },
  {
    labelKey: 'reports',
    href: '/admin/reports',
    icon: TrendingUp,
  },
  {
    labelKey: 'analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    labelKey: 'systemSettings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export const SUPERADMIN_ROUTES = [
  {
    labelKey: 'dashboard',
    href: '/superadmin',
    icon: LayoutDashboard,
  },
  {
    labelKey: 'tenants',
    href: '/superadmin/tenants',
    icon: Building2,
  },
  {
    labelKey: 'plans',
    href: '/superadmin/plans',
    icon: CreditCard,
  },
  {
    labelKey: 'billing',
    href: '/superadmin/billing',
    icon: Receipt,
  },
  {
    labelKey: 'analytics',
    href: '/superadmin/analytics',
    icon: BarChart3,
  },
  {
    labelKey: 'auditLogs',
    href: '/superadmin/audit-logs',
    icon: ShieldCheck,
  },
];
