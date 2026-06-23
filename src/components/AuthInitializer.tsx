"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

// SEC-01 FIX: بيتأكد من بيانات المستخدم (بما فيها role) من السيرفر
// عند كل تحميل صفحة، بدل ما يثق في أي حاجة متخزنة في localStorage.
// لو السيرفر رفض (401 — مفيش session صحيحة)، بيسجل خروج المستخدم محلياً.
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    async function syncUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          // مفيش session صحيحة على السيرفر — امسحي أي بيانات محلية قديمة
          useAuthStore.setState({ user: null, isAuthenticated: false });
          return;
        }
        const json = await res.json();
        const user = json?.data || json;
        if (user?.id) {
          setUser(user);
        }
      } catch {
        // خطأ شبكة — سيبي القيمة الحالية، الـ Axios interceptor هيتعامل مع 401
      }
    }
    syncUser();
  }, [setUser]);

  return <>{children}</>;
}