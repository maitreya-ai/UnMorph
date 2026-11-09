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
    <main className="relative isolate flex min-h-screen flex-col items-center overflow-hidden px-5 pt-32 pb-20 sm:pt-36">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-radial opacity-70" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="w-full max-w-3xl"
      >
        <MorphedNumber />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        className="mt-6 max-w-xl text-center"
      >
        <h1 className="font-display text-[clamp(1.75rem,4vw,2.6rem)] leading-tight font-extrabold tracking-[-0.035em] text-nb-black uppercase">
          This page didn&apos;t pass verification.
        </h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-nb-muted">
          We couldn&apos;t find a registered record for this URL. It may have been moved, renamed —
          or it never existed.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="nb-press group inline-flex h-12 items-center gap-2 border-[3px] border-nb-black bg-nb-yellow px-6 font-heading text-[14px] font-bold text-nb-black uppercase"
          >
            <House className="size-4" />
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="nb-press group inline-flex h-12 items-center gap-2 border-[3px] border-nb-black bg-nb-surface px-6 font-heading text-[14px] font-bold text-nb-black uppercase"
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
        transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
        className="mt-14 grid w-full max-w-3xl gap-4 md:grid-cols-[1.1fr_1fr]"
      >
        <div className="border-[3px] border-nb-black bg-nb-surface p-5 shadow-nb">
          <div className="flex items-center justify-between">
            <p className="font-display text-[14px] font-extrabold text-nb-black uppercase">
              Integrity report
            </p>
            <span className="inline-flex items-center gap-1.5 border-[2px] border-nb-black bg-nb-pink px-2.5 py-0.5 font-heading text-[11px] font-bold text-nb-black uppercase">
              <ShieldX className="size-3.5" /> Not found
            </span>
          </div>
          <dl className="mt-4 divide-y-[2px] divide-nb-black text-[13px]">
            <ReportRow label="Requested path" value={path ?? "…"} mono />
            <ReportRow label="Registry" value={notFoundReport.registry} />
            <ReportRow label="Lookup" value={notFoundReport.lookup} />
            <ReportRow label="Fingerprint" value={notFoundReport.fingerprint} />
            <ReportRow label="Status" value={notFoundReport.status} />
          </dl>
        </div>

        <nav
          aria-label="Suggested pages"
          className="border-[3px] border-nb-black bg-nb-surface p-5 shadow-nb"
        >
          <p className="font-display text-[14px] font-extrabold text-nb-black uppercase">
            Verified destinations
          </p>
          <ul className="mt-3 space-y-1">
            {notFoundReport.suggestions.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="group flex items-center justify-between border-[2px] border-transparent px-3 py-2.5 transition-colors hover:border-nb-black hover:bg-nb-yellow/15"
                >
                  <span>
                    <span className="block text-[13.5px] font-bold text-nb-black">{s.label}</span>
                    <span className="block text-[12px] text-nb-muted">{s.hint}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-nb-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-nb-black" />
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
      <dt className="shrink-0 text-nb-muted">{label}</dt>
      <dd
        className={
          mono
            ? "truncate font-mono text-[12px] font-bold text-nb-black"
            : "truncate font-bold text-nb-black"
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
          fill="#000000"
          className="font-display"
          style={{ fontSize: 230, fontWeight: 800, letterSpacing: "-0.06em" }}
        >
          404
        </text>
      </g>
      <g clipPath={`url(#${id("right")})`} filter={`url(#${id("pixelate")})`}>
        <text
          x="300"
          y="200"
          textAnchor="middle"
          fill="#FFD23F"
          className="font-display"
          style={{ fontSize: 230, fontWeight: 800, letterSpacing: "-0.06em" }}
        >
          404
        </text>
      </g>

      {/* scan divider */}
      <motion.g style={{ x: split }}>
        <line x1="0" x2="0" y1="6" y2="234" stroke="#000000" strokeWidth="3" />
      </motion.g>
      <motion.g style={{ x: labelX }}>
        <rect x="0" y="0" width="128" height="24" fill="#000000" stroke="#FFD23F" strokeWidth="2" />
        <text
          x="64"
          y="16"
          textAnchor="middle"
          fill="#FFFFFF"
          style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em" }}
        >
          INTEGRITY CHECK FAILED
        </text>
      </motion.g>
    </svg>
  );
}
