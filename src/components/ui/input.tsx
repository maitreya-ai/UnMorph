import * as React from "react";
import { cn } from "@/lib/utils";

/** 3px black field on white; focus lifts it into a hard shadow (no glow rings). */
const fieldBase =
  "w-full border-[3px] border-nb-black bg-nb-surface px-4 py-3 font-sans text-[15px] text-nb-black transition-[transform,box-shadow] duration-100 outline-none placeholder:text-nb-muted focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-nb disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} data-slot="input" className={cn(fieldBase, "h-12", className)} {...props} />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea data-slot="textarea" className={cn(fieldBase, "min-h-24", className)} {...props} />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("mb-2 block font-heading text-sm font-bold text-nb-black", className)}
      {...props}
    />
  );
}
