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
  setUser: (userData: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) => {
        // DATA-01 + SEC-04: حذف token من الـ store — الـ httpOnly cookie بتتهندل تلقائياً
        set({ user: userData, isAuthenticated: true });
      },

      logout: () => {
        // SEC-04: مفيش localStorage.removeItem — مفيش token محفوظ أصلاً
        set({ user: null, isAuthenticated: false });
      },

      setUser: (userData) => {
        set({ user: userData, isAuthenticated: true });
      },
    }),
    {
      name: "auth-storage",
      // DATA-01: نحفظ بس الـ user data مش token
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);