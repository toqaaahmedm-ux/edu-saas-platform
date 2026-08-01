// [Report 1 - page 4]: role protection module (modular middleware)
export function withRole(pathname: string, userRole: string) {
  if (userRole === 'STUDENT' && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
    return '/student/dashboard';
  }
  if (userRole === 'TEACHER' && pathname.startsWith('/admin')) {
    return '/teacher';
  }
  return null;
}
