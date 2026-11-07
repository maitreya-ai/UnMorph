"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useActiveSection } from "@/hooks/use-active-section";
import { useSectionNav } from "@/hooks/use-section-nav";
import { navLinks, sections } from "@/lib/site";
import { cn } from "@/lib/utils";

const SECTION_IDS = sections.map((s) => s.id);

/**
 * Primary navigation, after neubrutalism.com's `.nav`: a sticky white bar with
 * a 4px black rule, Syne wordmark, Space Grotesk links whose active state is a
 * yellow block with a hard shadow, a pink reading-progress strip, and a Space
 * Mono "MENU" toggle that drops a full-width list on small screens.
 */
export function SiteNav({ pageLabel }: { pageLabel?: string }) {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const activeId = useActiveSection(SECTION_IDS, "overview");
  const onSectionClick = useSectionNav();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // Close transient UI when the route is hidden by <Activity> (Next cache components).
  useLayoutEffect(() => () => setMenuOpen(false), []);

  // Dismiss the mobile menu on Escape / outside press.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menuOpen]);

  const handleLink = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      onSectionClick(event, id);
      setMenuOpen(false);
    },
    [onSectionClick],
  );

  const current = onLanding ? activeId : null;

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 border-b-4 border-nb-black bg-nb-surface transition-shadow duration-150",
          scrolled && "shadow-nb-bar",
        )}
      >
        {/* reading progress */}
        <motion.div
          aria-hidden
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 top-0 h-1.5 origin-left bg-nb-pink"
        />

        <nav
          aria-label="Primary"
          data-testid="site-nav"
          className="mx-auto flex h-[68px] max-w-[1300px] items-center gap-3 px-4 sm:px-6"
        >
          <Logo size={30} />
          {pageLabel && (
            <span className="ml-1 hidden border-2 border-nb-black bg-nb-pink px-2 py-0.5 font-mono text-[11px] tracking-[0.05em] text-nb-black uppercase shadow-nb-sm md:inline-block">
              {pageLabel}
            </span>
          )}

          <ul className="ml-auto hidden items-center lg:flex">
            {navLinks.map((link) => {
              const isActive = current === link.id;
              return (
                <li key={link.id}>
                  <Link
                    href={`/#${link.id}`}
                    onClick={(e) => handleLink(e, link.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "block border-2 px-3 py-1.5 font-heading text-[14px] font-medium whitespace-nowrap text-nb-black transition-[background-color,border-color,box-shadow] duration-150",
                      isActive
                        ? "border-nb-black bg-nb-yellow shadow-nb-sm"
                        : "border-transparent hover:border-nb-black hover:bg-nb-yellow hover:shadow-nb-sm",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-2.5 lg:ml-3">
            <Link
              href="/sign-in"
              className="group hidden h-10 nb-press-sm items-center gap-1.5 border-[3px] border-nb-black bg-nb-yellow px-4 font-heading text-[14px] font-bold text-nb-black sm:inline-flex"
            >
              Sign in
              <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className={cn(
                "h-10 border-[3px] border-nb-black px-3 font-mono text-[13px] tracking-[0.05em] uppercase transition-colors lg:hidden",
                menuOpen ? "bg-nb-black text-nb-white" : "bg-nb-surface text-nb-black",
              )}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div
            id="site-menu"
            className="absolute inset-x-0 top-full border-b-4 border-nb-black bg-nb-surface lg:hidden"
          >
            <ul>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={`/#${link.id}`}
                    onClick={(e) => handleLink(e, link.id)}
                    className={cn(
                      "flex items-center justify-between border-b-2 border-nb-black px-5 py-4 font-heading text-[17px] font-bold text-nb-black transition-colors hover:bg-nb-yellow",
                      current === link.id && "bg-nb-yellow",
                    )}
                  >
                    {link.label}
                    <ArrowUpRight className="size-5" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 nb-press items-center justify-center gap-2 border-[3px] border-nb-black bg-nb-yellow font-heading text-[15px] font-bold text-nb-black"
              >
                Sign in <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 nb-press items-center justify-center border-[3px] border-nb-black bg-nb-black font-heading text-[15px] font-bold text-nb-white"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      <BackToTop />
    </>
  );
}

/** Fixed yellow square, bottom-right — appears once you've scrolled a screen. */
function BackToTop() {
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 900));

  if (!visible) return null;
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0 }))}
      className="fixed right-5 bottom-5 z-40 grid size-12 nb-press place-items-center border-[3px] border-nb-black bg-nb-yellow text-nb-black sm:right-8 sm:bottom-8"
    >
      <ArrowUp className="size-5" strokeWidth={2.75} />
    </button>
  );
}
