"use client";

import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore"; // استيراد الـ Auth Store
import { Certificate } from "@/components/student/Certificate";
import { Award, Download, Eye, FileCheck } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner"; // للتنبيهات الاحترافية

export default function CertificatesPage() {
  const { calculateScore } = useQuizStore();
  const user = useAuthStore((state) => state.user); // جلب بيانات الطالب (حل BUG-07)
  const [isClient, setIsClient] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => setIsClient(true), []);

  // محاكاة لبيانات الإجابات الصحيحة (التقرير طلب ربطها بالـ Store لاحقاً)
  const score = isClient ? calculateScore([{ id: "q1", correct: 1 }, { id: "q2", correct: 2 }]) : 0;
  const hasCertificate = score >= 50;

  const handleDownload = () => {
    toast.info("Generating your high-quality PDF certificate...");
    // هنا ممكن نركب مكتبة html2canvas لاحقاً (حل BUG-08)
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-10">
      
      {/* Header - Styled for Premium Education Experience */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Certificate Center Center</h2>
          <p className="text-slate-500 font-medium text-lg italic">
            Congratulations {user?.name || "Student"}! Access your official graduation documents.
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl shadow-inner">
          <FileCheck className="text-blue-600 w-10 h-10" />
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-700 text-lg uppercase tracking-wider">Earned Credentials</h3>
          <span className="bg-emerald-500 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-tighter">
            {hasCertificate ? "Verified Document" : "Status: Pending"}
          </span>
        </div>

        <div className="p-0">
          {hasCertificate ? (
            <div className="divide-y divide-gray-50">
              <div className="p-8 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50/50 transition-all gap-6 group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                    <Award size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-xl">General Medical Anatomy</h4>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Issuer: <span className="text-blue-600">Ain Shams University Platform</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    <Eye size={20} /> Preview
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <Download size={20} /> PDF
                  </button>
                </div>
              </div>

              {/* Certificate Preview with Dynamic Name Rendering */}
              {showPreview && (
                <div className="p-12 bg-slate-900 flex justify-center animate-in zoom-in duration-500 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-white/20 font-black text-4xl select-none">OFFICIAL PREVIEW</div>
                  <div className="scale-[0.45] md:scale-[0.75] lg:scale-[1] origin-top shadow-2xl">
                    <Certificate name={user?.name || "Student Name"} score={score} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-24 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <Award size={48} />
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 font-black text-2xl">No Certificates Found</p>
                <p className="text-slate-400 font-medium">You need at least 50% score to unlock your certificate.</p>
              </div>
              <Link href="/student/quizzes" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all">
                Take a Quiz Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
