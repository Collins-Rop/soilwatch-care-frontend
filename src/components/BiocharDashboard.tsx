"use client";

import { useMemo, useState } from "react";
import type { BiocharDataSource } from "../app/biochar/ona";
import {
  computeKpis, computeSiteTrends, computeOperatorScores, computeDecisionSnapshot, daysAgo,
} from "../app/biochar/compute";
import { ACTIVE_WINDOW_DAYS, COMPLIANCE_WINDOW_DAYS } from "../app/biochar/data";
import TabProduction from "../app/biochar/tabs/TabProduction";
import TabQuality from "../app/biochar/tabs/TabQuality";
import TabOperations from "../app/biochar/tabs/TabOperations";
import TabRecords from "../app/biochar/tabs/TabRecords";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";

const C = {
  brand: "#c2410c",
  border: "#e7e5e4", text: "#1c1917", muted: "#78716c",
  success: "#15803d", successBg: "#f0fdf4",
  danger: "#b91c1c", dangerBg: "#fef2f2",
  warning: "#b45309", warningBg: "#fffbeb",
  bg: "#fafaf8",
};

type Tab = "production" | "quality" | "operations" | "records";
type Panel = "snapshot" | null;

const TABS: { id: Tab; labelKey: string }[] = [
  { id: "production", labelKey: "biochar.tab.production" },
  { id: "quality",    labelKey: "biochar.tab.quality" },
  { id: "operations", labelKey: "biochar.tab.operations" },
  { id: "records",    labelKey: "biochar.tab.records" },
];

const ALERT_TYPE_KEYS: Record<string, string> = {
  "Safety incident": "biochar.alert.safetyIncident",
  "CSI failure": "biochar.alert.csiFailure",
  "Duration out of range": "biochar.alert.durationOutOfRange",
  "Late submission": "biochar.alert.lateSubmission",
  "Idle kiln": "biochar.alert.idleKiln",
};

function KpiCard({ label, value, sub, flag }: {
  label: string; value: string; sub?: string; flag?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col">
        <p className="text-xs font-medium" style={{ color: C.muted }}>{label}</p>
        <p className="text-2xl font-bold mt-1 leading-tight" style={{ color: C.text }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: C.muted }}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

interface Props { dataSource: BiocharDataSource }

export default function BiocharDashboard({ dataSource }: Props) {
  const { t } = useLanguage();
  const allBatches = dataSource.batches;

  const [activeTab, setActiveTab]     = useState<Tab>("production");
  const [drillFilter, setDrillFilter] = useState<string | null>(null);
  const [openPanel, setOpenPanel]     = useState<Panel>(null);

  const earliest = allBatches.length ? allBatches[allBatches.length - 1].production_date : daysAgo(90);
  const latest   = allBatches.length ? allBatches[0].production_date : new Date().toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(earliest);
  const [dateTo,   setDateTo]   = useState(latest);

  const df = useMemo(
    () => allBatches.filter(b => b.production_date >= dateFrom && b.production_date <= dateTo),
    [allBatches, dateFrom, dateTo],
  );

  const kpis           = useMemo(() => computeKpis(df), [df]);
  const siteTrends     = useMemo(() => computeSiteTrends(df), [df]);
  const operatorScores = useMemo(() => computeOperatorScores(df), [df]);
  const snapshot       = useMemo(() => computeDecisionSnapshot(df), [df]);

  const hasData = df.length > 0 && !dataSource.error;

  function togglePanel(p: Panel) {
    setOpenPanel(prev => (prev === p ? null : p));
  }

  const criticalCount = snapshot.critical.length;

  return (
    <div className="min-h-full" style={{ background: C.bg }}>

      <header className="border-b bg-white px-6 py-4" style={{ borderColor: C.border }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
              {t("biochar.eyebrow")}
            </p>
            <h1 className="text-xl font-bold mt-0.5" style={{ color: C.text }}>
              {t("biochar.title")}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: C.muted }}>{t("biochar.period")}</span>
            <input type="date" value={dateFrom} max={dateTo}
              onChange={e => setDateFrom(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1"
              style={{ borderColor: C.border }} />
            <span className="text-xs" style={{ color: C.muted }}>{t("biochar.periodTo")}</span>
            <input type="date" value={dateTo} min={dateFrom}
              onChange={e => setDateTo(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1"
              style={{ borderColor: C.border }} />
            {(dateFrom !== earliest || dateTo !== latest) && (
              <button onClick={() => { setDateFrom(earliest); setDateTo(latest); }}
                className="text-xs px-2.5 py-1.5 rounded-lg border hover:bg-stone-50 transition-colors"
                style={{ borderColor: C.border, color: C.muted }}>
                {t("biochar.reset")}
              </button>
            )}

            <div className="w-px h-5 mx-1" style={{ background: C.border }} />

            <button
              onClick={() => togglePanel("snapshot")}
              className="relative flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-stone-50"
              style={{
                borderColor: openPanel === "snapshot" ? C.brand : C.border,
                color: openPanel === "snapshot" ? C.brand : C.text,
              }}>
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ background: C.danger }}>{criticalCount}</span>
              )}
              {t("biochar.decisionSnapshot")}
            </button>

          </div>
        </div>
      </header>

      {dataSource.error && (
        <div className="mx-6 mt-4 rounded-xl border px-4 py-3 text-sm border-l-4"
          style={{ borderColor: C.border, borderLeftColor: C.danger, color: C.danger }}>
          <strong>{t("biochar.onaIssue")}</strong> {dataSource.error}
        </div>
      )}

      <div className="px-6 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label={t("biochar.kpi.totalBatches")}
          value={hasData ? String(kpis.totalBatches) : "—"}
          sub={hasData ? t("biochar.kpi.totalBatches.sub", { month: kpis.monthBatches, week: kpis.weekBatches }) : t("biochar.kpi.notConnected")}
        />
        <KpiCard
          label={t("biochar.kpi.biocharProduced")}
          value={hasData ? `${kpis.combinedBiochar.toFixed(0)} kg` : "—"}
          sub={hasData ? t("biochar.kpi.biocharProduced.sub", { n: kpis.dryBiochar.toFixed(0) }) : undefined}
        />
        <KpiCard
          label={t("biochar.kpi.activeKilns")}
          value={hasData ? `${kpis.activeKilns} / ${kpis.totalKilns}` : "—"}
          sub={t("biochar.kpi.lastNDays", { n: ACTIVE_WINDOW_DAYS })}
        />
        <KpiCard
          label={t("biochar.kpi.csiCompliance")}
          value={hasData ? `${kpis.csiCompliant} / ${kpis.totalBatches}` : "—"}
          sub={hasData ? t("biochar.kpi.csiCompliance.sub", { n: kpis.compFlagsN, days: COMPLIANCE_WINDOW_DAYS }) : undefined}
          flag={hasData && kpis.compFlagsN > 0}
        />
      </div>

      {hasData && (
        <div className="px-6 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label={t("biochar.kpi.qualityPassRate")}
            value={`${kpis.qualPassRate.toFixed(0)}%`}
            sub={t("biochar.kpi.qualityPassRate.sub")}
            flag={kpis.qualPassRate < 50}
          />
          <KpiCard
            label={t("biochar.kpi.avgPyrolysis")}
            value={`${kpis.avgDuration.toFixed(0)} min`}
            sub={t("biochar.kpi.avgPyrolysis.sub", { min: kpis.minDuration, max: kpis.maxDuration })}
            flag={kpis.durationFlag}
          />
          <KpiCard
            label={t("biochar.kpi.safetyIncidents")}
            value={String(kpis.safetyInc)}
            sub={t("biochar.kpi.safetyIncidents.sub")}
            flag={kpis.safetyInc > 0}
          />
          <KpiCard
            label={t("biochar.kpi.activeOperators")}
            value={`${kpis.activeOps} / ${kpis.totalOps}`}
            sub={t("biochar.kpi.lastNDays", { n: ACTIVE_WINDOW_DAYS })}
          />
        </div>
      )}

      <div className="px-6 mt-6">
        <div className="flex border-b" style={{ borderColor: C.border }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 text-sm font-medium -mb-px transition-colors"
              style={{
                color: activeTab === tab.id ? C.brand : C.muted,
                borderBottom: `2px solid ${activeTab === tab.id ? C.brand : "transparent"}`,
                background: "transparent",
              }}>
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {!hasData ? (
          <div className="rounded-xl border bg-white px-6 py-12 text-center" style={{ borderColor: C.border }}>
            <p className="text-sm font-medium" style={{ color: C.text }}>{t("biochar.noData.title")}</p>
            <p className="text-xs mt-1" style={{ color: C.muted }}>
              {dataSource.error ? t("biochar.noData.error") : t("biochar.noData.noMatch")}
            </p>
          </div>
        ) : activeTab === "production" ? (
          <TabProduction df={df} siteTrends={siteTrends} operatorScores={operatorScores} />
        ) : activeTab === "quality" ? (
          <TabQuality df={df} />
        ) : activeTab === "operations" ? (
          <TabOperations df={df} drillFilter={drillFilter} onClearDrill={() => setDrillFilter(null)} />
        ) : (
          <TabRecords df={df} kpis={kpis} dateFrom={dateFrom} dateTo={dateTo} />
        )}
      </div>

      <footer className="px-6 pb-6">
        <div className="rounded-xl border bg-white px-4 py-3" style={{ borderColor: C.border }}>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: C.muted }}>
            <span>{t("biochar.footer.form", { id: dataSource.formId ?? t("biochar.footer.notConfigured") })}</span>
            <span>·</span>
            <span>{t("biochar.footer.loaded", { when: new Date(dataSource.loadedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) })}</span>
            <span>·</span>
            <span>{t("biochar.footer.totalBatches", { n: allBatches.length })}</span>
          </div>
        </div>
      </footer>

      {openPanel && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.15)" }}
          onClick={() => setOpenPanel(null)}
        />
      )}

      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl transition-transform duration-200"
        style={{
          width: 420,
          borderLeft: `1px solid ${C.border}`,
          transform: openPanel === "snapshot" ? "translateX(0)" : "translateX(100%)",
        }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: C.border }}>
          <h2 className="text-sm font-semibold" style={{ color: C.text }}>{t("biochar.snapshot.title")}</h2>
          <button onClick={() => setOpenPanel(null)}
            className="text-xs px-2.5 py-1 rounded border hover:bg-stone-50 transition-colors"
            style={{ borderColor: C.border, color: C.muted }}>
            {t("biochar.snapshot.close")}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: C.danger }}>
              {t("biochar.snapshot.critical", { n: snapshot.critical.length })}
            </p>
            {snapshot.critical.length === 0 ? (
              <p className="text-sm" style={{ color: C.muted }}>{t("biochar.snapshot.criticalNone")}</p>
            ) : (
              <div className="space-y-2">
                {snapshot.critical.map((item, i) => (
                  <div key={i} className="pl-3 py-2 border-l-2 text-sm"
                    style={{ borderLeftColor: C.danger }}>
                    <p className="font-semibold" style={{ color: C.danger }}>{ALERT_TYPE_KEYS[item.type] ? t(ALERT_TYPE_KEYS[item.type]) : item.type}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>{item.site}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.text }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: C.warning }}>
              {t("biochar.snapshot.warnings", { n: snapshot.warnings.length })}
            </p>
            {snapshot.warnings.length === 0 ? (
              <p className="text-sm" style={{ color: C.muted }}>{t("biochar.snapshot.warningsNone")}</p>
            ) : (
              <div className="space-y-2">
                {snapshot.warnings.map((item, i) => (
                  <div key={i} className="pl-3 py-2 border-l-2 text-sm"
                    style={{ borderLeftColor: C.warning }}>
                    <p className="font-semibold" style={{ color: C.warning }}>{ALERT_TYPE_KEYS[item.type] ? t(ALERT_TYPE_KEYS[item.type]) : item.type}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>{item.site}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.text }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

    </div>
  );
}
