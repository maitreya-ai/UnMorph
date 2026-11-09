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
    badge: string;
    soft: string;
  }
> = {
  authentic: {
    label: "Authentic",
    description: "Matches a registered original",
    icon: ShieldCheck,
    fill: "bg-verdict-authentic",
    hex: "#88D498",
    badge: "bg-nb-green text-nb-black",
    soft: "bg-nb-green text-nb-black",
  },
  tampered: {
    label: "Tampered",
    description: "Altered after registration",
    icon: ShieldX,
    fill: "bg-verdict-tampered",
    hex: "#FF6B6B",
    badge: "bg-nb-pink text-nb-black",
    soft: "bg-nb-pink text-nb-black",
  },
  unregistered: {
    label: "Unregistered",
    description: "No registry record found",
    icon: ShieldQuestionMark,
    fill: "bg-verdict-unregistered",
    hex: "#FFA552",
    badge: "bg-nb-orange text-nb-black",
    soft: "bg-nb-orange text-nb-black",
  },
};

/** Status is never colour-alone: icon + label + tint. */
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
        "inline-flex items-center gap-1.5 border-[2px] border-nb-black font-heading font-bold whitespace-nowrap uppercase",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]",
        meta.badge,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
      {meta.label}
    </span>
  );
}
