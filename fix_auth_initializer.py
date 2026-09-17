#!/usr/bin/env python3
"""
Fixes AuthInitializer.tsx: replaces the raw relative fetch("/api/users/me")
with apiClient.get("/users/me").

Why: apiClient's baseURL points straight at the backend
(http://localhost:4000/api in dev, NEXT_PUBLIC_API_URL in prod) and its
request interceptor attaches the x-tenant-id header. The raw fetch used a
relative URL, which in local dev hits the Next.js dev server itself
(no route.ts exists there -> 404) and never sent x-tenant-id anyway.

Safety: backs up the file, verifies the exact pattern exists before
touching anything, writes UTF-8 with no BOM.
"""

import os
import shutil
import sys

PATH = os.path.join("src", "components", "AuthInitializer.tsx")

OLD = '''"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(() => {
    async function syncUser() {
      try {
        // FIX: "/api/auth/me" never reaches Next.js in production \u2014 nginx
        // proxies everything under /api/ straight to the NestJS backend
        // (localhost:4000), so this route always 404'd. The real backend
        // endpoint is /users/me. Hitting it directly from the browser also
        // lets TenantMiddleware resolve the tenant from the Host header,
        // same as any other browser request.
        const res = await fetch("/api/users/me", { credentials: "include" });
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
        // network error \u2014 leave current state, axios interceptor handles 401
      }
    }
    syncUser();
  }, [setUser]);
  return <>{children}</>;
}'''

NEW = '''"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api/client";
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(() => {
    async function syncUser() {
      try {
        // FIX: use apiClient instead of a raw relative fetch. A relative
        // fetch("/api/users/me") hits the Next.js server itself in local
        // dev (no route.ts there -> 404) and never sent x-tenant-id.
        // apiClient's baseURL points straight at the backend (dev and
        // prod) and its interceptor attaches x-tenant-id automatically.
        const res = await apiClient.get("/users/me");
        const json = res.data;
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
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
    }
    syncUser();
  }, [setUser]);
  return <>{children}</>;
}'''


def main():
    if not os.path.exists(PATH):
        print(f"ABORT - file not found: {PATH}")
        sys.exit(1)

    with open(PATH, "r", encoding="utf-8") as f:
        content = f.read()

    if OLD not in content:
        print("ABORT - exact pattern not found, nothing changed.")
        print("Send Claude the current full content of the file again.")
        sys.exit(1)

    backup_path = PATH + ".fetch-fix.bak"
    shutil.copy2(PATH, backup_path)
    print(f"Backed up: {PATH} -> {backup_path}")

    new_content = content.replace(OLD, NEW)

    with open(PATH, "w", encoding="utf-8", newline="") as f:
        f.write(new_content)

    print(f"Patched: {PATH}")
    print("\nDONE. Restart the dev server and hard-refresh any page as a logged-in user.")
    print("Check the backend log: GET /api/users/me should now hit the backend, not 404.")


if __name__ == "__main__":
    main()
