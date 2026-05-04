import { LayoutDashboard, BookOpen, PenTool, Award, PlusCircle, Users } from 'lucide-react';

export const STUDENT_ROUTES = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', href: '/student/courses', icon: BookOpen },
  { label: 'Quizzes', href: '/student/quizzes', icon: PenTool },
];

export const TEACHER_ROUTES = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', href: '/teacher/courses', icon: BookOpen },
  { label: 'Add Course', href: '/teacher/courses/new', icon: PlusCircle },
];
