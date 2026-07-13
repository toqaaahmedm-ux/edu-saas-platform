import axios, { AxiosResponse, AxiosError } from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const DEV_TENANT_STORAGE_KEY = "dev-tenant-id";

// PROD-02 fix: an IPv4 host (or bare "localhost") is never a real
// subdomain — treating it as one was sending a stale/wrong x-tenant-id
// on every request, including SuperAdmin login attempts, which always
// need to go through with NO tenant header at all.
//
// Dev-only addition: on localhost there's no real subdomain to read, so
// the tenant must be picked explicitly. Visiting any URL with ?tenant=<id>
// stores that choice in sessionStorage (scoped to the browser tab) so it
// survives navigation to pages that don't have the query param. Without
// ?tenant= ever being set, this returns null — same as SuperAdmin needs.
// This never runs in production (subdomains are used there instead).
function getTenantIdFromSubdomain(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname; // e.g. "school1.platform.com"
  const isLocal = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === "localhost";

  if (isLocal) {
    if (process.env.NODE_ENV === "production") return null;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tenant");
    if (fromUrl) {
      sessionStorage.setItem(DEV_TENANT_STORAGE_KEY, fromUrl);
      return fromUrl;
    }

    return sessionStorage.getItem(DEV_TENANT_STORAGE_KEY);
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

// ✅ FE-M01: interceptor بيضيف x-tenant-id ديناميكيًا في كل request
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
        // localStorage ممكن تكون مش متاحة في بعض البيئات
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