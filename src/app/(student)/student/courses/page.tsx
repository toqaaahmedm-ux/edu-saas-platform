"use client";
import { useState, useEffect } from "react";
import { coursesApi } from "@/lib/api/courses.api";
import { EmptyState } from "@/components/shared/EmptyState";
import { BookOpen, Loader2, Search, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchCourses = async () => {
      try {
        const res = await coursesApi.getAll();
        setCourses(res.data);
      } catch (error) {
        console.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (!isClient) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Available Courses</h2>
          <p className="text-slate-500 font-medium italic">Expand your knowledge with our premium content.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 focus:border-blue-600 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Logic: Loading -> Empty -> Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-400 font-bold animate-pulse">Loading amazing courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <EmptyState 
          title="No Courses Found"
          description="It looks like there are no courses available at the moment. Please check back later."
          icon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              {/* Course Thumbnail */}
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                 <img 
                   src={course.thumbnail || "https://placehold.co"} 
                   alt={course.title}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                 />
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
                   {course.category}
                 </div>
              </div>

              {/* Course Info */}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium">
                  {course.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold">
                      <GraduationCap size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter italic">
                      {course.instructor}
                    </span>
                  </div>
                  <Link 
                    href={`/student/courses/${course.id}`}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Start Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
