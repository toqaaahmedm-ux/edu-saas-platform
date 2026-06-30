import axios, { AxiosResponse, AxiosError } from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ✅ FE-M01: استخراج tenantId ديناميكيًا من الـ subdomain في كل request
// بدل ما يتقرأ مرة واحدة وقت البناء
function getTenantIdFromSubdomain(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname; // e.g. "school1.platform.com"
  const parts = hostname.split(".");

  // لو subdomain موجود (مش localhost أو platform.com مباشرة)
  if (parts.length >= 3) {
    return parts[0]; // "school1"
  }

  // fallback للتطوير المحلي: قرا من env أو رجّع null
  return process.env.NEXT_PUBLIC_TENANT_ID || null;
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