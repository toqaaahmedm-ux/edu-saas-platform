"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, CheckCircle2, FileText, MessageCircle, Play } from "lucide-react";
import { COURSES } from "@/data/courses.data";
import { toast } from "sonner";

// الاستدلال الديناميكي المعتمد من التقرير
const ReactPlayer = dynamic(() => import("react-player").then(mod => mod.default), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-white font-bold animate-pulse rounded-[3rem]">
      Loading Medical Lecture...
    </div>
  )
});

export default function CourseContentPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const course = COURSES.find((c) => String(c.id) === String(id)) || COURSES[0];

  const handleComplete = () => {
    setCompleted(true);
    toast.success("Lesson marked as completed! Keep going 🚀");
  };

  if (!isClient) return null;
  if (!course) return <div className="p-10 text-center font-bold">Course not found.</div>;

  
  const PlayerComponent = ReactPlayer as any;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 text-left animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{course.title}</h1>
          <p className="text-slate-500 font-medium italic">
            Instructor: <span className="text-blue-600 font-black">{course.instructor}</span>
          </p>
        </div>
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg active:scale-95 z-50 relative cursor-pointer"
        >
          <ChevronLeft size={20} /> Back to Library
        </button>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Area: Player & Interactions */}
        <div className="lg:col-span-2 space-y-6">
          
          
          <div className="aspect-video bg-slate-950 rounded-[3rem] border-[12px] border-white shadow-2xl overflow-hidden relative group">
            <PlayerComponent
              url={course.videoUrl || "https://youtube.com"}
              controls={true}
              width="100%"
              height="100%"
              playing={false}
              config={{
                youtube: {
                  playerVars: { origin: typeof window !== 'undefined' ? window.location.origin : '' }
                }
              }}
            />
          </div>

          {/* 3. Interaction Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
            <div className="flex gap-8">
              <button className="flex items-center gap-2 font-black text-slate-400 hover:text-blue-600 transition-colors text-[10px] uppercase tracking-[0.2em]">
                <MessageCircle size={20} /> Discussion
              </button>
              <button className="flex items-center gap-2 font-black text-slate-400 hover:text-blue-600 transition-colors text-[10px] uppercase tracking-[0.2em]">
                <FileText size={20} /> Resources
              </button>
            </div>
            <button 
              onClick={handleComplete} 
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 ${
                completed ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white"
              }`}
            >
              <CheckCircle2 size={22} /> {completed ? "COMPLETED" : "MARK AS DONE"}
            </button>
          </div>
        </div>

        {/* 4. Curriculum Sidebar */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-lg h-fit sticky top-28">
          <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4 flex items-center justify-between">
            Curriculum <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">1/{course.lessonsCount}</span>
          </h3>
          <div className="space-y-4">
            <div className="w-full p-5 rounded-[1.5rem] border-2 border-blue-600 bg-blue-50/30 shadow-md flex justify-between items-center group cursor-pointer">
              <div className="flex flex-col text-left">
                <span className="font-black text-sm text-blue-800">01. {course.title}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter italic">Currently Playing</span>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Play size={16} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
