import axios, { AxiosResponse, AxiosError } from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

export const apiClient = axios.create({
  baseURL: BASEURL,
  withCredentials: true, // بيبعت الـ httpOnly cookie تلقائياً
  headers: {
    "Content-Type": "application/json",
    // MT-01: بعت الـ tenantId في كل request
    ...(TENANT_ID ? { "x-tenant-id": TENANT_ID } : {}),
  },
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // HIGH-14 FIX: قبل كده لو التوكن انتهى صلاحيته، الـ interceptor كان
    // بيرجع reject بس من غير أي إجراء — الواجهة كانت تفضل تعرض إن
    // المستخدم داخل لحساب بينما كل طلباته بتفشل بـ 401 صامت.
    // دلوقتي لو الباك إند رجّع 401، بنعمل logout تلقائي وبنوجه
    // المستخدم لصفحة الدخول عشان يجدد التوكن.
    //
    // استثناء: مسار /auth/me نفسه بيتنادى وقت الـ hydration عشان
    // نتحقق من وجود session — لو فشل بـ 401 ده طبيعي (مستخدم مش
    // مسجل) ومش لازم نعمل redirect منه.
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !error.config?.url?.includes("/auth/me") &&
      !error.config?.url?.includes("/auth/login")
    ) {
      // مسح الـ Zustand persist من localStorage (isAuthenticated hint)
      // عشان صفحة الـ login تبدأ نظيفة
      try {
        localStorage.removeItem("auth-storage");
      } catch {
        // localStorage ممكن تكون مش متاحة في بعض البيئات
      }

      // redirect لصفحة الدخول مع حفظ الـ URL الحالي عشان نرجعله بعد الـ login
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