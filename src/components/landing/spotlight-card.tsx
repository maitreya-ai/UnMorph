import { cn } from "@/lib/utils";

/**
 * neubrutalism.com `.card`: flat surface, 3px border, 5px hard shadow; on hover
 * it lifts (-2px,-2px) into the 8px shadow. The dark tone takes a pink offset,
 * like the reference's `.btn-demo-dark`, so it still reads on light bands.
 */
export function SpotlightCard({
  className,
  children,
  tone = "light",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "group relative isolate border-[3px] border-nb-black p-6 transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-7",
        tone === "light"
          ? "bg-nb-surface text-nb-black shadow-nb hover:shadow-nb-lg"
          : "bg-nb-black text-nb-white shadow-nb-pink hover:shadow-nb-pink-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
