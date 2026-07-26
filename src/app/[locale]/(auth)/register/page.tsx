"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth.schema";
import FormInput from "@/components/shared/FormInput";
import { Link, useRouter } from "@/i18n/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth.api";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const t = useTranslations("register");

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STUDENT" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      setIsSuccess(true);
      toast.success(t("accountCreated"));

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || t("registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-xl border border-gray-100"
      >
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-black text-blue-600">{t("joinUs")}</h2>
          <p className="text-gray-400 text-sm">
            {t("subtitle")}
          </p>
        </div>

        {isSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium animate-pulse">
            <CheckCircle2 size={18} />
            <span>{t("successRedirect")}</span>
          </div>
        )}

        <FormInput label={t("fullName")} register={register("name")} error={errors.name?.message} placeholder={t("fullNamePlaceholder")} />
        <FormInput label={t("email")} type="email" register={register("email")} error={errors.email?.message} placeholder={t("emailPlaceholder")} />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">{t("accountType")}</label>
          <select
            {...register("role")}
            className="p-3 border rounded-xl border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer text-gray-700 font-medium"
          >
            <option value="STUDENT">{t("student")}</option>
            <option value="TEACHER">{t("teacher")}</option>
          </select>
          {errors.role && <span className="text-xs text-red-500 font-medium">{errors.role.message}</span>}
        </div>

        <FormInput label={t("password")} type="password" register={register("password")} error={errors.password?.message} placeholder="••••••" />
        <FormInput label={t("confirmPassword")} type="password" register={register("confirmPassword")} error={errors.confirmPassword?.message} placeholder="••••••" />

        <p className="text-xs text-gray-500 text-center leading-relaxed">
          {t("agreement")}{" "}
          <Link href="/terms" className="text-blue-600 font-bold hover:underline">
            {t("termsOfService")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/privacy" className="text-blue-600 font-bold hover:underline">
            {t("privacyPolicy")}
          </Link>.
        </p>

        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-700 transform active:scale-95 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin" size={20} /><span>{t("creatingAccount")}</span></>
          ) : isSuccess ? t("redirecting") : t("createAccountNow")}
        </button>

        <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-50">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
            {t("loginHere")}
          </Link>
        </p>
      </form>
    </div>
  );
}
