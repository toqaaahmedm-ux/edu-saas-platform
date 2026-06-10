import axios, { AxiosResponse, AxiosError } from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: BASEURL,
  withCredentials: true, // الـ httpOnly cookie بتتبعت تلقائياً مع كل request
  headers: {
    "Content-Type": "application/json",
  },
});

// SEC-04: حذف الـ interceptor اللي كان بيقرا من localStorage
// الـ NestJS guard بيقرا session-token من الـ httpOnly cookie تلقائياً
// مش محتاجين Authorization header خالص

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error),
);