import { Reveal, RevealWords } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

/**
 * neubrutalism.com section opener: a Space Mono `.section-label` chip, a
 * Space Grotesk 700 heading (sentence case, tight tracking) and a calm intro.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
}: SectionHeadingProps) {
  const center = align === "center";
  return (
    <div className={cn(center && "mx-auto text-center", "max-w-3xl", className)}>
      <Reveal y={12}>
        <p className={cn("flex", center && "justify-center")}>
          <span className={cn("nb-label", tone === "dark" && "shadow-nb-inverse-sm")}>
            {eyebrow}
          </span>
        </p>
      </Reveal>
      <h2
        className={cn(
          "mt-6 text-[clamp(2.1rem,5vw,3.5rem)] leading-[1.05]",
          tone === "light" ? "text-nb-black" : "text-nb-white",
        )}
      >
        <RevealWords text={title} />
      </h2>
      {description && (
        <Reveal delay={0.15}>
          <p
            className={cn(
              "mt-5 text-[1.125rem] leading-[1.65] text-pretty sm:text-[1.25rem]",
              center && "mx-auto max-w-2xl",
              tone === "light" ? "text-nb-black" : "text-nb-white/85",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
