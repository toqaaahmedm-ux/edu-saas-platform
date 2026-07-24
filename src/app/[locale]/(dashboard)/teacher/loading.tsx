// [تقرير 1 - صفحة 4]: صلحت بند TC-04.. صفحة تحميل احترافية بدل الشاشة البيضاء
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="p-4 bg-blue-50 rounded-full animate-bounce">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
      </div>
      <p className="text-slate-400 font-black tracking-widest uppercase text-xs">
        Preparing your academic dashboard...
      </p>
    </div>
  );
}
