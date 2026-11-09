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

/** Left-hand brand panel on the sign-in screen: floating, layered hard-edged plates. */
export function BrandPanel() {
  const pointer = usePointerParallax();
  const rotateY = useTransform(pointer.x, (v) => v * 8);
  const rotateX = useTransform(pointer.y, (v) => v * -6);
  const shiftA = useTransform(pointer.x, (v) => v * -14);
  const shiftB = useTransform(pointer.x, (v) => v * 10);

  return (
    <aside className="relative m-3 hidden overflow-hidden border-[3px] border-nb-black bg-nb-black text-nb-bg lg:flex lg:flex-col">
      <div aria-hidden className="absolute inset-0 bg-grid-dark mask-radial" />

      <div className="relative p-10">
        <Logo tone="light" />
      </div>

      {/* floating plate stack */}
      <div className="relative flex flex-1 items-center justify-center [perspective:1400px]">
        <motion.div
          style={{ rotateX, rotateY }}
          className="relative h-[340px] w-[300px] [transform-style:preserve-3d]"
        >
          <motion.div
            aria-hidden
            style={{ x: shiftA }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="absolute -top-6 -left-16 h-[300px] w-[170px] rotate-[-14deg] border-[3px] border-nb-bg bg-nb-blue"
          />
          <motion.div
            aria-hidden
            style={{ x: shiftB }}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute -right-14 bottom-0 h-[260px] w-[150px] rotate-[12deg] border-[3px] border-nb-bg bg-nb-lavender"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute inset-0 animate-float border-[3px] border-nb-black bg-nb-surface p-3 shadow-nb-xl"
          >
            <div className="relative h-full overflow-hidden border-[2px] border-nb-black">
              <Landscape variant="aurora" />
              <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 border-[2px] border-nb-black bg-nb-surface p-3 text-nb-black">
                <span className="grid size-9 place-items-center border-[2px] border-nb-black bg-nb-green text-nb-black">
                  <ShieldCheck className="size-4.5" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] font-bold">Authentic · 99.7%</span>
                  <span className="block font-mono text-[10.5px] text-nb-muted">
                    ark_7f3a…91c2
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative p-10">
        <h2 className="max-w-md font-display text-[2rem] leading-[1.08] font-extrabold tracking-[-0.035em] uppercase">
          Every image deserves a <span className="bg-nb-yellow px-1.5 text-nb-black">provable origin.</span>
        </h2>
        <ul className="mt-6 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[14.5px] text-nb-bg/80">
              <CircleCheck className="size-4 text-nb-green" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
