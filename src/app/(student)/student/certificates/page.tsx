"use client"; 

import { useQuizStore } from "@/store/useQuizStore"; 
import { Certificate } from "@/components/student/Certificate"; 
import { Award, Download, Eye, FileCheck } from "lucide-react"; 
import { useState, useEffect } from "react"; 
import Link from "next/link"; 

export default function CertificatesPage() { 
  const { answers, calculateScore } = useQuizStore(); 
  const [isClient, setIsClient] = useState(false); 
  const [showPreview, setShowPreview] = useState(false); 

  useEffect(() => setIsClient(true), []); 

  // Simulate certificate data based on quiz success 
  const score = isClient ? calculateScore([{ id: "q1", correct: 1 }, { id: "q2", correct: 2 }]) : 0; 
  const hasCertificate = score >= 50; 

  if (!isClient) return null; 

  return ( 
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left"> 
      {/* Informational Header */} 
      <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"> 
        <div> 
          <h2 className="text-3xl font-black text-slate-800 mb-2">Certified Certificates Center</h2> 
          <p className="text-slate-500 font-medium text-lg">Here you can find all the official documents you earned during your educational journey.</p> 
        </div> 
        <div className="p-4 bg-blue-50 rounded-2xl"> 
          <FileCheck className="text-blue-600 w-10 h-10" /> 
        </div> 
      </div> 

      {/* Certificates List */} 
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"> 
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/50"> 
          <h3 className="font-bold text-slate-700 text-lg">Earned Certificates</h3> 
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold"> 
            {hasCertificate ? "1 Certificate" : "No certificates available"} 
          </span> 
        </div> 

        <div className="p-0"> 
          {hasCertificate ? ( 
            <div className="divide-y divide-gray-50"> 
              <div className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50 transition-all gap-4"> 
                <div className="flex items-center gap-4"> 
                  <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-100"> 
                    <Award size={28} /> 
                  </div> 
                  <div> 
                    <h4 className="font-black text-slate-800 text-lg">Completion Certificate: General Medical Anatomy</h4> 
                    <p className="text-sm text-slate-400 font-medium">Issued on: {new Date().toLocaleDateString('en-US')}</p> 
                  </div> 
                </div> 
                <div className="flex gap-3 w-full md:w-auto"> 
                  <button 
                    aria-label="Preview certificate"
                    onClick={() => setShowPreview(!showPreview)} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all" 
                  > 
                    <Eye size={18} /> Preview 
                  </button> 
                  <button 
                    aria-label="Download certificate as PDF"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  > 
                    <Download size={18} /> Download PDF 
                  </button> 
                </div> 
              </div> 

              {/* Live Preview Section */} 
              {showPreview && ( 
                <div className="p-10 bg-slate-100/50 flex justify-center animate-in zoom-in duration-300"> 
                  <div className="scale-[0.4] md:scale-[0.7] lg:scale-[0.8] origin-top"> 
                    <Certificate name="Tuqa Mohamed" score={score} /> 
                  </div> 
                </div> 
              )} 
            </div> 
          ) : ( 
            <div className="p-20 text-center flex flex-col items-center gap-4"> 
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200"> 
                <Award size={40} /> 
              </div> 
              <p className="text-slate-400 font-bold text-lg">You haven't passed any exams with (50%+) yet.</p> 
              <Link href="/student/quizzes" className="text-blue-600 font-black hover:underline italic">Start your first quiz now!</Link> 
            </div> 
          )} 
        </div> 
      </div> 
    </div> 
  ); 
}
