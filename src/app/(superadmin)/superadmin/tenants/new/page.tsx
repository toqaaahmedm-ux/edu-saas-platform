"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Building2, User, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// Sprint 1 — SuperAdmin task 5: Create Tenant Wizard.
// Wired to POST /admin/tenants, which (after the SA-C01 fix) now creates
// the Tenant AND its first ADMIN (owner) together in one transaction.
export default function CreateTenantPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    planId: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await apiClient.get("/admin/plans");
        setPlans(res.data?.data ?? res.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Auto-suggest a subdomain from the tenant name, but only until the user
  // edits the subdomain field manually.
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      subdomain: subdomainTouched
        ? prev.subdomain
        : name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiClient.post("/admin/tenants", {
        name: form.name,
        subdomain: form.subdomain,
        planId: form.planId || undefined,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPassword: form.ownerPassword,
      });
// TODO: redirect to /superadmin/tenants once that list page is built (Sprint 1, task 6)
      router.push("/superadmin");
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? "Failed to create tenant. Please try again.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href="/superadmin/tenants"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Tenants
        </Link>
        <h2 className="text-2xl font-black text-white mb-1">Create New Tenant</h2>
        <p className="text-slate-400 text-sm">
          This creates the tenant and its owner account together — the owner
          can log in immediately with the credentials below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6"
      >
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* ── Tenant info ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-2">
            <Building2 size={16} />
            Tenant Details
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-bold mb-1.5">
              Tenant Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleNameChange}
              placeholder="Cairo Tutoring Center"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-bold mb-1.5">
              Subdomain
            </label>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden focus-within:border-purple-500">
              <input
                type="text"
                required
                pattern="[a-z0-9-]+"
                value={form.subdomain}
                onChange={(e) => {
                  setSubdomainTouched(true);
                  handleChange("subdomain")(e);
                }}
                placeholder="cairo-tutoring"
                className="flex-1 bg-transparent px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none"
              />
              <span className="px-4 text-slate-500 text-sm">.edusaas.com</span>
            </div>
          </div>

          <div>
           <label htmlFor="plan-select" className="block text-xs text-slate-400 font-bold mb-1.5">
              Plan (optional)
            </label>
            <select
              id="plan-select"
              value={form.planId}
              onChange={handleChange("planId")}
              disabled={loadingPlans}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">No plan (Trial only)</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price} {p.currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-slate-800" />

        {/* ── Owner account ───────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-2">
            <User size={16} />
            Owner Account
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-bold mb-1.5">
              Owner Name
            </label>
            <input
              type="text"
              required
              value={form.ownerName}
              onChange={handleChange("ownerName")}
              placeholder="Ahmed Mostafa"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-bold mb-1.5">
              <Mail size={12} className="inline mr-1" />
              Owner Email
            </label>
            <input
              type="email"
              required
              value={form.ownerEmail}
              onChange={handleChange("ownerEmail")}
              placeholder="owner@cairo-tutoring.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-bold mb-1.5">
              <Lock size={12} className="inline mr-1" />
              Owner Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.ownerPassword}
              onChange={handleChange("ownerPassword")}
              placeholder="At least 8 characters"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating...
            </>
          ) : (
            "Create Tenant"
          )}
        </button>
      </form>
    </div>
  );
}