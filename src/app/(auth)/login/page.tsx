"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth.schema";
import FormInput from "@/components/shared/FormInput";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      // بنادي الـ api ونشوف الدنيا فيها إيه
      const response = await authApi.login(data);
      const user = response.data;

      // ببعت بيانات اليوزر للـ store عشان الليلة كلها تسمع مع بعضها 
      // وشيلت سطر الكوكيز اليدوي عشان ميعملش عك مع الميدل وير (Fix TC-09)
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
      });

      toast.success(`Welcome back, ${user.name}!`);

      // بوجه كل واحد لمكانه الصح حسب الفولدرات اللي عندي في الـ app
      // صلحنا الروابط هنا عشان نخلص من الـ 404 الرزلة (Fix NEW-05 & NEW-06)
      const routes: Record<string, string> = {
        ADMIN: "/admin",      // المسار الصح للـ Admin (مش dashboard)
        TEACHER: "/teacher",  // المسار الصح للمدرس
      STUDENT: "/student/dashboard", // 

      };

      const targetRoute = routes[user.role as keyof typeof routes] || "/";
      
      // بودي اليوزر صفحته وبخلي الصفحة تفرش نفسها عشان الروابط الجديدة تشتغل
      router.push(targetRoute);
      router.refresh(); 

    } catch (error: any) {
      // لو فيه حاجة غلط.. Toast سريع يظبط الدنيا بدل الـ alert
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
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

        <p className="text-center text-sm text-gray-500">
          Don't have an account? <span className="text-blue-600 font-bold cursor-pointer hover:underline">Contact Admin</span>
        </p>
      </form>
    </div>
  );
}
