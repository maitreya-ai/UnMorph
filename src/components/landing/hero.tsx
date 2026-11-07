"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import {
  ArrowRight,
  Infinity as InfinityIcon,
  Layers,
  ScanFace,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import { HeroConsole } from "@/components/landing/hero-console";
import { EASE_OUT_EXPO, RevealWords } from "@/components/motion/reveal";
import { usePointerParallax } from "@/hooks/use-pointer-parallax";
import { useSectionNav } from "@/hooks/use-section-nav";
import { cn } from "@/lib/utils";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: EASE_OUT_EXPO, delay },
});

const pillars = [
  { icon: ShieldCheck, label: "Authentic", tone: "bg-nb-green" },
  { icon: Layers, label: "Tamper-proof", tone: "bg-nb-blue" },
  { icon: InfinityIcon, label: "Permanent", tone: "bg-nb-surface" },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const onSectionClick = useSectionNav();
  const pointer = usePointerParallax();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);

  const { scrollYProgress: consoleProgress } = useScroll({
    target: consoleRef,
    offset: ["start end", "start 0.18"],
  });
  const rotateX = useTransform(consoleProgress, [0, 1], [26, 0]);
  const consoleScale = useTransform(consoleProgress, [0, 1], [0.88, 1]);
  const consoleY = useTransform(consoleProgress, [0, 1], [60, 0]);

  return (
    <section
      ref={sectionRef}
      id="overview"
      className="relative isolate overflow-x-clip border-b-4 border-nb-black bg-nb-yellow pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <HeroBackdrop progress={scrollYProgress} pointer={pointer} />

      <motion.div
        style={{ y: textY, opacity: textOpacity, scale: textScale }}
        className="relative mx-auto max-w-5xl px-5 text-center sm:px-6"
      >
        <motion.div {...fadeUp(0.1)} className="flex justify-center">
          <span className="nb-label bg-nb-pink">
            New · Image integrity layer, now in private beta
          </span>
        </motion.div>

        <h1 className="mt-8 text-[clamp(1.45rem,6vw,4.4rem)] leading-[1.06] text-nb-black uppercase">
          <RevealWords text="Prevent morphing." immediate delay={0.2} />
          <br />
          <RevealWords
            text="Prove authenticity."
            immediate
            delay={0.42}
            wordClassName="bg-nb-surface border-[3px] border-nb-black px-2 inline-block shadow-nb"
          />
        </h1>

        <motion.p
          {...fadeUp(0.75)}
          className="mx-auto mt-8 max-w-2xl font-heading text-[1.2rem] leading-[1.45] font-medium text-pretty text-nb-black sm:text-[1.45rem]"
        >
          UnMorph fingerprints original images, anchors that proof on decentralized infrastructure,
          and exposes any manipulation — from subtle retouching to AI-generated alterations.
        </motion.p>

        <motion.div
          {...fadeUp(0.9)}
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
            href="/#how-it-works"
            onClick={(e) => onSectionClick(e, "how-it-works")}
            className="inline-flex h-14 nb-press items-center gap-2 border-[3px] border-nb-black bg-nb-surface px-7 font-heading text-[17px] font-bold text-nb-black"
          >
            See how it works
          </Link>
        </motion.div>

        <motion.ul
          {...fadeUp(1.05)}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {pillars.map(({ icon: Icon, label, tone }) => (
            <li
              key={label}
              className={cn(
                "inline-flex items-center gap-2 border-2 border-nb-black px-3 py-1.5 font-mono text-[12px] tracking-[0.05em] text-nb-black uppercase shadow-nb-sm",
                tone,
              )}
            >
              <Icon className="size-4" strokeWidth={2.5} />
              {label}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* tilting product console */}
      <div
        ref={consoleRef}
        className="relative mx-auto mt-16 max-w-6xl px-4 [perspective:1800px] sm:mt-20 sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.55 }}
        >
          <motion.div
            style={{ rotateX, scale: consoleScale, y: consoleY, transformOrigin: "50% 0%" }}
            className="relative will-change-transform"
          >
            <HeroConsole />
          </motion.div>
        </motion.div>

        <FloatingChips pointer={pointer} progress={consoleProgress} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

type Pointer = { x: MotionValue<number>; y: MotionValue<number> };

function HeroBackdrop({ progress, pointer }: { progress: MotionValue<number>; pointer: Pointer }) {
  const slabA = useTransform(progress, [0, 1], [0, 260]);
  const slabB = useTransform(progress, [0, 1], [0, 160]);
  const slabC = useTransform(progress, [0, 1], [0, 320]);
  const px1 = useTransform(pointer.x, (v) => v * -18);
  const py1 = useTransform(pointer.y, (v) => v * -12);
  const px2 = useTransform(pointer.x, (v) => v * 26);
  const py2 = useTransform(pointer.y, (v) => v * 16);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-dots opacity-50" />

      {/* hard-edged colour slabs — flat fills, black outlines, zero blur */}
      <motion.div style={{ y: slabA }} className="absolute top-24 -left-28 hidden md:block">
        <motion.div
          style={{ x: px1, y: py1 }}
          className="h-[560px] w-[230px] rotate-[-16deg] border-[3px] border-nb-black bg-nb-pink shadow-nb-lg"
        />
      </motion.div>
      <motion.div style={{ y: slabC }} className="absolute top-56 left-16 hidden lg:block">
        <motion.div
          style={{ x: px2, y: py2 }}
          className="h-[300px] w-[120px] rotate-[-16deg] border-[3px] border-nb-black bg-nb-surface shadow-nb-lg"
        />
      </motion.div>
      <motion.div style={{ y: slabB }} className="absolute top-10 -right-24 hidden md:block">
        <motion.div
          style={{ x: px2, y: py1 }}
          className="h-[620px] w-[260px] rotate-[14deg] border-[3px] border-nb-black bg-nb-blue shadow-nb-lg"
        />
      </motion.div>
    </div>
  );
}

function FloatingChips({ pointer, progress }: { pointer: Pointer; progress: MotionValue<number> }) {
  const deep = useTransform(progress, [0, 1], [90, -30]);
  const mid = useTransform(progress, [0, 1], [140, -10]);
  const near = useTransform(progress, [0, 1], [200, 10]);
  const pxA = useTransform(pointer.x, (v) => v * 22);
  const pyA = useTransform(pointer.y, (v) => v * 14);
  const pxB = useTransform(pointer.x, (v) => v * -30);
  const pyB = useTransform(pointer.y, (v) => v * -20);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      <Chip
        style={{ y: deep }}
        inner={{ x: pxA, y: pyA }}
        className="top-[38%] -left-14"
        delay={1.4}
      >
        <span className="grid size-9 place-items-center border-[2px] border-nb-black bg-nb-black text-nb-yellow">
          <ScanFace className="size-4" />
        </span>
        <span>
          <span className="block font-heading text-[13px] font-bold text-nb-black">World ID</span>
          <span className="block text-[11px] text-nb-muted">Verified unique human</span>
        </span>
      </Chip>
      <Chip style={{ y: mid }} inner={{ x: pxB, y: pyB }} className="-top-7 -right-4" delay={1.6}>
        <span className="grid size-9 place-items-center border-[2px] border-nb-black bg-nb-blue text-nb-black">
          <HardDrive className="size-4" />
        </span>
        <span>
          <span className="block font-heading text-[13px] font-bold text-nb-black">0G Storage</span>
          <span className="block font-mono text-[10.5px] text-nb-muted">
            root 0x4be1…09fa · pinned
          </span>
        </span>
      </Chip>
      <Chip
        style={{ y: near }}
        inner={{ x: pxA, y: pyB }}
        className="-bottom-7 left-[24%]"
        delay={1.8}
      >
        <span className="grid size-9 place-items-center border-[2px] border-nb-black bg-nb-green text-nb-black">
          <Layers className="size-4" />
        </span>
        <span>
          <span className="block font-heading text-[13px] font-bold text-nb-black">
            Anchored on Arkiv
          </span>
          <span className="block font-mono text-[10.5px] text-nb-muted">
            0x7a3c…e91f · 12 Oct 2026
          </span>
        </span>
      </Chip>
    </div>
  );
}

function Chip({
  children,
  className,
  style,
  inner,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  style: { y: MotionValue<number> };
  inner: { x: MotionValue<number>; y: MotionValue<number> };
  delay: number;
}) {
  return (
    <motion.div style={style} className={cn("absolute", className)}>
      <motion.div style={inner}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay }}
        >
          <div className="flex animate-float items-center gap-3 border-[3px] border-nb-black bg-nb-surface py-2.5 pr-5 pl-2.5 shadow-nb">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
