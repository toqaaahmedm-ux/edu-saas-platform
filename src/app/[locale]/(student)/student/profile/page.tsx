"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api/client";
import { uploadApi } from "@/lib/api/upload.api";
import { User, Mail, Shield, Save, Loader2, Camera, Lock } from "lucide-react";
import { toast } from "sonner";

export default function StudentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => (state as any).setUser);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar((user as any).avatar || null);
    }
  }, [user]);

  const handleAvatarChange = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const url = await uploadApi.uploadDocument(file);
      setAvatar(url);
      toast.success("Photo uploaded — don't forget to save changes");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiClient.patch("/users/me", { name: name.trim(), avatar });
      const updated = (res.data as any)?.data ?? res.data;
      if (typeof setUser === "function" && updated) {
        setUser(updated);
      }
      toast.success("Profile updated ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Fill in both password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiClient.patch("/users/me/password", { oldPassword, newPassword });
      toast.success("Password changed ✅");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password — check your current password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 animate-in fade-in duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-800">My Profile</h1>
        <p className="text-slate-400 font-medium">Manage your personal information and account settings.</p>
      </div>

      {/* Profile info card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="text-blue-300" size={40} />
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-blue-700 transition">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarChange(file);
                }}
              />
            </label>
          </div>
          <div>
            <p className="font-black text-xl text-slate-800">{user.name}</p>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-1.5 mt-1">
              <Mail size={14} /> {user.email}
            </p>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <Shield size={12} /> {user.role}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-50">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none font-bold text-slate-700"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Password card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-2">
          <Lock size={18} className="text-slate-400" /> Change Password
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none font-bold text-slate-700"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none font-bold text-slate-700"
            />
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={isChangingPassword}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition shadow-lg disabled:opacity-60"
        >
          {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
          Update Password
        </button>
      </div>
    </div>
  );
}