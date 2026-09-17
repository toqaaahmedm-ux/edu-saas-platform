#!/usr/bin/env python3
"""
Fixes AuthInitializer.tsx: replaces the raw relative fetch("/api/users/me")
with apiClient.get("/users/me").

This version is tolerant of CRLF vs LF line endings (the previous attempt
failed because the file uses CRLF and the pattern was written with LF).
It normalizes to LF for comparison, then writes back using the file's
original line ending style.
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

    # Read raw bytes to detect BOM and line-ending style precisely.
    with open(PATH, "rb") as f:
        raw = f.read()

    has_bom = raw.startswith(b"\xef\xbb\xbf")
    if has_bom:
        raw = raw[3:]

    text = raw.decode("utf-8")
    uses_crlf = "\r\n" in text

    # Normalize to LF for a reliable comparison.
    normalized = text.replace("\r\n", "\n")

    if OLD not in normalized:
        print("ABORT - exact pattern not found even after normalizing line endings.")
        print("Nothing changed. Send Claude the file content again along with:")
        print("  (Get-Content -LiteralPath \"src\\components\\AuthInitializer.tsx\" -Raw -Encoding UTF8) -replace \"`r`n\",\"\\n\" | Out-File check.txt")
        sys.exit(1)

    backup_path = PATH + ".fetch-fix.bak"
    shutil.copy2(PATH, backup_path)
    print(f"Backed up: {PATH} -> {backup_path}")

    new_normalized = normalized.replace(OLD, NEW)

    # Restore original line-ending style before writing back.
    if uses_crlf:
        final_text = new_normalized.replace("\n", "\r\n")
    else:
        final_text = new_normalized

    final_bytes = final_text.encode("utf-8")
    if has_bom:
        final_bytes = b"\xef\xbb\xbf" + final_bytes

    with open(PATH, "wb") as f:
        f.write(final_bytes)

    print(f"Patched: {PATH}  (preserved {'CRLF' if uses_crlf else 'LF'} line endings, BOM={'yes' if has_bom else 'no'})")
    print("\nDONE. Restart the dev server and hard-refresh any page as a logged-in user.")
    print("Check the backend log: GET /api/users/me should now hit the backend, not 404.")


if __name__ == "__main__":
    main()
