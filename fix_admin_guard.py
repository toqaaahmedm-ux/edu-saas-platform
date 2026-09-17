#!/usr/bin/env python3
"""
Safely patches 3 files to add an auth guard to the admin dashboard:
  1. src/services/courses.service.ts  -> useAdminCourses gets an `enabled` param
  2. src/services/users.service.ts    -> useUsers gets an `enabled` param
  3. src/app/[locale]/(dashboard)/admin/page.tsx -> adds the guard itself

Safety:
  - Backs up every file to <name>.bak before touching anything.
  - Verifies ALL patterns in ALL files exist BEFORE changing anything.
  - If any single pattern is missing, ABORTS with a clear message and
    does not modify any file at all.
  - Writes with UTF-8, no BOM (matches project convention).
"""

import os
import shutil
import sys

COURSES_PATH = os.path.join("src", "services", "courses.service.ts")
USERS_PATH = os.path.join("src", "services", "users.service.ts")
ADMIN_PAGE_PATH = os.path.join("src", "app", "[locale]", "(dashboard)", "admin", "page.tsx")

# ---------------------------------------------------------------------------
# 1. courses.service.ts : useAdminCourses gains an `enabled` param
# ---------------------------------------------------------------------------
COURSES_OLD = """export const useAdminCourses = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...courseKeys.admin, page, limit],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/admin/all?page=${page}&limit=${limit}`);
      return ((res.data as any)?.data?.courses ?? []) as Course[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};"""

COURSES_NEW = """export const useAdminCourses = (page = 1, limit = 20, enabled = true) => {
  return useQuery({
    queryKey: [...courseKeys.admin, page, limit],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/admin/all?page=${page}&limit=${limit}`);
      return ((res.data as any)?.data?.courses ?? []) as Course[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled,
  });
};"""

# ---------------------------------------------------------------------------
# 2. users.service.ts : useUsers gains an `enabled` param
# ---------------------------------------------------------------------------
USERS_OLD = """export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      // Bug #6 FIX: backend route moved from /admin/users to /users/admin
      const response = await apiClient.get("/users/admin");
      const result = response.data?.data;
      return (Array.isArray(result) ? result : result?.users || []) as User[];
    },
    staleTime: 5 * 60 * 1000,
  });
};"""

USERS_NEW = """export const useUsers = (enabled = true) => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      // Bug #6 FIX: backend route moved from /admin/users to /users/admin
      const response = await apiClient.get("/users/admin");
      const result = response.data?.data;
      return (Array.isArray(result) ? result : result?.users || []) as User[];
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};"""

# ---------------------------------------------------------------------------
# 3. admin/page.tsx : imports + guard
# ---------------------------------------------------------------------------
PAGE_IMPORTS_OLD = """"use client";
import { ShieldCheck, Users, CreditCard, LayoutGrid, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useAdminCourses, useDeleteCourse } from "@/services/courses.service"; // \u2705 FE-C03
import { useUsers, useDeleteUser } from "@/services/users.service";
import { apiClient } from "@/lib/api/client";
import { useTranslations } from "next-intl";"""

PAGE_IMPORTS_NEW = """"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, CreditCard, LayoutGrid, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useAdminCourses, useDeleteCourse } from "@/services/courses.service"; // \u2705 FE-C03
import { useUsers, useDeleteUser } from "@/services/users.service";
import { apiClient } from "@/lib/api/client";
import { useTranslations } from "next-intl";"""

PAGE_BODY_OLD = """export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const t = useTranslations("adminDashboard");

  const { data: courses = [], isLoading: coursesLoading } = useAdminCourses(); // \u2705 FE-C03
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { mutate: deleteCourse } = useDeleteCourse();
  const { mutate: deleteUser } = useDeleteUser();

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/courses/admin/stats');
      return res.data?.data ?? res.data;
    },
  });"""

PAGE_BODY_NEW = """export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("adminDashboard");

  const isAdmin = !!user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && !isAdmin) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, isAdmin, router]);

  const { data: courses = [], isLoading: coursesLoading } = useAdminCourses(1, 20, isAdmin); // \u2705 FE-C03
  const { data: users = [], isLoading: usersLoading } = useUsers(isAdmin);
  const { mutate: deleteCourse } = useDeleteCourse();
  const { mutate: deleteUser } = useDeleteUser();

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/courses/admin/stats');
      return res.data?.data ?? res.data;
    },
    enabled: isAdmin,
  });

  if (!isAuthenticated || !isAdmin) {
    return null;
  }"""

PATCHES = [
    (COURSES_PATH, [(COURSES_OLD, COURSES_NEW)]),
    (USERS_PATH, [(USERS_OLD, USERS_NEW)]),
    (ADMIN_PAGE_PATH, [(PAGE_IMPORTS_OLD, PAGE_IMPORTS_NEW), (PAGE_BODY_OLD, PAGE_BODY_NEW)]),
]


def read_utf8(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_utf8_no_bom(path, content):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(content)


def main():
    print("Checking all files and patterns before changing anything...\n")

    missing = []
    contents = {}

    for path, patches in PATCHES:
        if not os.path.exists(path):
            missing.append(f"FILE NOT FOUND: {path}")
            continue
        content = read_utf8(path)
        contents[path] = content
        for i, (old, _new) in enumerate(patches):
            if old not in content:
                missing.append(f"Pattern #{i+1} not found in: {path}")

    if missing:
        print("ABORT - nothing was changed. Issues found:")
        for m in missing:
            print("  - " + m)
        print("\nSend Claude the exact current content of the file(s) listed above.")
        sys.exit(1)

    print("All patterns found in all files. Proceeding...\n")

    for path, patches in PATCHES:
        backup_path = path + ".bak"
        shutil.copy2(path, backup_path)
        print(f"Backed up: {path} -> {backup_path}")

    for path, patches in PATCHES:
        content = contents[path]
        for old, new in patches:
            content = content.replace(old, new)
        write_utf8_no_bom(path, content)
        print(f"Patched: {path}")

    print("\nDONE. All 3 files patched successfully.")
    print("Next: run `npm run dev` (or restart it), hard-refresh the admin page,")
    print("and check `git diff` for each file before committing.")


if __name__ == "__main__":
    main()
