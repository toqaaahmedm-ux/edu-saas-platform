"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { CreditCard, Plus, Archive, Pencil, X } from "lucide-react";

// Sprint 2 — SuperAdmin task: Plan & Feature editor.
// Wired to existing POST/PATCH /billing/plans endpoints in billing.controller.ts.
const FEATURE_KEYS = ["QUIZZES", "CERTIFICATES", "LIVE_LECTURES", "ANALYTICS", "CUSTOM_DOMAIN"];

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    price: 0,
    currency: "EGP",
    billingCycle: "MONTHLY",
    maxStudents: 50,
    maxCourses: 10,
    maxStorageGb: 5,
    maxLiveHours: 0,
    features: Object.fromEntries(FEATURE_KEYS.map((k) => [k, false])),
  };
  const [form, setForm] = useState<any>(emptyForm);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get("/billing/plans");
      setPlans(res.data?.data ?? res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (plan: any) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      price: Number(plan.price),
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      maxStudents: plan.maxStudents,
      maxCourses: plan.maxCourses,
      maxStorageGb: plan.maxStorageGb,
      maxLiveHours: plan.maxLiveHours,
      features: Object.fromEntries(
        FEATURE_KEYS.map((k) => [k, plan.features?.find((f: any) => f.featureKey === k)?.enabled ?? false]),
      ),
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        currency: form.currency,
        billingCycle: form.billingCycle,
        maxStudents: Number(form.maxStudents),
        maxCourses: Number(form.maxCourses),
        maxStorageGb: Number(form.maxStorageGb),
        maxLiveHours: Number(form.maxLiveHours),
        features: FEATURE_KEYS.map((key) => ({ featureKey: key, enabled: form.features[key] })),
      };

      if (editingId) {
        // updatePlan doesn't accept `features` in its Partial<> type on the
        // backend, so only the plan-level fields are sent on edit.
        const { features, ...planFields } = payload;
        await apiClient.patch(`/billing/plans/${editingId}`, planFields);
      } else {
        await apiClient.post("/billing/plans", payload);
      }

      setShowForm(false);
      await fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient.patch(`/billing/plans/${id}/archive`);
      await fetchPlans();
    } catch (err) {
      console.error(err);
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
          <h2 className="text-2xl font-black text-white mb-1">Plans & Billing</h2>
          <p className="text-slate-400 text-sm">{plans.length} active plans</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p: any) => (
          <div key={p.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-purple-400" />
                <h4 className="font-black text-white text-lg">{p.name}</h4>
              </div>
              <span className="text-purple-400 font-black">{p.price} {p.currency}/{p.billingCycle === "MONTHLY" ? "mo" : "yr"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
              <span>Students: {p.maxStudents}</span>
              <span>Courses: {p.maxCourses}</span>
              <span>Storage: {p.maxStorageGb}GB</span>
              <span>Live hrs: {p.maxLiveHours}</span>
            </div>
            <div className="space-y-1 mb-4">
              {p.features?.map((f: any) => (
                <div key={f.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${f.enabled ? "bg-emerald-400" : "bg-slate-600"}`} />
                  <span className={f.enabled ? "text-slate-300" : "text-slate-500"}>{f.featureKey}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => openEdit(p)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs font-bold transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => handleArchive(p.id)}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
              >
                <Archive size={14} />
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white text-lg">{editingId ? "Edit Plan" : "Create Plan"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-2">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Price</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Billing Cycle</label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Max Students</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxStudents}
                    onChange={(e) => setForm({ ...form, maxStudents: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Max Courses</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxCourses}
                    onChange={(e) => setForm({ ...form, maxCourses: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Max Storage (GB)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxStorageGb}
                    onChange={(e) => setForm({ ...form, maxStorageGb: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Max Live Hours</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxLiveHours}
                    onChange={(e) => setForm({ ...form, maxLiveHours: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2">Features</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FEATURE_KEYS.map((key) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={form.features[key]}
                          onChange={(e) =>
                            setForm({ ...form, features: { ...form.features, [key]: e.target.checked } })
                          }
                          className="accent-purple-500"
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Features can only be set at creation time.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black py-2.5 rounded-xl transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Plan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}