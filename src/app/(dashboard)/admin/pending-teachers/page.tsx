"use client";
import { useState } from "react";
import { UserCheck, CheckCircle, XCircle, Loader2, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  usePendingTeachers,
  useApproveTeacher,
  useRejectTeacher,
} from "@/services/users.service";

export default function PendingTeachersPage() {
  const { data: pendingTeachers = [], isLoading } = usePendingTeachers();
  const { mutate: approveTeacher, isPending: approving } = useApproveTeacher();
  const { mutate: rejectTeacher, isPending: rejecting } = useRejectTeacher();
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  const handleApprove = (id: string, name: string) => {
    setActingOnId(id);
    approveTeacher(id, {
      onSuccess: () => toast.success(`${name} approved successfully.`),
      onError: () => toast.error("Failed to approve teacher."),
      onSettled: () => setActingOnId(null),
    });
  };

  const handleReject = (id: string, name: string) => {
    setActingOnId(id);
    rejectTeacher(id, {
      onSuccess: () => toast.success(`${name}'s registration was rejected.`),
      onError: () => toast.error("Failed to reject teacher."),
      onSettled: () => setActingOnId(null),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <UserCheck className="text-blue-600" size={32} />
          Pending Teacher Approvals
        </h2>
        <p className="text-slate-400 font-medium mt-1">
          Review and approve teachers who registered themselves.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : pendingTeachers.length === 0 ? (
          <div className="text-center py-16">
            <UserCheck className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold italic">
              No pending teacher approvals right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black uppercase">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">{teacher.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Mail size={12} /> {teacher.email}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      Registered {new Date(teacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    disabled={actingOnId === teacher.id}
                    onClick={() => handleApprove(teacher.id, teacher.name)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {actingOnId === teacher.id && approving ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Approve
                  </button>
                  <button
                    disabled={actingOnId === teacher.id}
                    onClick={() => handleReject(teacher.id, teacher.name)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {actingOnId === teacher.id && rejecting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
