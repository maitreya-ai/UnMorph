"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { motion } from "motion/react";
import { ImageUp, ScanSearch } from "lucide-react";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { scrollToSection } from "@/components/dashboard/dashboard-nav";
import { IncidentsTable } from "@/components/dashboard/incidents-table";
import { KpiTiles } from "@/components/dashboard/kpi-tiles";
import { RegisterPanel } from "@/components/dashboard/register-panel";
import { VerificationDrawer } from "@/components/dashboard/verification-drawer";
import { VerificationsTable } from "@/components/dashboard/verifications-table";
import { VerifyPanel } from "@/components/dashboard/verify-panel";
import {
  dailyActivity,
  kpis,
  mockUser,
  recentVerifications,
  type Verification,
} from "@/lib/mock-data";

export function DashboardOverview() {
  const [items, setItems] = useState<Verification[]>(recentVerifications);
  const [selected, setSelected] = useState<Verification | null>(null);
  const [incidentSignal, setIncidentSignal] = useState(0);
  const added = items.length - recentVerifications.length;

  // Transient UI resets when Next hides this route with <Activity>.
  useLayoutEffect(() => () => setSelected(null), []);

  const handleComplete = useCallback((record: Verification) => {
    setItems((prev) => [record, ...prev]);
  }, []);
  const handleClose = useCallback(() => setSelected(null), []);
  // Bumped whenever register or verify logs a new incident on Arkiv — the incidents table
  // debounces its own re-fetch off this to give Arkiv time to index the write.
  const handleIncidentReported = useCallback(() => setIncidentSignal((s) => s + 1), []);

  return (
    <div className="space-y-6">
      <motion.header
        id="dash-overview"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-heading text-[13px] font-bold tracking-wide text-nb-black uppercase">
            Welcome back, {mockUser.name.split(" ")[0]}
          </p>
          <h1 className="mt-1 font-display text-[1.85rem] leading-tight font-extrabold tracking-[-0.03em] text-nb-black uppercase">
            Image verification
          </h1>
          <p className="mt-1 text-[14px] text-nb-muted">
            Register originals, verify copies and review integrity history across your workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToSection("dash-register")}
            className="nb-press-sm inline-flex h-11 shrink-0 items-center gap-2 border-[3px] border-nb-black bg-nb-surface px-4 font-heading text-[13px] font-bold text-nb-black uppercase"
          >
            <ImageUp className="size-4" />
            Register an image
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("dash-verify")}
            className="nb-press-sm inline-flex h-11 shrink-0 items-center gap-2 border-[3px] border-nb-black bg-nb-yellow px-4 font-heading text-[13px] font-bold text-nb-black uppercase"
          >
            <ScanSearch className="size-4" />
            Verify an image
          </button>
        </div>
      </motion.header>

      <KpiTiles items={kpis} />

      <div className="grid gap-6 xl:grid-cols-2">
        <section id="dash-register" aria-label="Register an image">
          <RegisterPanel onIncidentReported={handleIncidentReported} />
        </section>
        <section id="dash-verify" aria-label="Verify an image">
          <VerifyPanel
            onComplete={handleComplete}
            onOpen={setSelected}
            sequence={added}
            onIncidentReported={handleIncidentReported}
          />
        </section>
      </div>

      <section id="dash-incidents" aria-label="Morphing incident log">
        <IncidentsTable refreshSignal={incidentSignal} />
      </section>

      <section id="dash-activity" aria-label="Verification activity">
        <ActivityChart data={dailyActivity} />
      </section>

      <section id="dash-registry" aria-label="Recent verifications">
        <VerificationsTable items={items} onSelect={setSelected} />
      </section>

      <VerificationDrawer item={selected} onClose={handleClose} />
    </div>
  );
}
