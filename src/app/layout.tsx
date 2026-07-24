import { Tajawal, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { cn } from "@/lib/utils";
import { AuthInitializer } from "@/components/AuthInitializer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-arabic",
});

// Single source of html/body for the whole app — avoids nested <html>
// tags that happen when both this layout and [locale]/layout.tsx each
// render their own. getLocale()/getMessages() work here too since
// next-intl reads the locale that middleware already resolved.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth" className={cn(geist.variable, tajawal.variable)}>
      <body className={cn("min-h-screen bg-white font-sans antialiased", tajawal.className)}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthInitializer>{children}</AuthInitializer>
          </QueryProvider>
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
