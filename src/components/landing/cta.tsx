"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { RevealWords, Reveal } from "@/components/motion/reveal";

/** Closing call to action: the reference's yellow CTA band, loudest type on the page. */
export function CallToAction() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const plateA = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const plateB = useTransform(scrollYProgress, [0, 1], [200, -160]);
  const plateC = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="get-started"
      ref={ref}
      className="relative isolate overflow-hidden border-b-4 border-nb-black bg-nb-yellow px-5 py-24 text-center sm:px-6 sm:py-32"
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-dots opacity-50" />

      {/* flat slabs — the logo's layers, pulled apart */}
      <motion.div
        aria-hidden
        style={{ y: plateA }}
        className="absolute top-10 -left-10 -z-10 hidden h-64 w-36 rotate-[-18deg] border-[3px] border-nb-black bg-nb-pink shadow-nb-lg sm:block"
      />
      <motion.div
        aria-hidden
        style={{ y: plateB }}
        className="absolute top-32 left-24 -z-10 hidden h-44 w-24 rotate-[-18deg] border-[3px] border-nb-black bg-nb-surface shadow-nb-lg md:block"
      />
      <motion.div
        aria-hidden
        style={{ y: plateC }}
        className="absolute -right-12 bottom-0 -z-10 hidden h-72 w-40 rotate-[16deg] border-[3px] border-nb-black bg-nb-blue shadow-nb-lg sm:block"
      />

      <div className="relative mx-auto max-w-4xl">
        <p className="flex justify-center">
          <span className="nb-label">06 — Get started</span>
        </p>
        <h2 className="mx-auto mt-8 font-display text-[clamp(2.1rem,6vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-nb-black uppercase">
          <RevealWords text="Make every image" />
          <br />
          <RevealWords
            text="provable."
            delay={0.2}
            wordClassName="mt-2 border-[3px] border-nb-black bg-nb-surface px-3 shadow-nb"
          />
        </h2>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-8 max-w-xl font-heading text-[1.2rem] leading-[1.5] font-medium text-nb-black">
            Register originals, anchor proof and verify any copy in seconds. Join the private beta
            and bring integrity to every image you publish.
          </p>
        </Reveal>
        <Reveal
          delay={0.35}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/sign-in"
            className="group inline-flex h-14 nb-press items-center gap-2 border-[3px] border-nb-black bg-nb-black px-7 font-heading text-[17px] font-bold text-nb-white"
          >
            Start verifying
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-14 nb-press items-center border-[3px] border-nb-black bg-nb-surface px-7 font-heading text-[17px] font-bold text-nb-black"
          >
            Explore the dashboard
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
