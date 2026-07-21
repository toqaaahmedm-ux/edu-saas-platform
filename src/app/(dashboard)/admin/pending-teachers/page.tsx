"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  usePendingTeachers,
  useApproveTeacher,
  useRejectTeacher,
} from "@/services/pending-teachers.service";

export default function PendingTeachersPage() {
  const { data: teachers = [], isLoading, isError } = usePendingTeachers();
  const { mutate: approve, isPending: isApproving } = useApproveTeacher();
  const { mutate: reject, isPending: isRejecting } = useRejectTeacher();

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-red-200 rounded-3xl">
        <p className="text-red-500 font-medium">Failed to load pending teachers.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Pending Teacher Approvals</h1>
      <p className="text-slate-500 text-sm mb-8">
        These teachers self-registered and can't log in until you approve or reject them.
      </p>

      {teachers.length > 0 ? (
        <div className="space-y-3">
          {teachers.map((teacher: any) => (
            <div
              key={teacher.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-bold">{teacher.name}</p>
                <p className="text-slate-400 text-sm">{teacher.email}</p>
                <p className="text-slate-300 text-xs mt-1">
                  Registered {new Date(teacher.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={isApproving}
                  onClick={() =>
                    approve(teacher.id, {
                      onSuccess: () => toast.success(`${teacher.name} approved`),
                      onError: () => toast.error("Failed to approve"),
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  disabled={isRejecting}
                  onClick={() =>
                    reject(teacher.id, {
                      onSuccess: () => toast.success(`${teacher.name} rejected`),
                      onError: () => toast.error("Failed to reject"),
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 font-medium">No pending teacher registrations.</p>
        </div>
      )}
    </div>
  );
}