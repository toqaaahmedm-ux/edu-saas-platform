"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, CheckCircle2, FileText, MessageCircle, Play } from "lucide-react";
import { COURSES } from "@/data/courses.data";

export default function CourseContentPage() {
  const params = useParams();
  const id = params?.id;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // البحث عن الكورس أو عرض أول كورس في القائمة كافتراضي (حل مشكلة Not Found)
  const course = COURSES.find((c) => String(c.id) === String(id)) || COURSES[0];

  if (!isClient) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 text-left animate-in fade-in duration-700">
      
      {/* 1. Headerنظيف جداً  زي ما طلبت ي هندسه  */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{course.title}</h1>
          <p className="text-slate-500 font-medium italic">
            Instructor: <span className="text-blue-600 font-bold">{course.instructor}</span>
          </p>
        </div>
        <Link href="/student/courses" className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all">
          <ChevronLeft size={20} /> Back to Library
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Video Player - فيديو التشريح */}
          <div className="aspect-video bg-black rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden relative">
            <video 
              src={course.videoUrl} 
              controls 
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* 3. Interaction Bar */}
          <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex gap-8">
              <button className="flex items-center gap-2 font-black text-slate-400 hover:text-blue-600 transition-colors text-xs uppercase tracking-widest">
                <MessageCircle size={20} /> Discussions
              </button>
              <button className="flex items-center gap-2 font-black text-slate-400 hover:text-blue-600 transition-colors text-xs uppercase tracking-widest">
                <FileText size={20} /> Resources
              </button>
            </div>
            <button className="flex items-center gap-2 bg-green-50 text-green-700 px-10 py-3 rounded-2xl font-black hover:bg-green-100 transition-all">
              <CheckCircle2 size={22} /> MARK COMPLETED
            </button>
          </div>
        </div>

        {/* 4. Curriculum Sidebar */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-lg h-fit">
          <h3 className="text-xl font-black text-blue-600 mb-8 border-b pb-4 uppercase tracking-tighter">Anatomy Lessons</h3>
          <div className="space-y-4">
            <div className="w-full p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/50 shadow-md flex justify-between items-center">
              <div className="flex flex-col text-left">
                <span className="font-black text-sm text-blue-800">01. Main Anatomical Study</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{course.lessonsCount} Units Available</span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Play size={14} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
