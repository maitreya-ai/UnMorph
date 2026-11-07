import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** neubrutalism.com `.card`: flat fill, 3px black border, 5px hard shadow. */
const cardVariants = cva("border-[3px] border-nb-black shadow-nb", {
  variants: {
    tone: {
      default: "bg-nb-surface text-nb-black",
      canvas: "bg-nb-bg text-nb-black",
      warm: "bg-nb-bg-warm text-nb-black",
      yellow: "bg-nb-yellow text-nb-black",
      dark: "bg-nb-black text-nb-white",
      green: "bg-nb-green text-nb-black",
      pink: "bg-nb-pink text-nb-black",
      blue: "bg-nb-blue text-nb-black",
      lavender: "bg-nb-lavender text-nb-black",
    },
  },
  defaultVariants: { tone: "default" },
});

export interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

export function Card({ className, tone, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardVariants({ tone }), className)} {...props} />;
}

/** Header strip in the reference's warm stone, separated by a 3px rule. */
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("border-b-[3px] border-nb-black bg-nb-bg-warm px-5 py-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("font-heading text-xl font-bold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("mt-1 text-sm text-nb-muted", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center border-t-[3px] border-nb-black px-5 py-4", className)}
      {...props}
    />
  );
}

export { cardVariants };
