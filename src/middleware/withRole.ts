// [تقرير 1 - صفحة 4]: موديول حماية الأدوار (Modular Middleware)
export function withRole(pathname: string, userRole: string) {
  if (userRole === 'STUDENT' && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
    return '/student/dashboard';
  }
  if (userRole === 'TEACHER' && pathname.startsWith('/admin')) {
    return '/teacher';
  }
  return null;
}
