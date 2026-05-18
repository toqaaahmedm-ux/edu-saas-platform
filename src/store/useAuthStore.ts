import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

// Handle user login and sync with middleware cookies
      login: (userData) => {
        set({ user: userData, isAuthenticated: true });
        // [تقرير 1 - صفحة 3]: تم إزالة الكوكيز من الفرونت إند لمنع تزوير الصلاحيات (Fix Role Spoofing)
      },

      // Handle user logout and clear session cookies
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // [تقرير 1 - صفحة 3]: الكوكيز بتتمسح تلقائياً من السيرفر عند عمل الـ Logout الآمن
      },
    }),
    { name: "auth-storage" } // Persist state in LocalStorage
  )
);