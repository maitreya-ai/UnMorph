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
  const added = items.length - recentVerifications.length;

  // Transient UI resets when Next hides this route with <Activity>.
  useLayoutEffect(() => () => setSelected(null), []);

  const handleComplete = useCallback((record: Verification) => {
    setItems((prev) => [record, ...prev]);
  }, []);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <div className="space-y-8">
      <motion.header
        id="dash-overview"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-5 border-b-4 border-nb-black pb-7 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="nb-label bg-nb-yellow">Welcome back, {mockUser.name.split(" ")[0]}</p>
          <h1 className="mt-4 font-heading text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.02em] text-nb-black">
            Image verification
          </h1>
          <p className="mt-2 text-[15px] text-nb-black/80">
            Register originals, verify copies and review integrity history across your workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToSection("dash-register")}
            className="inline-flex h-12 shrink-0 nb-press items-center gap-2 border-[3px] border-nb-black bg-nb-surface px-5 font-heading text-[15px] font-bold text-nb-black"
          >
            <ImageUp className="size-4.5" strokeWidth={2.25} />
            Register an image
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("dash-verify")}
            className="inline-flex h-12 shrink-0 nb-press items-center gap-2 border-[3px] border-nb-black bg-nb-yellow px-5 font-heading text-[15px] font-bold text-nb-black"
          >
            <ScanSearch className="size-4.5" strokeWidth={2.25} />
            Verify an image
          </button>
        </div>
      </motion.header>

      <KpiTiles items={kpis} />

      <div className="grid gap-8 xl:grid-cols-2">
        <section id="dash-register" aria-label="Register an image">
          <RegisterPanel />
        </section>
        <section id="dash-verify" aria-label="Verify an image">
          <VerifyPanel onComplete={handleComplete} onOpen={setSelected} sequence={added} />
        </section>
      </div>

      <section id="dash-incidents" aria-label="Morphing incident log">
        <IncidentsTable />
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
