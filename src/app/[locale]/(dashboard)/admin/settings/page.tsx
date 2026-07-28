"use client";
import { useState, useEffect } from "react";
import { Settings, Loader2, Save, Palette, Image as ImageIcon, Building2, Users, BookOpen, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { useTenantBranding, useUpdateBranding } from "@/services/tenant.service";
import { useMyUsage } from "@/services/usage.service";
import { useTranslations } from "next-intl";

function UsageBar({ label, current, limit, icon: Icon }: { label: string; current: number; limit: number | null; icon: any }) {
  const pct = limit ? Math.min(100, Math.round((current / limit) * 100)) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
          <Icon size={14} /> {label}
        </span>
        <span className="text-xs font-bold text-slate-600">
          {current} / {limit ?? "∞"}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${limit ? pct : 5}%` }} />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: branding, isLoading } = useTenantBranding();
  const { mutate: updateBranding, isPending: saving } = useUpdateBranding();
  const { data: usage, isLoading: usageLoading } = useMyUsage();
  const t = useTranslations("adminSettings");

  const [form, setForm] = useState({
    displayName: "",
    logoUrl: "",
    primaryColor: "#2563EB",
  });

  useEffect(() => {
    if (branding) {
      setForm({
        displayName: branding.displayName || "",
        logoUrl: branding.logoUrl || "",
        primaryColor: branding.primaryColor || "#2563EB",
      });
    }
  }, [branding]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(form, {
      onSuccess: () => toast.success(t("saveSuccess")),
      onError: () => toast.error(t("saveFailed")),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Settings className="text-blue-600" size={32} />
          {t("title")}
        </h2>
        <p className="text-slate-400 font-medium mt-1">{t("subtitle")}</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm max-w-2xl">
        <h3 className="text-lg font-black text-slate-800 mb-6">{t("planUsage")}</h3>
        {usageLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : usage ? (
          <div className="space-y-5">
            <UsageBar label={t("users")} current={usage.users?.current ?? 0} limit={usage.users?.limit ?? null} icon={Users} />
            <UsageBar label={t("courses")} current={usage.courses?.current ?? 0} limit={usage.courses?.limit ?? null} icon={BookOpen} />
            <UsageBar label={t("storage")} current={usage.storageGb?.current ?? 0} limit={usage.storageGb?.limit ?? null} icon={HardDrive} />
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">{t("usageUnavailable")}</p>
        )}
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm max-w-2xl">
        <h3 className="text-lg font-black text-slate-800 mb-6">{t("branding")}</h3>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Building2 size={14} /> {t("displayName")}
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder={t("displayNamePlaceholder")}
              className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <ImageIcon size={14} /> {t("logoUrl")}
            </label>
            <input
              type="text"
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.logoUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <span className="text-xs text-slate-400">{t("preview")}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Palette size={14} /> {t("primaryColor")}
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {t("saveChanges")}
          </button>
        </form>
      </div>
    </div>
  );
}
