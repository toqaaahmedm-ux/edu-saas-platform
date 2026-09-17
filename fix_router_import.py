#!/usr/bin/env python3
"""
Fixes the admin dashboard guard: swaps the plain next/navigation
useRouter import for the locale-aware wrapper from @/i18n/navigation,
so router.replace('/login') correctly becomes /en/login or /ar/login
instead of silently failing to navigate.
"""

import os
import shutil
import sys

ADMIN_PAGE_PATH = os.path.join("src", "app", "[locale]", "(dashboard)", "admin", "page.tsx")

OLD = 'import { useRouter } from "next/navigation";'
NEW = 'import { useRouter } from "@/i18n/navigation";'


def main():
    if not os.path.exists(ADMIN_PAGE_PATH):
        print(f"ABORT - file not found: {ADMIN_PAGE_PATH}")
        sys.exit(1)

    with open(ADMIN_PAGE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    if OLD not in content:
        print("ABORT - pattern not found, nothing changed.")
        print("Expected to find exactly:")
        print("  " + OLD)
        sys.exit(1)

    backup_path = ADMIN_PAGE_PATH + ".router-fix.bak"
    shutil.copy2(ADMIN_PAGE_PATH, backup_path)
    print(f"Backed up: {ADMIN_PAGE_PATH} -> {backup_path}")

    new_content = content.replace(OLD, NEW)

    with open(ADMIN_PAGE_PATH, "w", encoding="utf-8", newline="") as f:
        f.write(new_content)

    print(f"Patched: {ADMIN_PAGE_PATH}")
    print("\nDONE. Restart the dev server and hard-refresh /en/admin as a guest.")


if __name__ == "__main__":
    main()
