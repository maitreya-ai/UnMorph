"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChartColumn, Table2 } from "lucide-react";
import { verdictMeta } from "@/components/dashboard/verdict-badge";
import { useMeasure } from "@/hooks/use-measure";
import type { DailyActivity } from "@/lib/mock-data";
import type { Verdict } from "@/lib/verification";
import { cn } from "@/lib/utils";

/** Bottom → top stacking order. */
const SERIES: Verdict[] = ["authentic", "unregistered", "tampered"];
const HEIGHT = 248;
const M = { top: 12, right: 4, bottom: 28, left: 40 };
const GAP = 0;

const dayFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const longFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const num = new Intl.NumberFormat("en-US");

const total = (d: DailyActivity) => d.authentic + d.unregistered + d.tampered;

export function ActivityChart({ data }: { data: DailyActivity[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div className="border-[3px] border-nb-black bg-nb-surface shadow-nb">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-nb-black bg-nb-bg-warm px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-[1.35rem] leading-tight text-nb-black">Verification activity</h2>
          <p className="mt-1 font-mono text-[11px] tracking-[0.05em] text-nb-muted uppercase">
            Last 14 days · checks per day by verdict
          </p>
        </div>
        <div
          className="flex border-[3px] border-nb-black bg-nb-surface shadow-nb-sm"
          role="group"
          aria-label="Display as"
        >
          {(
            [
              ["chart", ChartColumn, "Chart"],
              ["table", Table2, "Table"],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 font-heading text-[13px] font-bold transition-colors first:border-r-[3px] first:border-nb-black",
                view === key ? "bg-nb-black text-nb-white" : "text-nb-black hover:bg-nb-yellow",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legend">
          {SERIES.map((s) => (
            <li
              key={s}
              className="flex items-center gap-2 font-mono text-[11px] tracking-[0.05em] text-nb-black uppercase"
            >
              <span className={cn("size-3.5 border-2 border-nb-black", verdictMeta[s].fill)} />
              {verdictMeta[s].label}
            </li>
          ))}
        </ul>

        {view === "chart" ? <Chart data={data} /> : <DataTable data={data} />}
      </div>
    </div>
  );
}

function Chart({ data }: { data: DailyActivity[] }) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const width = size?.width ?? 0;
  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = HEIGHT - M.top - M.bottom;
  const max = Math.max(...data.map(total));
  const step = max > 400 ? 100 : 50;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const band = innerW / data.length;
  const barW = Math.min(24, band * 0.62);
  const y = (v: number) => M.top + innerH - (v / top) * innerH;

  const hovered = hover !== null ? data[hover] : null;
  const tipLeft = hover !== null ? M.left + hover * band + band / 2 : 0;
  const flip = tipLeft > width - 180;

  return (
    <div ref={ref} className="relative mt-5 h-[248px] w-full" onPointerLeave={() => setHover(null)}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          className="block"
          role="img"
          aria-label="Stacked column chart of daily verifications by verdict"
        >
          {/* grid + y axis */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={width - M.right}
                y1={y(t)}
                y2={y(t)}
                stroke="#000000"
                strokeOpacity={t === 0 ? 1 : 0.18}
                strokeWidth={t === 0 ? 2.5 : 1.5}
                strokeDasharray={t === 0 ? undefined : "4 4"}
              />
              <text
                x={M.left - 10}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-nb-black font-mono text-[10.5px] tabular-nums"
              >
                {num.format(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const x = M.left + i * band + (band - barW) / 2;
            let acc = 0;
            const visible = SERIES.filter((s) => d[s] > 0);
            const topSeries = visible.at(-1);
            return (
              <g
                key={d.date}
                opacity={hover === null || hover === i ? 1 : 0.45}
                className="transition-opacity duration-200"
              >
                <motion.g
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.03 }}
                  style={{ originY: 1, transformBox: "fill-box" }}
                >
                  {SERIES.map((s, si) => {
                    const v = d[s];
                    if (!v) return null;
                    const y1 = y(acc + v);
                    const y0 = y(acc) - (acc > 0 ? GAP : 0);
                    acc += v;
                    const h = Math.max(0, y0 - y1);
                    return (
                      <rect
                        key={s}
                        x={x}
                        y={y1}
                        width={barW}
                        height={h}
                        fill={verdictMeta[s].hex}
                        stroke="#000000"
                        strokeWidth="2"
                        data-series={si}
                        data-top={s === topSeries || undefined}
                      />
                    );
                  })}
                </motion.g>

                {/* x labels: every other day */}
                {i % 2 === 0 && (
                  <text
                    x={x + barW / 2}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    className="fill-nb-black font-mono text-[10.5px] uppercase"
                  >
                    {dayFmt.format(new Date(d.date))}
                  </text>
                )}

                {/* hit target: the whole band */}
                <rect
                  x={M.left + i * band}
                  y={M.top}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`${longFmt.format(new Date(d.date))}: ${d.authentic} authentic, ${d.unregistered} unregistered, ${d.tampered} tampered`}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="cursor-default outline-none"
                />
              </g>
            );
          })}
        </svg>
      )}

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-[176px] border-[3px] border-nb-black bg-nb-surface p-3 text-[12px] shadow-nb"
          style={{ left: flip ? tipLeft - 168 - 14 : tipLeft + 14 }}
        >
          <p className="font-mono text-[11px] text-nb-black uppercase">
            {longFmt.format(new Date(hovered.date))}
          </p>
          <ul className="mt-2 space-y-1.5">
            {[...SERIES].reverse().map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className="size-3 border-2 border-nb-black"
                  style={{ background: verdictMeta[s].hex }}
                />
                <span className="font-mono font-bold text-nb-black tabular-nums">
                  {num.format(hovered[s])}
                </span>
                <span className="text-nb-black/75">{verdictMeta[s].label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between border-t-2 border-nb-black pt-2 font-heading font-bold text-nb-black">
            Total <span className="font-mono tabular-nums">{num.format(total(hovered))}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function DataTable({ data }: { data: DailyActivity[] }) {
  return (
    <div className="mt-4 max-h-[248px] overflow-auto border-[3px] border-nb-black">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 bg-nb-black text-left font-mono text-[11px] tracking-[0.05em] text-nb-white uppercase">
          <tr>
            <th className="px-3 py-2 font-normal">Date</th>
            {SERIES.map((s) => (
              <th key={s} className="px-3 py-2 text-right font-normal">
                {verdictMeta[s].label}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody className="font-mono text-[12px] tabular-nums">
          {[...data].reverse().map((d) => (
            <tr key={d.date} className="border-t-2 border-nb-black hover:bg-nb-yellow-light">
              <td className="px-3 py-2 font-sans text-[13px] text-nb-black">
                {longFmt.format(new Date(d.date))}
              </td>
              {SERIES.map((s) => (
                <td key={s} className="px-3 py-2 text-right text-nb-black">
                  {num.format(d[s])}
                </td>
              ))}
              <td className="px-3 py-2 text-right font-bold text-nb-black">
                {num.format(total(d))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
