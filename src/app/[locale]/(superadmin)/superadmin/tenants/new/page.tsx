"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Building2, User, Mail, Lock, ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";
import Link from "next/link";

const STEPS = ["Tenant Details", "Owner Account", "Review & Submit"];

export default function CreateTenantPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
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

  const selectedPlan = plans.find((p) => p.id === form.planId);

  const canGoToStep2 = form.name.trim() !== "" && form.subdomain.trim() !== "";
  const canGoToStep3 =
    form.ownerName.trim() !== "" &&
    form.ownerEmail.trim() !== "" &&
    form.ownerPassword.length >= 8;

  const goNext = () => {
    setError(null);
    if (step === 0 && !canGoToStep2) {
      setError("Please fill in the tenant name and subdomain.");
      return;
    }
    if (step === 1 && !canGoToStep3) {
      setError("Please fill in all owner fields (password must be at least 8 characters).");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
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
      router.push("/superadmin/tenants");
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

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i < step
                    ? "bg-purple-600 text-white"
                    : i === step
                    ? "bg-purple-600 text-white ring-4 ring-purple-600/30"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`text-xs font-bold hidden sm:block ${
                  i <= step ? "text-white" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${i < step ? "bg-purple-600" : "bg-slate-800"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* STEP 1 — Tenant Details */}
        {step === 0 && (
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
        )}

        {/* STEP 2 — Owner Account */}
        {step === 1 && (
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
        )}

        {/* STEP 3 — Review & Submit */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-2">
              <Check size={16} />
              Review & Submit
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 font-bold uppercase">Tenant</p>
                <p className="text-white text-sm font-bold">{form.name}</p>
                <p className="text-slate-400 text-xs">{form.subdomain}.edusaas.com</p>
                <p className="text-slate-400 text-xs">
                  Plan: {selectedPlan ? `${selectedPlan.name} — ${selectedPlan.price} ${selectedPlan.currency}` : "No plan (Trial only)"}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 font-bold uppercase">Owner Account</p>
                <p className="text-white text-sm font-bold">{form.ownerName}</p>
                <p className="text-slate-400 text-xs">{form.ownerEmail}</p>
                <p className="text-slate-400 text-xs">Password: {"•".repeat(form.ownerPassword.length)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition-colors"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors"
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
          )}
        </div>
      </div>
    </div>
  );
}
