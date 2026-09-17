#!/usr/bin/env python3
"""
Diagnostic only - makes NO changes.
Shows a line-by-line diff between what Claude expects the file to contain
and what is actually on disk, so we can see exactly where they differ.
"""

import difflib
import os

PATH = os.path.join("src", "components", "AuthInitializer.tsx")

EXPECTED = '''"use client";
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

with open(PATH, "rb") as f:
    raw = f.read()

has_bom = raw.startswith(b"\xef\xbb\xbf")
if has_bom:
    raw = raw[3:]

actual = raw.decode("utf-8").replace("\r\n", "\n")
expected = EXPECTED

print(f"BOM present: {has_bom}")
print(f"Actual length: {len(actual)}   Expected length: {len(expected)}")
print()
print("=== UNIFIED DIFF (expected vs actual) ===")
diff = difflib.unified_diff(
    expected.splitlines(keepends=True),
    actual.splitlines(keepends=True),
    fromfile="expected",
    tofile="actual",
)
diff_lines = list(diff)
if not diff_lines:
    print("(no diff found - files match exactly after normalization)")
else:
    for line in diff_lines:
        print(line, end="")
