"use client";

import { User, Lock, Bell, Camera, Save } from "lucide-react";
import { useState, useEffect } from "react";
import FormInput from "@/components/shared/FormInput";
import { useForm } from "react-hook-form";
// import the store
// import the toast

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  // get the current user's data
  
  // set default values based on the logged-in user (Dynamic Fix)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      // example, can be persisted later
    }
  });

  // update the form if the user's data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSave = (data: any) => {
    console.log("Updated Settings:", data);
    // simulate the save operation (success feedback)
    toast.success("Profile settings updated successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 p-6 text-left">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800">Account Settings</h2>
        <p className="text-slate-500 font-medium">Manage your profile and security preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 flex flex-col gap-3">
          {[
            { id: "profile", label: "Profile", icon: <User size={20} /> },
            { id: "security", label: "Security", icon: <Lock size={20} /> },
            { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-2"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm min-h-[500px]">
          <form onSubmit={handleSubmit(onSave)}>
            {activeTab === "profile" && (
              <div className="space-y-10 animate-in slide-in-from-left-6 duration-500">
                
                {/* Profile Picture Section */}
                <div className="flex items-center gap-6 border-b pb-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-3xl border-2 border-white shadow-md">
                      {user?.name?.charAt(0) || "👤"}
                    </div>
                    <button 
                      type="button" 
                      aria-label="Change profile picture"
                      className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Profile Picture</h4>
                    <p className="text-sm text-slate-400">PNG or JPG no larger than 5MB</p>
                  </div>
                </div>

                /* Form fields — now connected to the store */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput label="Full Name" register={register("name")} placeholder="Your Name" />
                  <FormInput label="Email Address" type="email" register={register("email")} placeholder="your@email.com" />
                  <div className="md:col-span-2">
                    <FormInput label="Bio" register={register("bio")} placeholder="Write something about yourself..." />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-12 pt-8 border-t flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
