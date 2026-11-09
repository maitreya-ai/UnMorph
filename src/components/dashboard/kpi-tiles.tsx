"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { Kpi } from "@/lib/mock-data";
import { cn, formatCount } from "@/lib/utils";

export function KpiTiles({ items }: { items: Kpi[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi, i) => (
        <motion.li
          key={kpi.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 * i }}
          className="border-[3px] border-nb-black bg-nb-surface p-5 shadow-nb"
        >
          <p className="font-heading text-[12px] font-bold tracking-wide text-nb-muted uppercase">
            {kpi.label}
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-[1.75rem] leading-none font-extrabold tracking-tight text-nb-black">
                {kpi.display ?? formatCount(kpi.value)}
              </p>
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-0.5 border-[2px] border-nb-black px-1.5 py-0.5 text-[11px] font-bold",
                  kpi.delta.good ? "bg-nb-green text-nb-black" : "bg-nb-pink text-nb-black",
                )}
              >
                {kpi.delta.direction === "up" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {kpi.delta.value}
                <span className="ml-1 font-normal normal-case opacity-70">
                  {kpi.delta.period}
                </span>
              </p>
            </div>
            <Sparkline values={kpi.trend} label={`${kpi.label} trend, last 12 periods`} />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

/** 12-point trend: flat ink line, current period in the accent. */
function Sparkline({ values, label }: { values: number[]; label: string }) {
  const w = 96;
  const h = 36;
  const pad = 5;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (w - pad * 2),
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts.at(-1)!;
  const [px, py] = pts.at(-2)!;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label={label}
      className="shrink-0 overflow-visible"
    >
      <motion.path
        d={line}
        fill="none"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <path d={`M${px} ${py} L${lx} ${ly}`} stroke="#FFD23F" strokeWidth="3" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="4" fill="#FFD23F" stroke="#000000" strokeWidth="2" />
    </svg>
  );
}
