// [Report 1 - page 4]: fixed TC-06 — 404 page now reflects the platform's identity
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-blue-50 max-w-lg w-full animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <FileQuestion size={48} className="text-blue-600 animate-pulse" />
        </div>
        <h1 className="text-6xl font-black text-slate-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Oops! Page not found</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          The medical resource you are looking for might have been moved or doesn't exist.
        </p>
        <Link 
          href="/" 
          className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 mx-auto w-fit"
        >
          <Home size={20} /> Back to Safe Zone
        </Link>
      </div>
    </div>
  );
}
