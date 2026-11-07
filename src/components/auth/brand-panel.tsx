"use client";

import { motion, useTransform } from "motion/react";
import { CircleCheck, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Landscape } from "@/components/visuals/landscape";
import { usePointerParallax } from "@/hooks/use-pointer-parallax";

const points = [
  "Fingerprint and register original images",
  "Detect morphing, splicing & generative fill",
  "Proof anchored on World ID, Arkiv & 0G",
];

/** Left-hand brand panel on the sign-in screen: the reference's yellow hero slab with stacked hard-shadow cards. */
export function BrandPanel() {
  const pointer = usePointerParallax();
  const shiftA = useTransform(pointer.x, (v) => v * -14);
  const shiftB = useTransform(pointer.x, (v) => v * 10);

  return (
    <aside className="relative hidden overflow-hidden border-r-4 border-nb-black bg-nb-yellow text-nb-black lg:flex lg:flex-col">
      <div aria-hidden className="absolute inset-0 bg-dots opacity-50" />

      <div className="relative p-10">
        <Logo />
      </div>

      {/* stacked cards */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative h-[340px] w-[300px]">
          <motion.div
            aria-hidden
            style={{ x: shiftA }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="absolute -top-6 -left-16 h-[300px] w-[170px] rotate-[-14deg] border-[3px] border-nb-black bg-nb-pink shadow-nb-lg"
          />
          <motion.div
            aria-hidden
            style={{ x: shiftB }}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute -right-14 bottom-0 h-[260px] w-[150px] rotate-[12deg] border-[3px] border-nb-black bg-nb-blue shadow-nb-lg"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute inset-0 animate-float border-4 border-nb-black bg-nb-surface p-3 shadow-nb-xl"
          >
            <div className="relative h-full overflow-hidden border-[3px] border-nb-black">
              <Landscape variant="aurora" />
              <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 border-[3px] border-nb-black bg-nb-green p-2.5 shadow-nb-sm">
                <span className="grid size-9 place-items-center border-2 border-nb-black bg-nb-black text-nb-green">
                  <ShieldCheck className="size-4.5" />
                </span>
                <span className="leading-tight">
                  <span className="block font-heading text-[14px] font-bold">
                    Authentic · 99.7%
                  </span>
                  <span className="block font-mono text-[10.5px]">ark_7f3a…91c2</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative p-10">
        <h2 className="max-w-md font-display text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.04em] uppercase">
          Every image deserves a{" "}
          <span className="inline-block border-[3px] border-nb-black bg-nb-surface px-2 shadow-nb">
            provable origin.
          </span>
        </h2>
        <ul className="mt-7 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 font-heading text-[15px] font-medium">
              <span className="grid size-5 shrink-0 place-items-center border-2 border-nb-black bg-nb-surface">
                <CircleCheck className="size-3.5" strokeWidth={2.75} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
