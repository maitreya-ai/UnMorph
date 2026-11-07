import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * The UnMorph mark, redrawn flat: a yellow shield carrying the "U", the raised
 * centre bar from the original layered mark, a 3px black outline and a hard
 * offset shadow. Aspect 0.9.
 */
export function LogoMark({ size = 28, className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 45 50"
      width={Math.round(size * 0.9)}
      height={size}
      aria-hidden
      className={cn("shrink-0 select-none", className)}
    >
      <path d="M6 6 H42 V32 L24 48 L6 32 Z" fill="#000000" />
      <path d="M3 3 H39 V29 L21 45 L3 29 Z" fill="#FFD23F" stroke="#000000" strokeWidth="3" />
      <rect
        x="16.5"
        y="1.5"
        width="9"
        height="22.5"
        fill="#FF6B6B"
        stroke="#000000"
        strokeWidth="3"
      />
      <path
        d="M11 12 V28 L21 37 L31 28 V12"
        fill="none"
        stroke="#000000"
        strokeWidth="4.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

type LogoProps = {
  href?: string;
  size?: number;
  tone?: "dark" | "light";
  className?: string;
};

/** Mark + wordmark lock-up: Syne 800 caps with a pink full stop, like the reference. */
export function Logo({ href = "/", size = 28, tone = "dark", className }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="UnMorph home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <LogoMark
        size={size}
        className="transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
      />
      <span
        className={cn(
          "font-display text-[1.3rem] leading-none font-extrabold tracking-[-0.03em] uppercase",
          tone === "dark" ? "text-nb-black" : "text-nb-white",
        )}
      >
        UnMorph<span className="text-nb-pink">.</span>
      </span>
    </Link>
  );
}
