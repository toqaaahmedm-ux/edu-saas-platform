"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Landing page on the tenant's own subdomain. The SuperAdmin dashboard
// (on localhost:3000) redirects here with the impersonation token as a
// URL param, since it can't set a cookie on this origin directly. This
// page's only job is to hand that token to our own API route (which CAN
// set a cookie here, same-origin) and then continue on to /admin.
export default function ImpersonateLandingPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No impersonation token provided.');
      return;
    }

    fetch('/api/auth/consume-impersonation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to establish session');
        // Critical: clear any stale Zustand auth state left over from
        // a previous session on this subdomain (e.g. someone testing
        // as a student earlier). Without this, useAuthStore's persisted
        // isAuthenticated:false overrides the fresh cookie we just got,
        // and middleware/pages bounce us back to /login.
        localStorage.removeItem('auth-storage');
        // Full reload so every store/provider re-initializes with the
        // new cookie in place, same as a normal login would.
        window.location.href = '/admin';
      })
      .catch(() => setError('Failed to log in as this admin.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      {error ? (
        <p className="text-red-500 font-bold">{error}</p>
      ) : (
        <p className="text-gray-500 font-bold">Logging you in...</p>
      )}
    </div>
  );
}