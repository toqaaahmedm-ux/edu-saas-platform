import { PlayCircle, User, Bell, ClipboardList, BarChart2, CalendarCheck } from 'lucide-react';
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
    // enrolled courses only — not the public browse page
    labelKey: 'myCourses',
    href: '/student/my-courses',
    icon: PlayCircle,
  },
  {
    // all public courses the student can browse and enroll in
    labelKey: 'browse',
    href: '/student/courses',
    icon: BookOpen,
  },
  {
    labelKey: 'quizzes',
    href: '/student/quizzes',
    icon: PenTool,
  },
  {
    // new — assignments page (was missing from sidebar entirely)
    labelKey: 'assignments',
    href: '/student/assignments',
    icon: ClipboardList,
  },
  {
    // new — grades & grade breakdown page
    labelKey: 'grades',
    href: '/student/grades',
    icon: BarChart2,
  },
  {
    // was missing from sidebar even though the page already existed
    labelKey: 'certificates',
    href: '/student/certificates',
    icon: Award,
  },
  {
    // new — attendance record page
    labelKey: 'attendance',
    href: '/student/attendance',
    icon: CalendarCheck,
  },
  {
    // new — notifications page
    labelKey: 'notifications',
    href: '/student/notifications',
    icon: Bell,
  },
  {
    // new — student profile page
    labelKey: 'profile',
    href: '/student/profile',
    icon: User,
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