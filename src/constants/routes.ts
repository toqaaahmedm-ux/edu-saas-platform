import { LayoutDashboard, BookOpen, PenTool, Award, PlusCircle, Users, Settings } from 'lucide-react';

// [تقرير 1 - صفحة 5]: توحيد المسارات لكل الأدوار لضمان عدم وجود 404 (Fix NEW-05 & NEW-06)
// اعتمدنا المسارات الحقيقية الموجودة في فولدر الـ app

export const STUDENT_ROUTES = [
  { 
    label: 'Dashboard', 
    href: '/student/dashboard', // 
    icon: LayoutDashboard 
  },
  { 
    label: 'My Courses', 
    href: '/student/courses', 
    icon: BookOpen 
  },
  { 
    label: 'Quizzes', 
    href: '/student/quizzes', 
    icon: PenTool 
  },
];

export const TEACHER_ROUTES = [
  { 
    label: 'Dashboard', 
    href: '/teacher', // مسار المدرس المباشر (Fix NEW-06)
    icon: LayoutDashboard 
  },
  { 
    label: 'My Courses', 
    href: '/teacher/courses', 
    icon: BookOpen 
  },
  { 
    label: 'Add Course', 
    href: '/teacher/courses/new', 
    icon: PlusCircle 
  },
];

// [تقرير 1 - صفحة 6]: ضفنا مسارات الأدمن عشان الـ Sidebar ميبقاش فاضي (Fix BUG-14)
export const ADMIN_ROUTES = [
  { 
    label: 'Admin Panel', 
    href: '/admin', 
    icon: LayoutDashboard 
  },
  { 
    label: 'Manage Users', 
    href: '/admin/users', // لضمان وجود صفحة للمستخدمين مستقبلاً
    icon: Users 
  },
  { 
    label: 'System Settings', 
    href: '/admin/settings', 
    icon: Settings 
  },
];
