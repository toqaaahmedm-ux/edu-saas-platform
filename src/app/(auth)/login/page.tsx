"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth.schema";
import FormInput from "@/components/shared/FormInput";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {

      const response = await authApi.login(data);
      const user = response.data;
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
      });

      // نحط الـ role في cookie عشان الـ middleware يقدر يقراه
      document.cookie = `user-role=${user.role}; path=/`;

      toast.success(`Welcome back, ${user.name}!`);

      const routes: Record<string, string> = {
        ADMIN: "/admin",
        TEACHER: "/teacher",
        STUDENT: "/student/dashboard",
      };

      window.location.href = routes[user.role] || "/";

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4 text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <LockKeyhole className="text-blue-600" size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 font-medium">Please enter your details to login</p>
        </div>

        <FormInput
          label="Email Address"
          type="email"
          register={register("email")}
          error={errors.email?.message}
          placeholder="example@mail.com"
        />

        <FormInput
          label="Password"
          type="password"
          register={register("password")}
          error={errors.password?.message}
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Logging in...</span>
            </>
          ) : "Sign In"}
        </button>
      </form>
    </div>
  );
}