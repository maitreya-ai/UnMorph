import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Neubrutalist button (neubrutalism.com `.btn`): Space Grotesk 700, 3px black
 * border, 5px hard shadow; lifts on hover, presses flat on click.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 border-[3px] border-nb-black font-heading font-bold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-nb-yellow text-nb-black",
        primary: "bg-nb-black text-nb-white",
        secondary: "bg-nb-surface text-nb-black",
        danger: "bg-nb-pink text-nb-black",
        success: "bg-nb-green text-nb-black",
        info: "bg-nb-blue text-nb-black",
        ghost:
          "border-transparent bg-transparent text-nb-black transition-colors hover:border-nb-black hover:bg-nb-yellow",
      },
      size: {
        sm: "nb-press-sm h-9 px-4 text-sm",
        default: "nb-press h-12 px-6 text-base",
        lg: "nb-press h-14 px-8 text-lg",
        icon: "nb-press-sm size-10",
      },
    },
    compoundVariants: [{ variant: "ghost", className: "shadow-none hover:shadow-none" }],
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
