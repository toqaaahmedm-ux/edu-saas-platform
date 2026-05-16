import { LayoutDashboard, BookOpen, PenTool, Award, PlusCircle, Users } from 'lucide-react';

// [تقرير 1 - صفحة 5]: صلحت مسارات المدرس والطالب (Fix NEW-06)
// شيلنا كلمة dashboard الزيادة عشان ميروحش لصفحة 404 لأن الفولدرات كانت عندي اسمها teacher و student بس

export const STUDENT_ROUTES = [
  { 
    label: 'Dashboard', 
    href: '/student/dashboard', // صلحت المسار هنا عشان يرمي على الصفحة الصح (app/student/page.tsx)
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
    href: '/teacher', // اdashboard عشان نخلص من خطأ NEW-06
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
