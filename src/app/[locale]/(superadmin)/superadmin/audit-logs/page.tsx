"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Shield, Clock, User } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiClient.get('/admin/audit-logs?limit=50');
        const data = res.data?.data ?? res.data;
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const actionColor: Record<string, string> = {
    TENANT_SUSPENDED: 'bg-red-900/50 text-red-300',
    PLAN_ASSIGNED:    'bg-purple-900/50 text-purple-300',
    LOGIN:            'bg-blue-900/50 text-blue-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-purple-400" />
        <div>
          <h2 className="text-2xl font-black text-white">Audit Logs</h2>
          <p className="text-slate-400 text-sm">{total} total events</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">No audit logs yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400 uppercase border-b border-slate-800">
                <th className="px-6 py-3 text-left">Action</th>
                <th className="px-6 py-3 text-left">Actor</th>
                <th className="px-6 py-3 text-left">Target</th>
                <th className="px-6 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${actionColor[log.action] ?? 'bg-slate-800 text-slate-300'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-slate-300 text-sm">{log.actor?.name ?? 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm font-mono">
                    {log.target ? log.target.slice(0, 8) + '...' : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Clock size={14} />
                      {new Date(log.createdAt).toLocaleString('en', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}