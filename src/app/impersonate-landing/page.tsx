"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Landing page on the tenant's own subdomain. The SuperAdmin dashboard
// (on localhost:3000) redirects here with the impersonation token as a
// URL param, since it can't set a cookie on this origin directly. This
// page's only job is to hand that token to our own API route (which CAN
// set a cookie here, same-origin) and then continue on to /admin.
function ImpersonateLandingInner() {
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
        localStorage.removeItem('auth-storage');
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

// FIX: useSearchParams() requires a Suspense boundary at build time
// (Next.js static export rule) — wrap the component that uses it.
export default function ImpersonateLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <p className="text-gray-500 font-bold">Loading...</p>
        </div>
      }
    >
      <ImpersonateLandingInner />
    </Suspense>
  );
}
