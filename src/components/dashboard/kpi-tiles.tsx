"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { Kpi } from "@/lib/mock-data";
import { cn, formatCount } from "@/lib/utils";

const TILE_TONES = ["bg-nb-surface", "bg-nb-blue-light", "bg-nb-pink-light", "bg-nb-yellow-light"];

export function KpiTiles({ items }: { items: Kpi[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi, i) => (
        <motion.li
          key={kpi.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 * i }}
          className={cn(
            "border-[3px] border-nb-black p-5 shadow-nb",
            TILE_TONES[i % TILE_TONES.length],
          )}
        >
          <p className="font-mono text-[11px] tracking-[0.1em] text-nb-black uppercase">
            {kpi.label}
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-[2.1rem] leading-none font-extrabold tracking-[-0.03em] text-nb-black">
                {kpi.display ?? formatCount(kpi.value)}
              </p>
              <p
                className={cn(
                  "mt-3 inline-flex items-center gap-0.5 border-2 border-nb-black px-1.5 py-0.5 font-mono text-[11px] font-bold text-nb-black",
                  kpi.delta.good ? "bg-nb-green" : "bg-nb-pink",
                )}
              >
                {kpi.delta.direction === "up" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {kpi.delta.value}
              </p>
              <p className="mt-1.5 font-mono text-[10.5px] text-nb-black/70 uppercase">
                {kpi.delta.period}
              </p>
            </div>
            <Sparkline values={kpi.trend} label={`${kpi.label} trend, last 12 periods`} />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

/** 12-point trend: 2.5px black polyline, current period as a pink square. */
function Sparkline({ values, label }: { values: number[]; label: string }) {
  const w = 96;
  const h = 40;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (w - pad * 2),
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts.at(-1)!;

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
        strokeWidth="2.5"
        strokeLinejoin="miter"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
      <rect
        x={lx - 4.5}
        y={ly - 4.5}
        width="9"
        height="9"
        fill="#FF6B6B"
        stroke="#000000"
        strokeWidth="2"
      />
    </svg>
  );
}
