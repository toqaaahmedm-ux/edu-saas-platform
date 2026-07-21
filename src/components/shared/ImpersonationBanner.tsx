"use client";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

// Reads the session-token cookie's payload client-side (base64, no
// verification needed here — this is just a display hint, the backend
// re-validates the signature on every real request) to check whether
// the current session was created via /auth/impersonate rather than a
// normal login. If so, show a persistent banner so nobody forgets
// they're acting as someone else.
function getImpersonationFlag(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(/session-token=([^;]+)/);
  // session-token is httpOnly, so this will actually never find it —
  // but we keep the check defensive in case cookie policy changes.
  // The real source of truth is decoded server-side via /auth/me below.
  return false;
}

export default function ImpersonationBanner() {
  const [impersonatedBy, setImpersonatedBy] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const user = data?.data ?? data;
        if (user?.impersonatedBy) {
          setImpersonatedBy(user.impersonatedBy);
        }
      })
      .catch(() => {});
  }, []);

  const handleExit = async () => {
    setExiting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = 'http://localhost:3000/superadmin';
    } catch {
      toast.error("Failed to exit impersonation");
      setExiting(false);
    }
  };

  if (!impersonatedBy) return null;

  return (
    <div className="sticky top-0 z-[100] bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 text-sm font-bold">
      <span>⚠ You are viewing this account as a SuperAdmin (impersonation mode)</span>
      <button
        type="button"
        onClick={handleExit}
        disabled={exiting}
        className="flex items-center gap-1 bg-amber-950 text-amber-50 px-3 py-1 rounded-lg hover:bg-amber-900 transition-colors disabled:opacity-50"
      >
        <LogOut size={14} />
        Exit
      </button>
    </div>
  );
}