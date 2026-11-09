"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, ScanFace, Search } from "lucide-react";
import { VerdictBadge } from "@/components/dashboard/verdict-badge";
import { Landscape } from "@/components/visuals/landscape";
import {
  countByVerdict,
  filterVerifications,
  timeAgo,
  type Verification,
  type VerdictFilter,
} from "@/lib/mock-data";
import { cn, truncateMiddle } from "@/lib/utils";

const tabs: { key: VerdictFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "authentic", label: "Authentic" },
  { key: "tampered", label: "Tampered" },
  { key: "unregistered", label: "Unregistered" },
];

export function VerificationsTable({
  items,
  onSelect,
}: {
  items: Verification[];
  onSelect: (item: Verification) => void;
}) {
  const [filter, setFilter] = useState<VerdictFilter>("all");
  const [query, setQuery] = useState("");
  const counts = useMemo(() => countByVerdict(items), [items]);
  const rows = useMemo(() => filterVerifications(items, filter, query), [items, filter, query]);

  return (
    <div className="border-[3px] border-nb-black bg-nb-surface shadow-nb">
      <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-[17px] font-extrabold tracking-tight text-nb-black uppercase">
            Recent verifications
          </h2>
          <p className="mt-0.5 text-[13px] text-nb-muted">
            Select a row to open its integrity report.
          </p>
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Search verifications</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-nb-black" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search file, ID or hash…"
            className="h-10 w-full border-[2px] border-nb-black bg-nb-surface pr-3 pl-10 text-[13.5px] font-bold text-nb-black outline-none placeholder:font-normal placeholder:text-nb-muted focus:bg-nb-yellow/10"
          />
        </label>
      </div>

      <div
        className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-y-[3px] border-nb-black px-5 sm:px-6"
        role="tablist"
        aria-label="Filter by verdict"
      >
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-3 py-2.5 font-heading text-[12.5px] font-bold uppercase transition-colors",
                active ? "text-nb-black" : "text-nb-muted hover:text-nb-black",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "border-[2px] border-nb-black px-1.5 py-px text-[11px] tabular-nums",
                  active ? "bg-nb-black text-nb-bg" : "bg-nb-bg text-nb-muted",
                )}
              >
                {counts[tab.key]}
              </span>
              {active && (
                <motion.span
                  layoutId="verification-tab"
                  className="absolute inset-x-2 -bottom-[3px] h-[3px] bg-nb-yellow"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13.5px]">
          <thead>
            <tr className="bg-nb-black text-left text-[11px] text-nb-bg uppercase">
              <th className="px-6 py-3 font-bold">Image</th>
              <th className="px-3 py-3 font-bold">Verdict</th>
              <th className="px-3 py-3 text-right font-bold">Confidence</th>
              <th className="px-3 py-3 font-bold">Fingerprint</th>
              <th className="px-3 py-3 font-bold">Source</th>
              <th className="px-3 py-3 text-right font-bold">Checked</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((item) => (
                <motion.tr
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, backgroundColor: "rgb(255 210 63 / 0.35)" }}
                  animate={{ opacity: 1, backgroundColor: "rgb(255 210 63 / 0)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => onSelect(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(item);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`${item.fileName}, ${item.verdict}, open report`}
                  className="group cursor-pointer border-t-[2px] border-nb-black outline-none hover:bg-nb-yellow/15 focus-visible:bg-nb-yellow/25"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="block h-10 w-14 shrink-0 overflow-hidden border-[2px] border-nb-black">
                        <Landscape variant={item.scene} tampered={item.verdict === "tampered"} />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[220px] truncate font-bold text-nb-black">
                          {item.fileName}
                        </span>
                        <span className="block text-[12px] text-nb-muted">{item.id}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <VerdictBadge verdict={item.verdict} />
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-nb-black tabular-nums">
                    {item.confidence.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] text-nb-muted">
                    {truncateMiddle(item.sha256, 8, 4)}
                  </td>
                  <td className="px-3 py-3 text-nb-muted">
                    <span className="inline-flex items-center gap-1.5">
                      {item.source}
                      {item.humanVerified && (
                        <ScanFace className="size-3.5 text-nb-black" aria-label="World ID verified" />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap text-nb-muted tabular-nums">
                    {timeAgo(item.checkedAt)}
                  </td>
                  <td className="px-3 py-3 text-nb-black">
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-[15px] font-extrabold text-nb-black uppercase">
              No verifications match
            </p>
            <p className="mt-1 text-[13px] text-nb-muted">Try another filter or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
