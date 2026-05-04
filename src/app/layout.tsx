import { Tajawal, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
// استيراد الـ Providerء  src/providers/QueryProvider.tsx)
import QueryProvider from "@/providers/QueryProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={cn("font-sans", geist.variable)}>
      <body className={tajawal.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
        
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
