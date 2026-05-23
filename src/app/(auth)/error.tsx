"use client";

import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
      <p className="text-slate-500 text-sm">An error occurred while loading this page.</p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
      >
        Try again
      </button>
    </div>
  );
}
