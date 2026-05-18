
"use client";
import { Save, User, Lock, Bell, Globe, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import FormInput from "@/components/shared/FormInput";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function TeacherSettingsPage() {
  const { register, handleSubmit } = useForm();
  const [activeTab, setActiveTab] = useState("profile");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  // 🎯 نسحب الـ role والـ user بشكل منفصل ومباشر لكسر الـ Infinite Loop تماماً
  const userRole = useAuthStore((state) => state.user?.role);
  const user = useAuthStore((state) => state.user);

  // التأكد من استقرار الـ component على المتصفح
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🛡️ جارد الحماية يعتمد على متغيّر الـ String (userRole) وهو آمن ومستحيل يلف
  useEffect(() => {
    if (isMounted) {
      if (!userRole || userRole !== "TEACHER") {
        router.replace("/");
      }
    }
  }, [isMounted, userRole, router]);

  // شاشة الانتظار الآمنة
  if (!isMounted || !userRole || userRole !== "TEACHER") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-400 font-bold animate-pulse">Checking credentials... 🔐</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 text-left">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-800">Teacher Settings</h2>
        <p className="text-slate-500 font-medium italic">Manage your professional profile and teaching preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Settings Navigation */}
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

        {/* Settings Content Area */}
        <div className="flex-1 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm">
          {activeTab === "profile" && (
            <div className="space-y-10 animate-in slide-in-from-left-6 duration-500">
              {/* Profile Photo Section */}
              <div className="flex items-center gap-6 border-b pb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl border-2 border-white shadow-sm">
                    👨‍🏫
                  </div>
                  <button 
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

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput label="Full Name" register={register("name")} placeholder={user?.name || "Dr. Mohamed Hafez"} />
                <FormInput label="Email Address" type="email" register={register("email")} placeholder={user?.email || "hafez@university.com"} />
                
                <div className="md:col-span-2">
                  <FormInput label="Biography / Specialization" register={register("bio")} placeholder="Describe your academic background..." />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="teaching-lang" className="text-sm font-bold text-slate-700 block mb-2">Teaching Language</label>
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
          )}

          {/* Action Footer */}
          <div className="mt-12 pt-8 border-t flex justify-end">
            <button className="flex items-center gap-2 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95">
              <Save size={20} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}