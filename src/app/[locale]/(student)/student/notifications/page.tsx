"use client";

import { useState } from "react";
import { Bell, CheckCheck, Award, ClipboardCheck, GraduationCap, Loader2, Circle } from "lucide-react";
import { useLocale } from "next-intl";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, Notification } from "@/services/notifications.service";
import { EmptyState } from "@/components/shared/EmptyState";

function getIconForType(type: string) {
  switch (type) {
    case "CERTIFICATE":
      return <Award className="text-emerald-500" size={20} />;
    case "QUIZ_COMPLETED":
      return <ClipboardCheck className="text-blue-500" size={20} />;
    default:
      return <GraduationCap className="text-slate-400" size={20} />;
  }
}

export default function StudentNotificationsPage() {
  const locale = useLocale();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const shown = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 animate-in fade-in duration-700 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
              <Bell size={26} className="text-blue-500" /> Notifications
            </h1>
            <p className="text-slate-400 font-medium mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-100 transition disabled:opacity-60"
            >
              {isMarkingAll ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
              Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              filter === "all" ? "bg-slate-900 text-white shadow-md" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              filter === "unread" ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description={filter === "unread" ? "You've read everything — nice work." : "You'll see updates about quizzes, certificates, and courses here."}
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {shown.map((notif: Notification) => (
            <button
              key={notif.id}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={`w-full flex items-start gap-4 p-5 rounded-[1.75rem] border text-left transition-all ${
                notif.isRead
                  ? "bg-white border-slate-100"
                  : "bg-blue-50/50 border-blue-100 hover:bg-blue-50"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                {getIconForType(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 text-sm">{notif.title}</p>
                <p className="text-slate-500 text-sm mt-1">{notif.message}</p>
                <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">
                  {new Date(notif.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              {!notif.isRead && (
                <Circle className="text-blue-500 fill-blue-500 shrink-0 mt-2" size={8} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}