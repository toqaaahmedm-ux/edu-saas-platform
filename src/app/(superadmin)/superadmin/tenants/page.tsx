"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { Building2, Plus, Ban, CheckCircle2, Loader2 } from "lucide-react";

// Sprint 1 — SuperAdmin task 6: Tenants list page with suspend/reactivate
// and plan assignment, wired to the existing admin.controller.ts endpoints.
export default function TenantsListPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [tenantsRes, plansRes] = await Promise.all([
        apiClient.get("/admin/tenants"),
        apiClient.get("/admin/plans"),
      ]);
      setTenants(tenantsRes.data?.data?.tenants ?? []);
      setPlans(plansRes.data?.data ?? plansRes.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuspend = async (id: string) => {
    setActioningId(id);
    try {
      await apiClient.patch(`/admin/tenants/${id}/suspend`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  // NOTE: there's no "reactivate" endpoint in admin.controller.ts yet —
  // only /suspend. Using updateTenant (PATCH /admin/tenants/:id) with
  // status: ACTIVE as the closest existing equivalent.
  const handleReactivate = async (id: string) => {
    setActioningId(id);
    try {
      await apiClient.patch(`/admin/tenants/${id}`, { status: "ACTIVE" });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleAssignPlan = async (id: string, planId: string) => {
    if (!planId) return;
    setActioningId(id);
    try {
      await apiClient.patch(`/admin/tenants/${id}/plan`, { planId });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Tenants</h2>
          <p className="text-slate-400 text-sm">{tenants.length} total tenants</p>
        </div>
        <Link
          href="/superadmin/tenants/new"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Create Tenant
        </Link>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-800">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Subdomain</th>
                <th className="px-6 py-3 text-left">Plan</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Users</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t: any) => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-500" />
                      <span className="font-bold text-white">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{t.subdomain}</td>
                  <td className="px-6 py-4">
                    <select
                      aria-label={`Assign plan for ${t.name}`}
                      defaultValue=""
                      disabled={actioningId === t.id}
                      onChange={(e) => handleAssignPlan(t.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="" disabled>
                        {t.plan?.name ?? "No Plan"}
                      </option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        t.status === "ACTIVE"
                          ? "bg-emerald-900/50 text-emerald-300"
                          : t.status === "TRIAL"
                          ? "bg-amber-900/50 text-amber-300"
                          : "bg-red-900/50 text-red-300"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{t._count?.users ?? 0}</td>
                  <td className="px-6 py-4 text-right">
                    {actioningId === t.id ? (
                      <Loader2 size={16} className="animate-spin text-slate-400 inline-block" />
                    ) : t.status === "SUSPENDED" ? (
                      <button
                        onClick={() => handleReactivate(t.id)}
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors"
                      >
                        <CheckCircle2 size={14} />
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(t.id)}
                        className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
                      >
                        <Ban size={14} />
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}