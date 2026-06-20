import axios, { AxiosResponse, AxiosError } from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

export const apiClient = axios.create({
  baseURL: BASEURL,
  withCredentials: true, //  بيبعت الـ httpOnly cookie تلقائياً
  headers: {
    "Content-Type": "application/json",
    //  MT-01: بعت الـ tenantId في كل request
    ...(TENANT_ID ? { "x-tenant-id": TENANT_ID } : {}),
  },
});

//  مش محتاجين نقرأ الـ token من document.cookie
// الـ httpOnly cookie بتتبعت تلقائياً مع withCredentials: true
// الـ NestJS JwtStrategy بتقراها server-side من req.cookies
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error),
);