import { create } from "zustand";
import { persist } from "zustand/middleware";

// تعريف بيانات المستخدم (مطابق للي المهندس عايزه)
interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // دالة لحفظ بيانات المستخدم وقت اللوجن
  login: (userData: User) => void;
  // دالة لمسح البيانات وقت الخروج
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // نمسح الكوكي كمان عشان الميدل وير يحس بالخروج
        document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      },
    }),
    { name: "auth-storage" } // حفظ البيانات في LocalStorage
  )
);
