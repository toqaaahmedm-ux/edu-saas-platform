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
    <html lang="en" dir="ltr" className={cn("scroll-smooth", geist.variable, tajawal.variable)}>
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
