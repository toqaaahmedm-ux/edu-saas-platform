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
        // Set cookie for middleware authentication (Expires in 24h)
        document.cookie = `user-role=${userData.role}; path=/; max-age=86400`;
      },

      // Handle user logout and clear session cookies
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear auth cookie by setting expiration to the past
        document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      },
    }),
    { name: "auth-storage" } // Persist state in LocalStorage
  )
);
