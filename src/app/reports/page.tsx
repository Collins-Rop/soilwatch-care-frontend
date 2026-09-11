import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import ReportGenerator from "@/components/ReportGenerator";
import { FileText, Lock } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export default async function ReportsPage() {
  const t = await getT();

  const reports = [
    { title: t("reports.item.coverage"),   status: t("reports.status.template"),        standard: null },
    { title: t("reports.item.production"), status: t("reports.status.available"),        standard: null },
    { title: t("reports.item.csi"),        status: t("reports.status.pendingSensors"),  standard: "CSI C-Sink" },
  ];
  const availableStatus = t("reports.status.available");

  return (
    <div className="min-h-full bg-white">
      <PageHeader title={t("reports.title")} description={t("reports.description")} />

      <div className="px-6 pt-4">
        <ReportGenerator />
      </div>

      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map((report) => {
          const available = report.status === availableStatus;
          return (
            <section key={report.title} className="bg-white rounded-lg border p-4" style={{ borderColor: "#e7e5e4", opacity: available ? 1 : 0.7 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: available ? "#f0fdf4" : "#f5f5f4" }}>
                    {available ? <FileText size={16} style={{ color: "#15803d" }} /> : <Lock size={16} style={{ color: "#a8a29e" }} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: "#1c1917" }}>{report.title}</h2>
                    <p className="mt-1 text-xs" style={{ color: "#78716c" }}>{report.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.standard && <Badge label={report.standard} variant="carbon" />}
                  <Badge label={available ? t("reports.badge.ready") : t("reports.badge.pending")} variant={available ? "green" : "stone"} />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
