"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Users, Building2, BookOpen, TrendingUp, Shield, Activity } from "lucide-react";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tenantsRes, plansRes] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/admin/tenants'),
          apiClient.get('/admin/plans'),
        ]);
        setStats(statsRes.data?.data ?? statsRes.data);
        setTenants(tenantsRes.data?.data?.tenants ?? []);
        setPlans(plansRes.data?.data ?? plansRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400">Loading...</div>
    </div>
  );

  const statCards = [
    { label: "Total Tenants",     value: stats?.totalTenants,     icon: <Building2 size={20} />, color: "bg-purple-600" },
    { label: "Active Tenants",    value: stats?.activeTenants,    icon: <Activity size={20} />,  color: "bg-emerald-600" },
    { label: "Total Users",       value: stats?.totalUsers,       icon: <Users size={20} />,     color: "bg-blue-600" },
    { label: "Total Courses",     value: stats?.totalCourses,     icon: <BookOpen size={20} />,  color: "bg-amber-600" },
    { label: "Total Enrollments", value: stats?.totalEnrollments, icon: <TrendingUp size={20} />,color: "bg-rose-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Platform Overview</h2>
        <p className="text-slate-400 text-sm">Real-time platform metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-black text-white">{s.value ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tenants */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="font-black text-white">Tenants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-800">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Subdomain</th>
                <th className="px-6 py-3 text-left">Plan</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Users</th>
                <th className="px-6 py-3 text-left">Courses</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t: any) => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{t.name}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{t.subdomain}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-lg text-xs font-bold">
                      {t.plan?.name ?? 'No Plan'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      t.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-300' :
                      t.status === 'TRIAL'  ? 'bg-amber-900/50 text-amber-300' :
                      'bg-red-900/50 text-red-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{t._count?.users ?? 0}</td>
                  <td className="px-6 py-4 text-slate-300">{t._count?.courses ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="font-black text-white">Subscription Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {plans.map((p: any) => (
            <div key={p.id} className="border border-slate-700 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-black text-white text-lg">{p.name}</h4>
                <span className="text-purple-400 font-black">{p.price} {p.currency}</span>
              </div>
              <div className="space-y-1">
                {p.features?.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${f.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className={f.enabled ? 'text-slate-300' : 'text-slate-500'}>{f.featureKey}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}