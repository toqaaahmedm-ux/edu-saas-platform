import axios, { AxiosResponse, AxiosError } from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const DEV_TENANT_STORAGE_KEY = "dev-tenant-id";

// PROD-02 fix: an IPv4 host (or bare "localhost") is never a real
// subdomain — treating it as one was sending a stale/wrong x-tenant-id
// on every request, including SuperAdmin login attempts, which always
// need to go through with NO tenant header at all.
//
// T-BUG FIX: this used to store/read a *subdomain slug* (e.g.
// "edusaas-academy") from ?tenant=<slug> in sessionStorage. But the
// backend's dev-only x-tenant-id header lookup — and the
// /api/auth/login Route Handler, which already sent
// NEXT_PUBLIC_TENANT_ID — both expect the tenant's actual UUID, not its
// subdomain. Sending a slug here made every request except login fail
// with "Tenant '<slug>' not found" once the backend correctly validated
// the header. NEXT_PUBLIC_TENANT_ID is now the single source of truth
// for "which tenant am I testing as locally", matching the login route.
// ?tenant=<uuid> in the URL can still override it for a given tab if you
// need to switch tenants (e.g. to test "Design School") — it just needs
// to be the tenant's real id now, not its subdomain.
// This entire branch never runs in production (real subdomains are used
// there instead).
function getTenantIdFromSubdomain(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname; // e.g. "school1.platform.com"
  // FIX: bare IP.nip.io (no tenant subdomain, e.g. "18.194.88.98.nip.io" —
  // the SuperAdmin domain) was falling through to the "parts[0] as
  // subdomain" branch below, sending X-Tenant-Id: "18" (the IP's first
  // octet) on every request. Treat it the same as a bare IP/localhost.
  const isLocal =
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
    /^(\d{1,3}\.){3}\d{1,3}\.nip\.io$/.test(hostname) ||
    hostname === "localhost";

  if (isLocal) {
    if (process.env.NODE_ENV === "production") return null;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tenant");
    if (fromUrl) {
      sessionStorage.setItem(DEV_TENANT_STORAGE_KEY, fromUrl);
      return fromUrl;
    }

    const stored = sessionStorage.getItem(DEV_TENANT_STORAGE_KEY);
    // T-BUG FIX: fall back to the real tenant UUID from env instead of
    // returning null when nothing is in sessionStorage yet.
    return stored || process.env.NEXT_PUBLIC_TENANT_ID || null;
  }

  const parts = hostname.split(".");
  if (parts.length >= 3) {
    return parts[0]; // "school1"
  }

  return null;
}

export const apiClient = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// FE-M01: interceptor adds x-tenant-id dynamically to every request
apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantIdFromSubdomain();
  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !error.config?.url?.includes("/auth/me") &&
      !error.config?.url?.includes("/auth/login")
    ) {
      try {
        localStorage.removeItem("auth-storage");
      } catch {
        // localStorage might not be available in some environments
      }

      const currentPath = window.location.pathname;
      const loginUrl =
        currentPath && currentPath !== "/login"
          ? `/login?redirect=${encodeURIComponent(currentPath)}`
          : "/login";

      window.location.href = loginUrl;
    }

    return Promise.reject(error);
  }
);