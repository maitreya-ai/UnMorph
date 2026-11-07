"use client";

import Link from "next/link";
import { useEffect, useId, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, House, ShieldX } from "lucide-react";
import { notFoundReport } from "@/lib/mock-data";

const EASE = [0.16, 1, 0.3, 1] as const;
const subscribeNoop = () => () => {};

export function NotFoundView() {
  const path = useSyncExternalStore(
    subscribeNoop,
    () => window.location.pathname,
    () => null,
  );

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center overflow-hidden bg-nb-pink-light px-5 pt-14 pb-20 sm:pt-20">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-70" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="w-full max-w-3xl"
      >
        <MorphedNumber />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        className="mt-6 max-w-xl text-center"
      >
        <h1 className="font-heading text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08] font-bold tracking-[-0.02em] text-nb-black">
          This page didn&apos;t pass verification.
        </h1>
        <p className="mt-4 text-[1.125rem] leading-relaxed text-nb-black/80">
          We couldn&apos;t find a registered record for this URL. It may have been moved, renamed —
          or it never existed.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex h-13 nb-press items-center gap-2 border-[3px] border-nb-black bg-nb-black px-6 font-heading text-[16px] font-bold text-nb-white"
          >
            <House className="size-4" />
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="group inline-flex h-13 nb-press items-center gap-2 border-[3px] border-nb-black bg-nb-yellow px-6 font-heading text-[16px] font-bold text-nb-black"
          >
            Open dashboard
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>

      <motion.section
        aria-label="Integrity report for this URL"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
        className="mt-14 grid w-full max-w-3xl gap-6 md:grid-cols-[1.1fr_1fr]"
      >
        <div className="border-[3px] border-nb-black bg-nb-surface shadow-nb">
          <div className="flex items-center justify-between border-b-[3px] border-nb-black bg-nb-bg-warm px-5 py-3">
            <p className="font-mono text-[11px] tracking-[0.15em] text-nb-black uppercase">
              Integrity report
            </p>
            <span className="inline-flex items-center gap-1.5 border-2 border-nb-black bg-nb-pink px-2 py-0.5 font-mono text-[11px] text-nb-black uppercase shadow-nb-sm">
              <ShieldX className="size-3.5" /> Not found
            </span>
          </div>
          <dl className="divide-y-2 divide-nb-black px-5 text-[13px]">
            <ReportRow label="Requested path" value={path ?? "…"} mono />
            <ReportRow label="Registry" value={notFoundReport.registry} />
            <ReportRow label="Lookup" value={notFoundReport.lookup} />
            <ReportRow label="Fingerprint" value={notFoundReport.fingerprint} />
            <ReportRow label="Status" value={notFoundReport.status} />
          </dl>
        </div>

        <nav
          aria-label="Suggested pages"
          className="border-[3px] border-nb-black bg-nb-surface shadow-nb"
        >
          <p className="border-b-[3px] border-nb-black bg-nb-bg-warm px-5 py-3 font-mono text-[11px] tracking-[0.15em] text-nb-black uppercase">
            Verified destinations
          </p>
          <ul>
            {notFoundReport.suggestions.map((s) => (
              <li key={s.href} className="border-b-2 border-nb-black last:border-b-0">
                <Link
                  href={s.href}
                  className="group flex items-center justify-between px-5 py-3 transition-colors hover:bg-nb-yellow"
                >
                  <span>
                    <span className="block font-heading text-[15px] font-bold text-nb-black">
                      {s.label}
                    </span>
                    <span className="block text-[12.5px] text-nb-black/70">{s.hint}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4.5 text-nb-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </motion.section>
    </main>
  );
}

function ReportRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="shrink-0 font-mono text-[11px] tracking-[0.05em] text-nb-muted uppercase">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "truncate font-mono text-[12px] font-bold text-nb-black"
            : "truncate font-medium text-nb-black"
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** "404" — crisp on the left, pixel-morphed on the right, split by a sweeping integrity scan. */
function MorphedNumber() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const reduce = useReducedMotion();
  const split = useMotionValue(300);
  const rest = useTransform(split, (v) => 600 - v);
  const labelX = useTransform(split, (v) => v - 64);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(split, [300, 230, 380, 300], {
      duration: 7,
      ease: "easeInOut",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [reduce, split]);

  return (
    <svg viewBox="0 0 600 240" className="w-full" role="img" aria-label="404">
      <defs>
        <filter
          id={id("pixelate")}
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="600"
          height="240"
        >
          <feFlood x="5" y="5" height="2" width="2" />
          <feComposite width="12" height="12" />
          <feTile result="tiles" />
          <feComposite in="SourceGraphic" in2="tiles" operator="in" />
          <feMorphology operator="dilate" radius="6" />
        </filter>
        <clipPath id={id("left")}>
          <motion.rect x="0" y="0" height="240" style={{ width: split }} />
        </clipPath>
        <clipPath id={id("right")}>
          <motion.rect y="0" height="240" style={{ x: split, width: rest }} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id("left")})`}>
        <text
          x="300"
          y="200"
          textAnchor="middle"
          className="font-display"
          style={{ fontSize: 210, fontWeight: 800, letterSpacing: "-0.04em" }}
        >
          <tspan x="310" dy="10" fill="#000000">
            404
          </tspan>
          <tspan
            x="300"
            dy="-10"
            fill="#FFD23F"
            stroke="#000000"
            strokeWidth="6"
            paintOrder="stroke"
          >
            404
          </tspan>
        </text>
      </g>
      <g clipPath={`url(#${id("right")})`} filter={`url(#${id("pixelate")})`}>
        <text
          x="300"
          y="200"
          textAnchor="middle"
          className="font-display"
          style={{ fontSize: 210, fontWeight: 800, letterSpacing: "-0.04em" }}
        >
          <tspan x="310" dy="10" fill="#000000">
            404
          </tspan>
          <tspan
            x="300"
            dy="-10"
            fill="#FFD23F"
            stroke="#000000"
            strokeWidth="6"
            paintOrder="stroke"
          >
            404
          </tspan>
        </text>
      </g>

      {/* scan divider */}
      <motion.g style={{ x: split }}>
        <rect
          x="-4"
          y="6"
          width="8"
          height="228"
          fill="#FFD23F"
          stroke="#000000"
          strokeWidth="2.5"
        />
      </motion.g>
      <motion.g style={{ x: labelX }}>
        <rect x="3" y="3" width="128" height="24" fill="#000000" />
        <rect
          x="0"
          y="0"
          width="128"
          height="24"
          fill="#FF6B6B"
          stroke="#000000"
          strokeWidth="2.5"
        />
        <text
          x="64"
          y="16"
          textAnchor="middle"
          fill="#000000"
          className="font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.05em" }}
        >
          Check failed
        </text>
      </motion.g>
    </svg>
  );
}
