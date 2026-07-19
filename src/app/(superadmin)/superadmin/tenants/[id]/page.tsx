"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { ArrowLeft, Building2, Users, BookOpen, HardDrive, Calendar } from "lucide-react";
import Link from "next/link";

// Sprint 2 — SuperAdmin task: Tenant Detail Page.
// Wired to existing GET /admin/tenants/:id and GET /admin/tenants/:id/usage
// endpoints — both were already built in admin.service.ts but had no UI.
export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params?.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    const fetchData = async () => {
      try {
        const [tenantRes, usageRes] = await Promise.all([
          apiClient.get(`/admin/tenants/${tenantId}`),
          apiClient.get(`/admin/tenants/${tenantId}/usage`),
        ]);
        setTenant(tenantRes.data?.data ?? tenantRes.data);
        setUsage(usageRes.data?.data ?? usageRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-slate-400">Tenant not found.</div>
    );
  }

  const usageBar = (label: string, current: number, limit: number | null, icon: React.ReactNode) => {
    const pct = limit ? Math.min(100, Math.round((current / limit) * 100)) : 0;
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-300">
          {icon}
          <span className="font-bold text-sm">{label}</span>
        </div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-black text-white">{current}</span>
          <span className="text-slate-500 text-sm">/ {limit ?? "∞"}</span>
        </div>
        {limit !== null && (
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Link
        href="/superadmin/tenants"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Tenants
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-purple-400" />
            <h2 className="text-2xl font-black text-white">{tenant.name}</h2>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-bold ${
                tenant.status === "ACTIVE"
                  ? "bg-emerald-900/50 text-emerald-300"
                  : tenant.status === "TRIAL"
                  ? "bg-amber-900/50 text-amber-300"
                  : "bg-red-900/50 text-red-300"
              }`}
            >
              {tenant.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">{tenant.subdomain}.edusaas.com</p>
        </div>
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {usageBar("Students", usage?.users?.current ?? 0, usage?.users?.limit ?? null, <Users size={16} />)}
        {usageBar("Courses", usage?.courses?.current ?? 0, usage?.courses?.limit ?? null, <BookOpen size={16} />)}
        {usageBar("Storage (GB)", usage?.storageGb?.current ?? 0, usage?.storageGb?.limit ?? null, <HardDrive size={16} />)}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Users size={16} />
            <span className="font-bold text-sm">Enrollments</span>
          </div>
          <span className="text-2xl font-black text-white">{usage?.enrollments?.current ?? 0}</span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-black text-white mb-2">Tenant Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold mb-1">Plan</p>
            <p className="text-white font-bold">{tenant.plan?.name ?? "No Plan"}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold mb-1">Owner</p>
            <p className="text-white font-bold">{tenant.owner?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold mb-1">Custom Domain</p>
            <p className="text-white font-bold">{tenant.customDomain ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
              <Calendar size={12} /> Trial Ends
            </p>
            <p className="text-white font-bold">
              {tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}