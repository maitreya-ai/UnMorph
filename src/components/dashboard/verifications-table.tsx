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
      <div className="flex flex-col gap-4 border-b-[3px] border-nb-black bg-nb-bg-warm px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[1.35rem] leading-tight text-nb-black">Recent verifications</h2>
          <p className="mt-1 font-mono text-[11px] tracking-[0.05em] text-nb-muted uppercase">
            Select a row to open its integrity report
          </p>
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Search verifications</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-nb-black"
            strokeWidth={2.5}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search file, ID or hash…"
            className="h-11 w-full border-[3px] border-nb-black bg-nb-surface pr-3 pl-10 text-[14px] text-nb-black transition-[transform,box-shadow] duration-100 outline-none placeholder:text-nb-muted focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-nb-sm"
          />
        </label>
      </div>

      <div
        className="flex [scrollbar-width:none] gap-2.5 overflow-x-auto border-b-[3px] border-nb-black px-5 py-3.5 sm:px-6"
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
                "flex shrink-0 items-center gap-2 border-2 border-nb-black px-3 py-1.5 font-heading text-[14px] font-bold transition-[background-color,box-shadow] duration-100",
                active
                  ? "bg-nb-yellow text-nb-black shadow-nb-sm"
                  : "bg-nb-surface text-nb-black hover:bg-nb-yellow-light",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "border-2 border-nb-black px-1.5 font-mono text-[11px] tabular-nums",
                  active ? "bg-nb-black text-nb-white" : "bg-nb-bg-warm text-nb-black",
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13.5px]">
          <thead>
            <tr className="bg-nb-black text-left font-mono text-[11px] tracking-[0.1em] text-nb-white uppercase">
              <th className="px-6 py-3 font-normal">Image</th>
              <th className="px-3 py-3 font-normal">Verdict</th>
              <th className="px-3 py-3 text-right font-normal">Confidence</th>
              <th className="px-3 py-3 font-normal">Fingerprint</th>
              <th className="px-3 py-3 font-normal">Source</th>
              <th className="px-3 py-3 text-right font-normal">Checked</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((item) => (
                <motion.tr
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, backgroundColor: "rgb(255 243 196 / 1)" }}
                  animate={{ opacity: 1, backgroundColor: "rgb(255 243 196 / 0)" }}
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
                  className="group cursor-pointer border-t-2 border-nb-black outline-none first:border-t-0 hover:bg-nb-yellow-light focus-visible:bg-nb-yellow-light"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="block h-10 w-14 shrink-0 overflow-hidden border-2 border-nb-black">
                        <Landscape variant={item.scene} tampered={item.verdict === "tampered"} />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[220px] truncate font-heading font-bold text-nb-black">
                          {item.fileName}
                        </span>
                        <span className="block font-mono text-[11px] text-nb-muted">{item.id}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <VerdictBadge verdict={item.verdict} />
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-nb-black tabular-nums">
                    {item.confidence.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] text-nb-black/75">
                    {truncateMiddle(item.sha256, 8, 4)}
                  </td>
                  <td className="px-3 py-3 text-nb-black">
                    <span className="inline-flex items-center gap-1.5">
                      {item.source}
                      {item.humanVerified && (
                        <ScanFace className="size-4 text-nb-black" aria-label="World ID verified" />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[12px] whitespace-nowrap text-nb-black/75 tabular-nums">
                    {timeAgo(item.checkedAt)}
                  </td>
                  <td className="px-3 py-3 text-nb-black">
                    <ChevronRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="m-5 border-[3px] border-dashed border-nb-black bg-nb-bg-warm px-6 py-12 text-center">
            <p className="font-heading text-[17px] font-bold text-nb-black">
              No verifications match
            </p>
            <p className="mt-1 font-mono text-[12px] text-nb-muted uppercase">
              Try another filter or search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
