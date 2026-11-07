import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Flat callout: 3px border, heavy 10px left rule, hard shadow, pastel fill. */
const alertVariants = cva(
  "flex w-full items-start gap-3 border-[3px] border-l-[10px] border-nb-black p-4 text-nb-black shadow-nb-sm [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-nb-surface",
        info: "bg-nb-blue-light",
        success: "bg-nb-green-light",
        warning: "bg-nb-orange-light",
        danger: "bg-nb-pink-light",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface AlertProps
  extends React.ComponentProps<"div">, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("font-heading text-[15px] font-bold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm", className)} {...props} />;
}

export { alertVariants };
