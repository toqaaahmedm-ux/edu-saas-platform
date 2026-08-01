"use client";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

// [Report 1 - page 4]: fixed TC-05 — handle errors professionally instead of letting the site crash
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // log the error to the console for debugging (Inspect)
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="p-6 bg-red-50 rounded-[2.5rem] text-red-600 shadow-sm border border-red-100">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800">Something went wrong!</h2>
        <p className="text-slate-500 font-medium max-w-md mt-2">
          We encountered a technical issue while loading this section. Don't worry, your data is safe.
        </p>
      </div>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95"
      >
        <RefreshCcw size={20} /> Try Again
      </button>
    </div>
  );
}
