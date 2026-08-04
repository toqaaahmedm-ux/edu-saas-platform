// [Report 1 - page 5]: updated the homepage to a proper SaaS interface (Premium UI & Logic Fix - BIZ-05)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { GraduationCap, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

export default async function HomePage() {
  // [Fix]: need to await the cookies to read them correctly (Next.js standard)
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user-role')?.value;

  // [Fix]: if the user is already logged in, send them straight to where they belong (redirect logic)
  if (userRole) {
    const route = userRole === 'STUDENT' ? '/student/dashboard' : `/${userRole.toLowerCase()}`;
    redirect(route);
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex items-center justify-center overflow-hidden font-sans">
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full px-6 text-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Ain Shams University badge — official, clean, and neat */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100">
          <Globe size={12} className="text-blue-600" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em]">
            Ain Shams University • Official Platform
          </span>
        </div>

        {/* Main heading (typography excellence) */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Medical Learning.
            </span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            Empowering the next generation of physicians with world-class digital education and clinical insights.
          </p>
        </div>

        {/* Action buttons (SaaS style) */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-4">
          <Link 
            href="/login" 
            className="group flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/register" 
            className="px-8 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-95"
          >
            Join Now
          </Link>
        </div>

        {/* [Report 2]: added micro-interactions to make the platform feel more alive (Premium UX Fix) */}
        <div className="grid grid-cols-3 gap-4 pt-12 border-t border-slate-100 max-w-2xl mx-auto">
          
          {/* Badge 1 - Interactive */}
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <div className="p-3 rounded-2xl bg-blue-50/50 text-blue-600 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-[360deg] group-hover:scale-110 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
              Verified Content
            </span>
          </div>

          {/* Badge 2 - Interactive */}
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <div className="p-3 rounded-2xl bg-blue-50/50 text-blue-600 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:-translate-y-2 group-hover:scale-110 shadow-sm">
              <GraduationCap size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
              Expert Doctors
            </span>
          </div>

          {/* Badge 3 - Interactive */}
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <div className="p-3 rounded-2xl bg-blue-50/50 text-blue-600 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-125 group-hover:shadow-xl shadow-sm">
              <Globe size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
              Global Hub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
