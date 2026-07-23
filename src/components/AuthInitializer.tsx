"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    async function syncUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          useAuthStore.setState({ user: null, isAuthenticated: false });
          return;
        }
        const json = await res.json();
        // FIX: response can be double-wrapped ({ success, data: { success, data: user } })
        // because the backend's global TransformInterceptor already wraps
        // the payload, and this route wraps it again. Unwrap however deep it goes.
        let user = json?.data ?? json;
        if (user?.data) user = user.data;
        if (user?.id) {
          setUser(user);
        } else {
          useAuthStore.setState({ user: null, isAuthenticated: false });
        }
      } catch {
        // network error — leave current state, axios interceptor handles 401
      }
    }
    syncUser();
  }, [setUser]);

  return <>{children}</>;
}
