"use client";
import { LucideIcon, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
}

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8 font-medium">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          {actionLabel}
        </Link>
      )}
    </div>
  );
};
