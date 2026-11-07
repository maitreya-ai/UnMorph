import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** neubrutalism.com `.badge`: Space Mono caps, 2px border, 3px shadow, flat fill. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border-2 border-nb-black px-2.5 py-0.5 font-mono text-[11px] leading-5 uppercase tracking-[0.05em] whitespace-nowrap [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-nb-surface text-nb-black",
        dark: "bg-nb-black text-nb-white",
        yellow: "bg-nb-yellow text-nb-black",
        green: "bg-nb-green text-nb-black",
        pink: "bg-nb-pink text-nb-black",
        orange: "bg-nb-orange text-nb-black",
        blue: "bg-nb-blue text-nb-black",
        lavender: "bg-nb-lavender text-nb-black",
      },
      shadow: {
        none: "",
        sm: "shadow-nb-sm",
      },
    },
    defaultVariants: { variant: "default", shadow: "sm" },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, shadow, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, shadow }), className)} {...props} />;
}

export { badgeVariants };
