import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'; // ✅ M-05
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  setUser: (userData: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => {
        set({ user: userData, isAuthenticated: true });
      },
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        set({ user: null, isAuthenticated: false });
        window.location.href = '/login';
      },
      setUser: (userData) => {
        set({ user: userData, isAuthenticated: true });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);