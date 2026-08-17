"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Video, Plus, Trash2 } from "lucide-react";
import { useCourseLiveSessions, useCreateLiveSession, useDeleteLiveSession } from "@/services/live-sessions.service";
import { toast } from "sonner";

export default function TeacherLiveSessionsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: sessions = [], isLoading, isError } = useCourseLiveSessions(courseId);
  const { mutate: createSession, isPending: isCreating } = useCreateLiveSession(courseId);
  const { mutate: deleteSession } = useDeleteLiveSession(courseId);

  const [title, setTitle] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const handleCreate = () => {
    if (!title || !meetingUrl || !scheduledAt) {
      toast.error("Please fill in all fields");
      return;
    }
    createSession(
      { title, meetingUrl, scheduledAt: new Date(scheduledAt).toISOString(), durationMinutes },
      {
        onSuccess: () => {
          toast.success("Live session created");
          setTitle("");
          setMeetingUrl("");
          setScheduledAt("");
          setDurationMinutes(60);
        },
        onError: () => toast.error("Failed to create live session"),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteSession(id, {
      onSuccess: () => toast.success("Live session deleted"),
      onError: () => toast.error("Failed to delete live session"),
    });
  };

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
        <p className="text-red-500 font-medium">Failed to load live sessions</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8">Live Sessions</h1>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Schedule a new session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Session title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2"
          />
          <input
            type="url"
            placeholder="Meeting URL (Zoom/Meet)"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2"
          />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-4 py-2"
          />
        </div>
        <button
          disabled={isCreating}
          onClick={handleCreate}
          className="mt-4 flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={18} />
          {isCreating ? "Creating..." : "Create Session"}
        </button>
      </div>

      {sessions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-3">Title</th>
                <th className="text-left px-6 py-3">Scheduled At</th>
                <th className="text-left px-6 py-3">Duration</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Link</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session: any) => (
                <tr key={session.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-bold">{session.title}</td>
                  <td className="px-6 py-4">{new Date(session.scheduledAt).toLocaleString()}</td>
                  <td className="px-6 py-4">{session.durationMinutes} min</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 font-black px-2 py-1 rounded-lg text-xs">
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Join
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(session.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
          <Video size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No live sessions scheduled yet</p>
        </div>
      )}
    </div>
  );
}