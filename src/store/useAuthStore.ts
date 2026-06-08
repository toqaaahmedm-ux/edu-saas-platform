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
  token: string | null;           // ← أضفنا
  isAuthenticated: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  setUser: (userData: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }
        set({ user: userData, token: token || null, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (userData) => {
        set({ user: userData, isAuthenticated: true });
      },
    }),
    { name: "auth-storage" }
  )
);