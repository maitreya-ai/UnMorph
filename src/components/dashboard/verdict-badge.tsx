import { ShieldCheck, ShieldQuestionMark, ShieldX } from "lucide-react";
import type { Verdict } from "@/lib/verification";
import { cn } from "@/lib/utils";

export const verdictMeta: Record<
  Verdict,
  {
    label: string;
    description: string;
    icon: typeof ShieldCheck;
    /** chart / dot fill */
    fill: string;
    hex: string;
    /** pastel surface for callouts */
    soft: string;
  }
> = {
  authentic: {
    label: "Authentic",
    description: "Matches a registered original",
    icon: ShieldCheck,
    fill: "bg-verdict-authentic",
    hex: "#88D498",
    soft: "bg-nb-green-light",
  },
  tampered: {
    label: "Tampered",
    description: "Altered after registration",
    icon: ShieldX,
    fill: "bg-verdict-tampered",
    hex: "#FF6B6B",
    soft: "bg-nb-pink-light",
  },
  unregistered: {
    label: "Unregistered",
    description: "No registry record found",
    icon: ShieldQuestionMark,
    fill: "bg-verdict-unregistered",
    hex: "#FFA552",
    soft: "bg-nb-orange-light",
  },
};

/** Status is never colour-alone: icon + label + flat fill, in the reference `.badge` style. */
export function VerdictBadge({
  verdict,
  size = "sm",
  className,
}: {
  verdict: Verdict;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = verdictMeta[verdict];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-2 border-nb-black font-mono whitespace-nowrap text-nb-black uppercase",
        size === "sm"
          ? "px-2 py-0.5 text-[11px] tracking-[0.05em]"
          : "px-2.5 py-1 text-[12px] tracking-[0.05em] shadow-nb-sm",
        meta.fill,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}
