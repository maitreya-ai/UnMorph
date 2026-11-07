"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "motion/react";
import { ChevronsLeftRight, ShieldX } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Landscape, TAMPER_REGIONS } from "@/components/visuals/landscape";
import { cn } from "@/lib/utils";

const metrics = [
  { label: "Fingerprint distance", value: "0.31", hint: "Threshold 0.08", fill: 0.78 },
  { label: "Pixel deviation", value: "4.8%", hint: "Across 2 regions", fill: 0.48 },
  { label: "Noise-pattern consistency", value: "61%", hint: "Expected ≥ 95%", fill: 0.61 },
];

export function DetectionDemo() {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { once: true, amount: 0.5 });
  const raw = useMotionValue(50);
  const pos = useSpring(raw, { stiffness: 320, damping: 38, mass: 0.6 });
  const clip = useMotionTemplate`inset(0 0 0 ${pos}%)`;
  const left = useMotionTemplate`${pos}%`;
  const [value, setValue] = useState(50);
  const [heatmap, setHeatmap] = useState(true);
  const dragging = useRef(false);
  const interacted = useRef(false);
  const sweep = useRef<ReturnType<typeof animate> | null>(null);

  useMotionValueEvent(raw, "change", (v) => setValue(Math.round(v)));

  // A gentle sweep the first time the demo comes into view hints that it's draggable.
  useEffect(() => {
    if (!inView || interacted.current) return;
    sweep.current = animate(raw, [50, 30, 70, 46], {
      duration: 2.6,
      ease: "easeInOut",
      delay: 0.3,
    });
    return () => sweep.current?.stop();
  }, [inView, raw]);

  /** Any user input takes over from the intro sweep immediately. */
  const takeOver = () => {
    interacted.current = true;
    sweep.current?.stop();
  };

  const setFromClientX = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    raw.set(Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <section
      id="detection"
      className="relative border-b-4 border-nb-black bg-nb-green-light px-5 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="03 — Tamper detection"
          title="See exactly what changed."
          description="Drag the divider to compare a registered original with a manipulated copy. UnMorph localizes every alteration and shows the evidence behind each flag."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <Reveal>
            <div
              ref={frameRef}
              className="group relative aspect-[16/11] cursor-ew-resize touch-pan-y overflow-hidden border-4 border-nb-black bg-nb-surface shadow-nb-lg select-none"
              onPointerDown={(e) => {
                takeOver();
                dragging.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                setFromClientX(e.clientX);
              }}
              onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
            >
              {/* original */}
              <div className="absolute inset-0">
                <Landscape variant="glacier" title="Registered original" />
              </div>

              {/* manipulated copy */}
              <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
                <Landscape
                  variant="glacier"
                  tampered
                  title="Submitted copy with manipulated regions"
                />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: heatmap ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {TAMPER_REGIONS.map((r) => (
                    <div
                      key={r.id}
                      className="absolute nb-tamper"
                      style={{
                        left: `${r.left}%`,
                        top: `${r.top}%`,
                        width: `${r.width}%`,
                        height: `${r.height}%`,
                      }}
                    >
                      <span className="absolute -top-8 -left-[5px] border-2 border-nb-black bg-nb-pink px-1.5 py-0.5 font-mono text-[10.5px] whitespace-nowrap text-nb-black uppercase shadow-nb-sm">
                        {r.id} · {r.label} · {r.score}%
                      </span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* labels */}
              <span className="pointer-events-none absolute bottom-4 left-4 border-2 border-nb-black bg-nb-green px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] text-nb-black uppercase shadow-nb-sm">
                Original · registered
              </span>
              <span className="pointer-events-none absolute right-4 bottom-4 border-2 border-nb-black bg-nb-pink px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] text-nb-black uppercase shadow-nb-sm">
                Submitted copy
              </span>

              {/* accessible control */}
              <input
                type="range"
                min={2}
                max={98}
                value={value}
                onFocus={takeOver}
                onChange={(e) => {
                  takeOver();
                  raw.set(Number(e.target.value));
                }}
                aria-label="Comparison divider position"
                className="peer sr-only"
              />

              {/* divider */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1.5 -translate-x-1/2 border-x-2 border-nb-black bg-nb-yellow"
                style={{ left }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center border-[3px] border-nb-black bg-nb-yellow text-nb-black shadow-nb-sm peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-nb-blue peer-focus-visible:outline-solid"
                style={{ left }}
              >
                <ChevronsLeftRight className="size-5" strokeWidth={2.75} />
              </motion.div>
            </div>
          </Reveal>

          {/* report */}
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col border-[3px] border-nb-black bg-nb-surface shadow-nb">
              <div className="flex items-center justify-between gap-4 border-b-[3px] border-nb-black bg-nb-bg-warm px-5 py-3">
                <p className="font-mono text-[11px] tracking-[0.15em] text-nb-black uppercase">
                  Integrity report
                </p>
                <span className="inline-flex items-center gap-1.5 border-2 border-nb-black bg-nb-pink px-2 py-0.5 font-mono text-[11px] tracking-[0.05em] uppercase shadow-nb-sm">
                  <ShieldX className="size-3.5" /> Tampered
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.1em] text-nb-muted uppercase">
                      Verdict
                    </p>
                    <p className="mt-1 font-heading text-[1.75rem] leading-none font-bold tracking-tight">
                      Tampered
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] tracking-[0.1em] text-nb-muted uppercase">
                      Confidence
                    </p>
                    <p className="mt-1 font-display text-[1.9rem] leading-none font-extrabold tracking-tight">
                      96.8%
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {metrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex items-baseline justify-between text-[14px]">
                        <span className="font-medium">{m.label}</span>
                        <span className="font-mono font-bold tabular-nums">{m.value}</span>
                      </div>
                      <div className="mt-2 h-4 overflow-hidden border-2 border-nb-black bg-nb-surface">
                        <motion.div
                          className="h-full border-r-2 border-nb-black bg-nb-pink"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.fill * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        />
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-nb-muted">{m.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t-[3px] border-nb-black pt-5">
                  <p className="font-mono text-[11px] tracking-[0.1em] text-nb-muted uppercase">
                    Altered regions
                  </p>
                  <ul className="mt-3 space-y-2">
                    {TAMPER_REGIONS.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center gap-3 border-2 border-nb-black bg-nb-pink-light px-3 py-2 text-[14px]"
                      >
                        <span className="grid size-6 place-items-center border-2 border-nb-black bg-nb-pink font-mono text-[11px] font-bold">
                          {r.id}
                        </span>
                        <span className="flex-1 font-medium">{r.label}</span>
                        <span className="font-mono font-bold tabular-nums">{r.score}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <label className="mt-auto flex cursor-pointer items-center justify-between gap-3 pt-6 font-heading text-[15px] font-bold">
                  Show tamper heatmap
                  <button
                    type="button"
                    role="switch"
                    aria-checked={heatmap}
                    onClick={() => setHeatmap((h) => !h)}
                    className={cn(
                      "relative h-7 w-14 border-[3px] border-nb-black shadow-nb-sm transition-colors duration-150",
                      heatmap ? "bg-nb-green" : "bg-nb-surface",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-[3px] size-[16px] border-2 border-nb-black bg-nb-black transition-[left] duration-150",
                        heatmap ? "left-[31px]" : "left-[3px]",
                      )}
                    />
                  </button>
                </label>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
