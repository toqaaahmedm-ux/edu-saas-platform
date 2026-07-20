"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { CreditCard, Receipt, Loader2 } from "lucide-react";

export default function SuperAdminBillingPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, invoicesRes] = await Promise.all([
          apiClient.get('/billing/subscriptions'),
          apiClient.get('/billing/invoices/all'),
        ]);
        setSubscriptions(subsRes.data?.data ?? subsRes.data ?? []);
        setInvoices(invoicesRes.data?.data ?? invoicesRes.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const subStatusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-900/50 text-emerald-300",
    CANCELLED: "bg-slate-700 text-slate-300",
    PAST_DUE: "bg-red-900/50 text-red-300",
  };

  const invoiceStatusStyles: Record<string, string> = {
    PAID: "bg-emerald-900/50 text-emerald-300",
    PENDING: "bg-amber-900/50 text-amber-300",
    FAILED: "bg-red-900/50 text-red-300",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Billing & Subscriptions</h2>
        <p className="text-slate-400 text-sm">Platform-wide subscriptions and invoice history</p>
      </div>

      {/* Subscriptions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <CreditCard size={18} className="text-purple-400" />
          <h3 className="font-black text-white">Active Subscriptions</h3>
          <span className="text-xs text-slate-500 ml-auto">{subscriptions.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-800">
                <th className="px-6 py-3 text-left">Tenant</th>
                <th className="px-6 py-3 text-left">Plan</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Renews</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No subscriptions yet.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s: any) => (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{s.tenant?.name}</p>
                      <p className="text-xs text-slate-500">{s.tenant?.subdomain}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-lg text-xs font-bold">
                        {s.plan?.name} — {s.plan?.price} {s.plan?.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${subStatusStyles[s.status] ?? 'bg-slate-700 text-slate-300'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(s.currentPeriodEnd).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <Receipt size={18} className="text-purple-400" />
          <h3 className="font-black text-white">Recent Invoices</h3>
          <span className="text-xs text-slate-500 ml-auto">Last {invoices.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-800">
                <th className="px-6 py-3 text-left">Tenant</th>
                <th className="px-6 py-3 text-left">Plan</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No invoices yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{inv.subscription?.tenant?.name}</p>
                      <p className="text-xs text-slate-500">{inv.subscription?.tenant?.subdomain}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{inv.subscription?.plan?.name}</td>
                    <td className="px-6 py-4 text-slate-300 font-bold">{inv.amount} {inv.currency}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${invoiceStatusStyles[inv.status] ?? 'bg-slate-700 text-slate-300'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}