"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft, Building2, User, Mail, Calendar, Ban, PlayCircle,
  Loader2, Users, BookOpen, GraduationCap, LogIn,
} from "lucide-react";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [impersonating, setImpersonating] = useState(false);

  const fetchData = async () => {
    try {
      const [tenantRes, plansRes] = await Promise.all([
        apiClient.get(`/admin/tenants/${tenantId}`),
        apiClient.get('/admin/plans'),
      ]);
      const tenantData = tenantRes.data?.data ?? tenantRes.data;
      setTenant(tenantData);
      setSelectedPlanId(tenantData?.planId ?? "");
      setPlans(plansRes.data?.data ?? plansRes.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tenant");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleSuspendToggle = async () => {
    const isSuspended = tenant.status === 'SUSPENDED';
    setActioning(true);
    try {
      if (isSuspended) {
        await apiClient.patch(`/admin/tenants/${tenantId}`, { status: 'ACTIVE' });
      } else {
        await apiClient.patch(`/admin/tenants/${tenantId}/suspend`);
      }
      toast.success(`Tenant ${isSuspended ? 'reactivated' : 'suspended'} successfully`);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActioning(false);
    }
  };

  const handlePlanChange = async (planId: string) => {
    if (!planId || planId === tenant.planId) return;
    setActioning(true);
    try {
      await apiClient.patch(`/admin/tenants/${tenantId}/plan`, { planId });
      toast.success("Plan updated successfully");
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update plan");
      setSelectedPlanId(tenant.planId ?? "");
    } finally {
      setActioning(false);
    }
  };

  const handleImpersonate = async () => {
    if (!tenant.owner) return;
    setImpersonating(true);
    try {
      
    const res = await fetch(`/api/auth/impersonate/${tenant.owner.id}`, {
        method: 'POST',
      });
      const rawResult = await res.json();
      if (!res.ok) {
        throw new Error(rawResult.error || 'Impersonation failed');
      }

      // The backend's global TransformInterceptor wraps every response
      // in { success, data } — so the payload we actually care about is
      // one level deeper than it looks.
      const result = rawResult.data ?? rawResult;

      const target = `http://${tenant.subdomain}.localhost:3000/impersonate-landing?token=${encodeURIComponent(result.accessToken)}`;
      window.location.href = target;
    } catch (err: any) {
      toast.error(err.message || "Failed to impersonate");
      setImpersonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-slate-400">Tenant not found.</div>
    );
  }

  const isSuspended = tenant.status === 'SUSPENDED';
  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-900/50 text-emerald-300",
    TRIAL: "bg-blue-900/50 text-blue-300",
    SUSPENDED: "bg-red-900/50 text-red-300",
    CANCELLED: "bg-slate-700 text-slate-300",
  };

  const usageCards = [
    { label: "Users", value: tenant._count?.users ?? 0, limit: tenant.plan?.maxStudents, icon: <Users size={18} /> },
    { label: "Courses", value: tenant._count?.courses ?? 0, limit: tenant.plan?.maxCourses, icon: <BookOpen size={18} /> },
    { label: "Enrollments", value: tenant._count?.enrollments ?? 0, limit: null, icon: <GraduationCap size={18} /> },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link
          href="/superadmin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-2xl">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{tenant.name}</h2>
              <p className="text-slate-400 text-sm">{tenant.subdomain}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSuspendToggle}
            disabled={actioning}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
              isSuspended
                ? "bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900"
                : "bg-red-900/50 text-red-300 hover:bg-red-900"
            }`}
          >
            {actioning ? <Loader2 size={16} className="animate-spin" /> : isSuspended ? <PlayCircle size={16} /> : <Ban size={16} />}
            {isSuspended ? "Reactivate Tenant" : "Suspend Tenant"}
          </button>
        </div>
      </div>

      {/* Status + Plan */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase mb-2">Status</p>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${statusStyles[tenant.status] ?? 'bg-slate-700 text-slate-300'}`}>
            {tenant.status}
          </span>
          {tenant.trialEndsAt && (
            <p className="text-xs text-slate-500 mt-2">
              Trial ends: {new Date(tenant.trialEndsAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase mb-2">Plan</p>
          <select
            value={selectedPlanId}
            onChange={(e) => {
              setSelectedPlanId(e.target.value);
              handlePlanChange(e.target.value);
            }}
            disabled={actioning}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50"
          >
            <option value="">No plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.price} {p.currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Owner */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <User size={16} />
            Owner Account
          </div>
          {tenant.owner && (
            <button
              type="button"
              onClick={handleImpersonate}
              disabled={impersonating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/50 text-purple-300 hover:bg-purple-900 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
              {impersonating ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
              Log in as this admin
            </button>
          )}
        </div>
        {tenant.owner ? (
          <div className="space-y-2">
            <p className="text-white font-bold">{tenant.owner.name}</p>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Mail size={14} />
              {tenant.owner.email}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Calendar size={12} />
              Joined {new Date(tenant.owner.createdAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <p className="text-red-400 text-sm font-bold">
            ⚠ No owner account — this tenant cannot be logged into.
          </p>
        )}
      </div>

      {/* Usage */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h3 className="font-black text-white mb-4">Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usageCards.map((u) => (
            <div key={u.label} className="border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                {u.icon}
                {u.label}
              </div>
              <p className="text-2xl font-black text-white">
                {u.value}
                {u.limit != null && <span className="text-slate-500 text-base"> / {u.limit}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}