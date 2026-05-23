
import { Tajawal, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const tajawal = Tajawal({ 
  subsets: ["arabic"], 
  weight: ["400", "500", "700", "900"],
  variable: '--font-arabic' 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ✅ حذف scroll-smooth وحطينا data-scroll-behavior بدلها — ده بيحل الـ warning بتاع Next.js
    <html lang="en" dir="ltr" data-scroll-behavior="smooth" className={cn(geist.variable, tajawal.variable)}>
      <body className={cn("min-h-screen bg-white font-sans antialiased", tajawal.className)}>
        <QueryProvider>
          {children}
        </QueryProvider>
        {/* حل مشكلة BUG-16: التنبيهات في مكان ثابت وواضح */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
