import Link from "next/link";
import { loadBiocharData } from "./biochar/ona";
import { ACTIVE_WINDOW_DAYS, COMPLIANCE_WINDOW_DAYS } from "./biochar/data";
import { daysAgo } from "./biochar/compute";
import { getT } from "@/lib/i18n/server";
import { qualityLabel } from "@/lib/i18n/enumLabels";
import { Card, CardContent } from "@/components/ui/card";
export const dynamic = "force-dynamic";

const C = {
  brand: "#c2410c",
  border: "#e7e5e4", text: "#1c1917", muted: "#78716c",
  success: "#15803d", danger: "#b91c1c", warning: "#b45309",
  bg: "#fafaf8",
};

function Stat({ label, value, sub }: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col">
        <p className="text-xs font-medium" style={{ color: C.muted }}>{label}</p>
        <p className="text-2xl font-bold mt-0.5 leading-tight" style={{ color: C.text }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: C.muted }}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default async function OverviewPage() {
  const [data, t] = await Promise.all([loadBiocharData(), getT()]);
  const batches = data.batches;
  const hasData = batches.length > 0 && !data.error;

  const monthCutoff  = daysAgo(30);
  const weekCutoff   = daysAgo(7);
  const activeCutoff = daysAgo(ACTIVE_WINDOW_DAYS);

  const totalBiochar = batches.reduce((s, b) => s + b.biochar_wet_weight_kg, 0);
  const regainBatches = batches.filter(b => b.data_source === "regain_kiln_operator");
  const regainKg     = regainBatches.reduce((s, b) => s + b.dry_kg, 0);
  const combinedKg   = totalBiochar + regainKg;
  const monthBatches = batches.filter(b => b.production_date >= monthCutoff).length;
  const weekBatches  = batches.filter(b => b.production_date >= weekCutoff).length;
  const activeKilns  = new Set(batches.filter(b => b.production_date >= activeCutoff).map(b => b.kiln_id)).size;
  const totalKilns   = new Set(batches.map(b => b.kiln_id)).size;
  const qualPct      = batches.length ? batches.filter(b => b.c_quality_acceptable).length / batches.length * 100 : 0;
  const csiOk        = batches.filter(b => b.csi_compliant).length;
  const compFlags    = batches.filter(b => b.production_date >= daysAgo(COMPLIANCE_WINDOW_DAYS) && b.compliance_fails > 0).length;
  const safetyInc    = batches.filter(b => b.safety_incidents.toLowerCase() !== "none").length;
  const latest       = batches[0];


  return (
    <div className="min-h-full" style={{ background: C.bg }}>
      <header className="border-b bg-white px-6 py-5" style={{ borderColor: C.border }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          {t("overview.eyebrow")}
        </p>
        <h1 className="text-xl font-semibold mt-0.5" style={{ color: C.text }}>
          {t("overview.title")}
        </h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>
          {t("overview.subtitle")}
        </p>
      </header>

      {data.error && (
        <div className="mx-6 mt-4 rounded-xl border border-l-4 px-4 py-3 text-sm bg-white"
          style={{ borderColor: C.border, borderLeftColor: C.danger, color: C.danger }}>
          {t("overview.onaError", { error: data.error })}
        </div>
      )}

      <div className="px-6 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: C.text }}>{t("overview.productionHeading")}</h2>
          <Link href="/biochar" className="text-xs font-medium hover:underline" style={{ color: C.brand }}>{t("overview.fullDashboard")}</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <Stat
            label={t("overview.stat.totalProduced")}
            value={hasData ? `${combinedKg.toFixed(0)} kg` : "—"}
            sub={
              !hasData ? t("overview.stat.notConnected")
              : regainKg > 0 ? t("overview.stat.totalProduced.breakdown", { measured: totalBiochar.toFixed(0), est: regainKg.toFixed(0) })
              : t("overview.stat.totalProduced.sub", { date: (data.batches[0]?.production_date ?? "").slice(5) })
            }
          />
          <Stat label={t("overview.stat.carbon")} value={t("overview.stat.pending")} sub={t("overview.stat.carbon.sub")} />
          <Stat label={t("overview.stat.prosopisRemoved")} value={t("overview.stat.pending")} sub={t("overview.stat.prosopisRemoved.sub")} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label={t("overview.stat.batches")}
            value={hasData ? String(batches.length) : "—"}
            sub={hasData ? t("overview.stat.batches.sub", { month: monthBatches, week: weekBatches }) : undefined}
          />
          <Stat
            label={t("overview.stat.activeKilns")}
            value={hasData ? `${activeKilns} / ${totalKilns}` : "—"}
            sub={t("overview.stat.lastNDays", { n: ACTIVE_WINDOW_DAYS })}
          />
          <Stat
            label={t("overview.stat.qualityPass")}
            value={hasData ? `${qualPct.toFixed(0)}%` : "—"}
            sub={t("overview.stat.qualityPass.sub")}
          />
          <Stat
            label={t("overview.stat.complianceFlags")}
            value={hasData ? String(compFlags) : "—"}
            sub={t("overview.stat.complianceFlags.sub", { n: COMPLIANCE_WINDOW_DAYS, incidents: safetyInc })}
          />
        </div>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              href: "/map",
              title: t("overview.module.map.title"),
              desc: t("overview.module.map.desc"),
              badge: hasData ? t("overview.module.map.badge", { n: totalKilns }) : t("overview.module.map.badge.waiting"),
              ok: hasData,
            },
            {
              href: "/biochar",
              title: t("overview.module.biochar.title"),
              desc: t("overview.module.biochar.desc"),
              badge: hasData ? t("overview.module.biochar.badge", { n: batches.length }) : data.error ? t("overview.module.biochar.badge.unavailable") : t("overview.module.biochar.badge.noData"),
              ok: hasData,
            },
            {
              href: "/reports",
              title: t("overview.module.reports.title"),
              desc: t("overview.module.reports.desc"),
              badge: t("overview.module.reports.badge"),
              ok: false,
            },
          ].map(m => (
            <Link key={m.href} href={m.href}
              className="group block bg-white rounded-xl border p-4 transition-colors hover:border-stone-300"
              style={{ borderColor: C.border }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-sm font-semibold" style={{ color: C.text }}>{m.title}</h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
                  style={{ background: "#f5f5f4", color: m.ok ? C.success : C.muted }}>
                  {m.badge}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{m.desc}</p>
              <div className="mt-3 text-xs font-medium group-hover:underline" style={{ color: C.brand }}>{t("overview.module.open")}</div>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.border }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: C.text }}>{t("overview.latestBatch.title")}</h2>
            {!hasData ? (
              <p className="text-xs" style={{ color: C.muted }}>
                {data.error ? t("overview.latestBatch.unavailable") : t("overview.latestBatch.none")}
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <p className="text-xs" style={{ color: C.muted }}>{t("overview.latestBatch.batchId")}</p>
                  <p className="font-semibold mt-0.5" style={{ color: C.text }}>{latest.batch_id}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                    {latest.production_date} · {latest.kiln_id} · {latest.operator_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-2.5" style={{ borderColor: C.border }}>
                    <p className="text-xs" style={{ color: C.muted }}>{t("overview.latestBatch.output")}</p>
                    <p className="font-semibold" style={{ color: C.text }}>{latest.biochar_wet_weight_kg.toFixed(1)} kg</p>
                    <p className="text-xs" style={{ color: C.muted }}>{qualityLabel(t, latest.biochar_visual_quality)}</p>
                  </div>
                  <div className="rounded-lg border p-2.5" style={{ borderColor: C.border }}>
                    <p className="text-xs" style={{ color: C.muted }}>{t("overview.latestBatch.csiStatus")}</p>
                    <p className="font-semibold" style={{ color: latest.csi_compliant ? C.success : C.danger }}>
                      {latest.csi_compliant ? t("overview.latestBatch.compliant") : t("overview.latestBatch.fails", { n: latest.compliance_fails })}
                    </p>
                    <p className="text-xs" style={{ color: C.muted }}>{latest.pyrolysis_duration_min} min</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.border }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: C.text }}>{t("overview.compliance.title")}</h2>
            {!hasData ? (
              <p className="text-xs" style={{ color: C.muted }}>{t("overview.compliance.connect")}</p>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: t("overview.compliance.csi"),     value: `${csiOk}/${batches.length}`,                              pct: csiOk / batches.length },
                  { label: t("overview.compliance.quality"), value: `${qualPct.toFixed(0)}%`,                                  pct: qualPct / 100 },
                  { label: t("overview.compliance.safety"),  value: `${batches.length - safetyInc}/${batches.length}`,          pct: (batches.length - safetyInc) / batches.length },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: C.muted }}>{item.label}</span>
                      <span className="font-semibold" style={{ color: C.text }}>{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#e7e5e4" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, item.pct * 100).toFixed(0)}%`,
                          background: item.pct >= 0.8 ? C.success : item.pct >= 0.5 ? C.warning : C.danger,
                        }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.border }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: C.text }}>{t("overview.connections.title")}</h2>
            <div className="space-y-1.5 text-xs">
              {[
                { label: t("overview.connections.biocharForm"),    ok: hasData, status: hasData ? t("overview.connections.connected") : t("overview.connections.error") },
                { label: t("overview.connections.harvestingForm"), ok: false,   status: t("overview.connections.notConfigured") },
                { label: t("overview.connections.gee"),            ok: false,   status: t("overview.connections.notConnected") },
                { label: t("overview.connections.carbon"),         ok: false,   status: t("overview.connections.pending") },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span style={{ color: C.text }}>{item.label}</span>
                  <span className="font-medium" style={{ color: item.ok ? C.success : C.muted }}>
                    {item.ok ? "●" : "○"} {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="px-6 pb-6">
        <div className="rounded-xl border bg-white px-4 py-3" style={{ borderColor: C.border }}>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: C.muted }}>
            <span>{t("common.footerBrand")}</span>
            <span>·</span>
            <span>{t("overview.footer.form", { id: data.formId ?? t("overview.footer.notConfigured") })}</span>
            <span>·</span>
            <span>{t("overview.footer.loaded", { when: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) })}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
