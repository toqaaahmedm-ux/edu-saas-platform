"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useQuizStore } from "@/store/useQuizStore";

interface CertificateProps {
  name?: string;
  score?: number;
  // ✅ BUG-20/NEW-13: إضافة props بدل hardcoded strings
  examName?: string;
  institutionName?: string;
  facultyName?: string;
}

export const Certificate = ({
  name: propName,
  score: propScore,
  examName = "General Medical Anatomy",
  institutionName = "Ain Shams University",
  facultyName = "Faculty of Medicine - ASU",
}: CertificateProps) => {
  const user = useAuthStore((state) => state.user);
  const quiz = useQuizStore((state) => state.score);

  // ✅ CERT-REG-01: propName له الأولوية
  const name = propName || user?.name || "Student";
  const score = propScore !== undefined ? propScore : (quiz || 0);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getGrade = (s: number) => {
    if (s >= 90) return "with Distinction & Honors";
    if (s >= 80) return "with Very Good Standing";
    if (s >= 65) return "with Good Standing";
    return "with Satisfactory Standing";
  };

  return (
    <div
      id="certificate"
      className="w-[800px] h-[560px] p-5 bg-white border-[16px] border-blue-900 relative shadow-2xl mx-auto flex flex-col justify-between overflow-hidden shrink-0 text-left select-none"
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <h1 className="text-[100px] font-black -rotate-12 tracking-widest text-blue-900">EDUSAAS</h1>
      </div>

      <div className="border-[3px] border-yellow-600 h-full p-6 flex flex-col items-center text-center relative z-10">

        {/* Official Header */}
        <div className="flex justify-between w-full items-center mb-6 px-4">
          <div className="text-left leading-tight">
            {/* ✅ BUG-20: institutionName و facultyName من props */}
            <p className="text-[11px] font-bold text-blue-900 uppercase">{institutionName}</p>
            <p className="text-[9px] text-gray-500 italic font-medium tracking-tight">{facultyName}</p>
          </div>

          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-yellow-600/30">
            ASU
          </div>

          <div className="text-right leading-tight">
            <p className="text-[11px] font-bold text-blue-900 uppercase">Medical SaaS</p>
            <p className="text-[9px] text-gray-400 italic font-medium">E-Learning Platform</p>
          </div>
        </div>

        <h1 className="text-4xl font-serif text-blue-900 mb-2 tracking-[0.2em] font-black border-b-2 border-blue-900/10 pb-1">
          CERTIFICATE
        </h1>

        <p className="text-sm italic text-gray-500 mb-4">
          The educational platform administration hereby certifies that
        </p>

        {/* ✅ Recipient Name */}
        <h2 className="text-4xl font-bold text-slate-800 border-b-2 border-yellow-600 px-12 pb-2 mb-4 min-w-[350px]">
          {name}
        </h2>

        {/* ✅ BUG-20: examName من props */}
        <p className="text-lg leading-relaxed text-slate-700 mb-6 max-w-[550px]">
          has successfully passed the <b>{examName}</b> examination<br />
          <span className="text-blue-700 font-bold italic">{getGrade(score)}</span>
          {" "}with a total score of{" "}
          <span className="text-3xl text-yellow-600 font-black">{score}%</span>
        </p>

        {/* Footer */}
        <div className="flex justify-between w-full mt-auto px-6 items-end pb-2">
          <div className="text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Date of Issue</p>
            <p className="text-xs font-bold text-slate-800 border-t border-slate-200 pt-2 w-36">
              {today}
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 border-2 border-blue-900/10 rounded-full flex items-center justify-center rotate-12 opacity-40">
              <div className="text-[8px] font-black text-blue-900 text-center uppercase leading-none">
                EduSaaS<br />Official Seal
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Authorized Signature</p>
            <p className="text-xs font-bold italic text-blue-900 border-t border-slate-200 pt-2 w-36 font-serif">
              EduSaaS Director
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
