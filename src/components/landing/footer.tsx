"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Logo } from "@/components/brand/logo";
import { useSectionNav } from "@/hooks/use-section-nav";
import { navLinks, site } from "@/lib/site";

const appLinks = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/dashboard", label: "Dashboard" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const linkClass =
  "text-[15px] text-nb-yellow underline decoration-2 underline-offset-4 transition-colors hover:bg-nb-yellow hover:text-nb-black";

/** neubrutalism.com footer: black slab, Syne wordmark, Space Mono column heads, yellow links. */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const onSectionClick = useSectionNav();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const wordY = useTransform(scrollYProgress, [0, 1], ["45%", "0%"]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-nb-black text-nb-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-20 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-nb-white/75">
            The image integrity layer. Prevent morphing, prove authenticity — on infrastructure no
            one can quietly rewrite.
          </p>
        </div>

        <nav aria-label="Footer — product">
          <p className="font-mono text-[12px] tracking-[0.15em] text-nb-white uppercase">Product</p>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={`/#${link.id}`}
                  onClick={(e) => onSectionClick(e, link.id)}
                  className={linkClass}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer — app">
          <p className="font-mono text-[12px] tracking-[0.15em] text-nb-white uppercase">App</p>
          <ul className="mt-4 space-y-2.5">
            {appLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={site.repo} target="_blank" rel="noreferrer" className={linkClass}>
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-3 border-t-2 border-nb-white/25 px-5 pt-6 font-mono text-[12px] text-nb-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© 2026 UnMorph — border: 3px solid #000; box-shadow: 5px 5px 0 #000;</p>
        <ul className="flex gap-5">
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-nb-yellow">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <motion.p
        aria-hidden
        style={{ y: wordY }}
        className="pointer-events-none mt-10 text-center font-display text-[clamp(2.5rem,12.2vw,12rem)] leading-[0.82] font-extrabold tracking-[-0.04em] whitespace-nowrap text-transparent uppercase select-none [-webkit-text-stroke:3px_#FFD23F]"
      >
        UnMorph
      </motion.p>
    </footer>
  );
}
