
"use client";
import { Save, User, Lock, Bell, Camera, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import FormInput from "@/components/shared/FormInput";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export default function TeacherSettingsPage() {
  const { register, handleSubmit, setValue } = useForm();
  const [activeTab, setActiveTab] = useState("profile");
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const userRole = useAuthStore((state) => state.user?.role);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pre-fill the form with current user data when the component loads
  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  useEffect(() => {
    if (isMounted) {
      if (!userRole || userRole !== "TEACHER") {
        router.replace("/");
      }
    }
  }, [isMounted, userRole, router]);

  if (!isMounted || !userRole || userRole !== "TEACHER") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-400 font-bold animate-pulse">Checking credentials... 🔐</p>
      </div>
    );
  }

  // T-03 FIX: wired up to PATCH /me — the save button was completely
  // disconnected before, no onClick, no handler, nothing happened on click
  const onSaveProfile = async (data: any) => {
    try {
      setIsSaving(true);
      const res = await apiClient.patch("/users/me", {
        name: data.name,
      });
      const updated = (res.data as any)?.data || res.data;
      // keep the auth store in sync so the name updates everywhere instantly
      if (user && updated) {
        setUser({ ...user, name: updated.name || data.name });
      }
      toast.success("Profile saved successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const onSavePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    try {
      setIsSaving(true);
      await apiClient.patch("/users/me/password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800">Teacher Settings</h2>
        <p className="text-slate-500 font-medium italic">Manage your professional profile and teaching preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-64 flex flex-col gap-2">
          {[
            { id: "profile", label: "Professional Profile", icon: <User size={18} /> },
            { id: "security", label: "Security & Password", icon: <Lock size={18} /> },
            { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm">
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit(onSaveProfile)}>
              <div className="space-y-10 animate-in slide-in-from-left-6 duration-500">
                <div className="flex items-center gap-6 border-b pb-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl border-2 border-white shadow-sm">
                      👨‍🏫
                    </div>
                    <button
                      type="button"
                      aria-label="Upload profile photo"
                      className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">Public Avatar</h4>
                    <p className="text-sm text-slate-400">This will be visible to your students.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput
                    label="Full Name"
                    register={register("name")}
                    placeholder={user?.name || "Dr. Mohamed Hafez"}
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    register={register("email")}
                    placeholder={user?.email || "hafez@university.com"}
                  />
                  <div className="md:col-span-2">
                    <FormInput
                      label="Biography / Specialization"
                      register={register("bio")}
                      placeholder="Describe your academic background..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="teaching-lang" className="text-sm font-bold text-slate-700 block mb-2">
                      Teaching Language
                    </label>
                    <select
                      id="teaching-lang"
                      aria-label="Select Teaching Language"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-600"
                    >
                      <option>Arabic (Primary)</option>
                      <option>English</option>
                      <option>Mixed (Medical Terminology)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  Save Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleSubmit(onSavePassword)}>
              <div className="space-y-6 animate-in slide-in-from-left-6 duration-500">
                <h3 className="text-xl font-black text-slate-800">Change Password</h3>
                <FormInput
                  label="Current Password"
                  type="password"
                  register={register("oldPassword")}
                  placeholder="Enter current password"
                />
                <FormInput
                  label="New Password"
                  type="password"
                  register={register("newPassword")}
                  placeholder="Min 8 characters"
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  register={register("confirmPassword")}
                  placeholder="Repeat new password"
                />
              </div>

              <div className="mt-12 pt-8 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  Update Password
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in slide-in-from-left-6 duration-500">
              <h3 className="text-xl font-black text-slate-800">Notification Preferences</h3>
              <p className="text-slate-400">Notification settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}