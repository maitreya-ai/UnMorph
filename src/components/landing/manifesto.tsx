"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const TEXT =
  "Generative AI made it effortless to alter a photograph. Faces swap, evidence shifts, documents bend — and nobody can tell. UnMorph gives every original a verifiable fingerprint, so any change, however subtle, leaves a trace.";

const HIGHLIGHT = new Set(["verifiable", "fingerprint,", "leaves", "a", "trace."]);
const HIGHLIGHT_FROM = TEXT.split(" ").indexOf("verifiable");

/** Scroll-scrubbed statement: words ink in as the reader moves through. */
export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = TEXT.split(" ");

  return (
    <section
      aria-label="Why UnMorph"
      className="relative border-b-4 border-nb-black bg-nb-pink-light px-5 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-8 flex">
          <span className="nb-label">01 — Why it matters</span>
        </p>
        <p
          ref={ref}
          className="font-heading text-[clamp(1.65rem,3.9vw,3rem)] leading-[1.25] font-bold tracking-[-0.02em] text-nb-black"
        >
          <span className="sr-only">{TEXT}</span>
          <span aria-hidden>
            {words.map((word, i) => (
              <Word
                key={`${word}-${i}`}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
                highlight={i >= HIGHLIGHT_FROM && HIGHLIGHT.has(word)}
              >
                {word}
              </Word>
            ))}
          </span>
        </p>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  highlight,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlight: boolean;
}) {
  const opacity = useTransform(progress, range, [0.13, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <>
      <motion.span
        style={{ opacity, y }}
        className={
          highlight
            ? "mb-1.5 inline-block border-[3px] border-nb-black bg-nb-yellow px-2 shadow-nb-sm"
            : "inline-block"
        }
      >
        {children}
      </motion.span>{" "}
    </>
  );
}
