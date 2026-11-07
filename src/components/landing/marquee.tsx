const ITEMS = [
  "Register originals",
  "Anchor on Arkiv",
  "Store on 0G",
  "Prove personhood",
  "Verify any copy",
  "Expose morphing",
];

/**
 * neubrutalism.com `.marquee`: a black band of Syne caps separated by yellow
 * squares, scrolling forever (paused on hover, static for reduced motion).
 */
export function Marquee() {
  const run = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span
          key={item}
          className="flex items-center gap-8 pr-8 font-display text-[15px] font-extrabold tracking-[0.05em] whitespace-nowrap uppercase sm:text-base"
        >
          {item}
          <span aria-hidden className="size-2 shrink-0 bg-nb-yellow" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="group overflow-hidden border-b-4 border-nb-black bg-nb-black py-3.5 text-nb-white">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
