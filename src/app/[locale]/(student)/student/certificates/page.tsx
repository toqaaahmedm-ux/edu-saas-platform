"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Certificate } from "@/components/student/Certificate";
import { Award, Download, Eye, FileCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useTranslations, useLocale } from "next-intl";

export default function CertificatesPage() {
  const user = useAuthStore((state) => state.user);
  const [previewId, setPreviewId] = useState<string | null>(null);
  // PDF-NEW: track which certificate is currently downloading (so we can disable its button
  // only, not all of them), and any error that happened during download.
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const t = useTranslations("studentCertificates");
  const locale = useLocale();

  // fetch certificates from the API
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => {
      const res = await apiClient.get("/certificates/my");
      return res.data?.data ?? [];
    },
  });

  // PDF-NEW: download a real PDF certificate generated server-side via Puppeteer,
  // instead of relying on window.print() in the browser.
  const handleDownloadPdf = async (certId: string) => {
    setDownloadError(null);
    setDownloadingId(certId);
    try {
      const res = await apiClient.get(`/certificates/${certId}/pdf`, {
        params: { lang: locale },
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `certificate-${certId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setDownloadError(t("pdfDownloadError"));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-10">

      <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black text-slate-800 mb-2">{t("title")}</h2>
          <p className="text-slate-500 font-medium text-lg italic">
            {t("congrats", { name: user?.name || "Student" })}
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl shadow-inner">
          <FileCheck className="text-blue-600 w-10 h-10" />
        </div>
      </div>

      {downloadError && (
        <div className="bg-red-50 border border-red-100 text-red-600 font-bold px-6 py-4 rounded-2xl">
          {downloadError}
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-700 text-lg uppercase tracking-wider">{t("earnedCredentials")}</h3>
          <span className={`text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-tighter ${certificates.length > 0 ? "bg-emerald-500" : "bg-slate-400"}`}>
            {certificates.length > 0 ? t("verifiedCount", { count: certificates.length }) : t("statusPending")}
          </span>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : certificates.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {certificates.map((cert: any) => (
                <div key={cert.id}>
                  <div className="p-8 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50/50 transition-all gap-6 group">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                        <Award size={32} />
                      </div>
                      <div>
                        /* Real data from the DB */
                        <h4 className="font-black text-slate-800 text-xl">{cert.examName}</h4>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {t("issuer")} <span className="text-blue-600">{cert.institutionName}</span>
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          {new Date(cert.issuedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button
                        onClick={() => setPreviewId(previewId === cert.id ? null : cert.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        <Eye size={20} /> {t("preview")}
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(cert.id)}
                        disabled={downloadingId === cert.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                      >
                        {downloadingId === cert.id ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Download size={20} />
                        )}
                        {downloadingId === cert.id ? t("preparingPdf") : t("pdf")}
                      </button>
                    </div>
                  </div>

                  {previewId === cert.id && (
                    <div className="p-12 bg-slate-900 flex justify-center animate-in zoom-in duration-500 relative overflow-hidden">
                      <div className="absolute top-4 right-4 text-white/20 font-black text-4xl select-none">{t("officialPreview")}</div>
                      <div className="scale-[0.45] md:scale-[0.75] lg:scale-[1] origin-top shadow-2xl">
                        <Certificate name={user?.name || "Student Name"} score={100} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-24 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <Award size={48} />
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 font-black text-2xl">{t("noCertificatesFound")}</p>
                <p className="text-slate-400 font-medium">{t("needScore")}</p>
              </div>
              <Link href="/student/quizzes" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all">
                {t("takeQuizNow")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}