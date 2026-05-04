"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth.schema";
import FormInput from "@/components/shared/FormInput";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
// 1. استدعاء الـ API والـ Store (بدون استدعاء USERS_DATA مباشرة)
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
      // 2. استخدام الـ API Layer (مطابق لخطة المهندس في الصورة)
      const response = await authApi.login(data);
      const user = response.data;

      // 3. تحديث الحالة في الـ Store
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
      });

      // 4. الكوكيز للميدل وير
      document.cookie = `user-role=${user.role}; path=/; max-age=86400`;

      toast.success(`Welcome back, ${user.name}!`);

      // التوجيه حسب الصلاحيات
      const routes = {
        ADMIN: "/admin/dashboard",
        TEACHER: "/teacher/courses",
        STUDENT: "/student/dashboard",
      };
      router.push(routes[user.role as keyof typeof routes]);

    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... الـ UI يظل كما هو (بدون تغيير) ...
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
         {/* باقي محتوى الفورم كما هو في الكود السابق */}
         <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <LockKeyhole className="text-blue-600" size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">Welcome Back</h2>
        </div>
        <FormInput label="Email" type="email" register={register("email")} error={errors.email?.message} placeholder="example@mail.com" />
        <FormInput label="Password" type="password" register={register("password")} error={errors.password?.message} placeholder="******" />
        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg disabled:opacity-70">
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Login to Account"}
        </button>
      </form>
    </div>
  );
}
