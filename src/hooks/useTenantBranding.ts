"use client";

import { useEffect, useState } from "react";

interface TenantBranding {
  displayName: string;
  logoUrl: string | null;
  primaryColor: string;
}

const DEFAULT_BRANDING: TenantBranding = {
  displayName: "EduSaaS.",
  logoUrl: null,
  primaryColor: "#2563EB", // Tailwind's blue-600 — matches the current hardcoded look
};

// Reads the current subdomain off the browser's own hostname and fetches
// that tenant's branding once per page load. Falls back to the default
// EduSaaS look if anything goes wrong (unknown subdomain, network error,
// or we're on a bare domain with no subdomain at all — e.g. the
// SuperAdmin panel, which has no single tenant to brand itself after).
export function useTenantBranding() {
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    const subdomain = parts.length >= 2 && parts[0] !== "localhost" ? parts[0] : null;

    if (!subdomain) {
      setIsLoading(false);
      return;
    }
// FIX: /api/tenants/branding?subdomain=... 404'd in production —
    // nginx routes everything under /api/ straight to the NestJS backend,
    // bypassing the Next.js proxy route that used to reshape this URL.
    // The real backend route takes the subdomain as a path param, not a
    // query string: /tenants/:subdomain/branding.
    fetch(`/api/tenants/${encodeURIComponent(subdomain)}/branding`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        // The Next.js proxy route just forwards whatever the backend
        // sends, and the backend wraps every response in { success, data }
        // — same shape we had to account for in the registration flow.
        const data = json?.data ?? json;
        if (data) {
          setBranding({
            displayName: data.displayName ?? DEFAULT_BRANDING.displayName,
            logoUrl: data.logoUrl ?? null,
            primaryColor: data.primaryColor ?? DEFAULT_BRANDING.primaryColor,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { branding, isLoading };
}