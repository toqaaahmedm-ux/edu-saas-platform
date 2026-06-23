"use client";

import { ShieldCheck, Users, CreditCard, LayoutGrid, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCourses, useDeleteCourse } from "@/services/courses.service";
import { useUsers, useDeleteUser } from "@/services/users.service";
import { apiClient } from "@/lib/api/client";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { mutate: deleteCourse } = useDeleteCourse();
  const { mutate: deleteUser } = useDeleteUser();

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/courses/admin/stats');
      return res.data?.data ?? res.data;
    },
  });

  const totalStudents = users.filter((u: any) => u.role === 'STUDENT').length;
  const totalRevenue = adminStats?.totalRevenue ?? 0;

  const stats = [
    { label: "Total Revenue", value: `EGP ${Number(totalRevenue).toLocaleString()}`, icon: <CreditCard />, color: "bg-emerald-600" },
    { label: "Total Students", value: usersLoading ? "..." : totalStudents, icon: <Users />, color: "bg-blue-600" },
    { label: "Total Courses", value: coursesLoading ? "..." : courses.length, icon: <LayoutGrid />, color: "bg-amber-500" },
    { label: "System Health", value: "100%", icon: <ShieldCheck />, color: "bg-slate-700" },
  ];

  const handleApprove = async (id: string) => {
    try {
      await apiClient.patch(`/courses/${id}/status`, { status: "PUBLISHED" });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Course approved");
    } catch {
      toast.error("Failed to approve course");
    }
  };

  const handleReject = (id: string, title: string) => {
    deleteCourse(id, {
      onSuccess: () => toast.error(`Course "${title}" rejected and removed.`),
      onError: () => toast.error("Failed to reject course"),
    });
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id, {
      onSuccess: () => toast.success("User deleted"),
      onError: () => toast.error("Failed to delete user"),
    });
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Central Admin Panel 🔐</h2>
          <p className="text-slate-400 font-medium text-lg italic">
            Welcome back, {user?.name || "Admin"}. Monitoring {users.length} active members.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="relative z-10 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-red-600/90 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700/50 hover:border-red-500/30 transition-all duration-300 shadow-sm"
        >
          <span>Sign Out</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg`}>
              {stat.icon}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-black text-slate-800">Course Management</h3>
            <span className="text-sm bg-blue-100 text-blue-600 px-4 py-1 rounded-full font-bold">
              {courses.length} Courses
            </span>
          </div>
          {coursesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-slate-400 text-center py-10 font-bold italic">No courses yet.</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course: any) => (
                <div key={course.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black uppercase">
                      {course.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">{course.title}</h4>
                      <p className="text-xs text-slate-400">Instructor: <span className="text-blue-600 font-bold">{typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'Unknown'}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <button onClick={() => handleApprove(course.id)} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all">
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => handleReject(course.id, course.title)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">Recent Users</h3>
          {usersLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <div className="space-y-4">
              {users.slice(0, 5).map((u: any) => (
                <div key={u.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{u.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteUser(u.id)} className="text-slate-300 hover:text-red-500 transition-colors" aria-label="Delete user">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}