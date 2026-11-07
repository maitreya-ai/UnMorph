"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, Copy, Database, ScanSearch, ShieldCheck, ShieldX, X } from "lucide-react";
import { VerdictBadge } from "@/components/dashboard/verdict-badge";
import { Landscape, TAMPER_REGIONS } from "@/components/visuals/landscape";
import { timeAgo, type HistoryEvent, type Verification } from "@/lib/mock-data";
import { cn, formatBytes, truncateMiddle } from "@/lib/utils";

const historyIcon: Record<
  HistoryEvent["type"],
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  registered: Database,
  verified: ShieldCheck,
  "tamper-detected": ShieldX,
  "lookup-miss": ScanSearch,
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function VerificationDrawer({
  item,
  onClose,
}: {
  item: Verification | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          <motion.div
            className="absolute inset-0 bg-nb-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col overflow-hidden border-l-4 border-nb-black bg-nb-bg"
          >
            <header className="flex items-start justify-between gap-4 border-b-4 border-nb-black bg-nb-yellow p-5">
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.1em] text-nb-black uppercase">
                  {item.id} · Integrity report
                </p>
                <h2
                  id="drawer-title"
                  className="mt-1 truncate text-[1.4rem] leading-tight text-nb-black"
                >
                  {item.fileName}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close report"
                className="grid size-10 shrink-0 nb-press-sm place-items-center border-[3px] border-nb-black bg-nb-surface text-nb-black"
              >
                <X className="size-4.5" strokeWidth={2.75} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="relative aspect-[16/10] overflow-hidden border-[3px] border-nb-black shadow-nb">
                <Landscape variant={item.scene} tampered={item.verdict === "tampered"} />
                {item.verdict === "tampered" &&
                  TAMPER_REGIONS.slice(0, Math.min(2, item.alteredRegions)).map((r) => (
                    <span
                      key={r.id}
                      className="absolute nb-tamper"
                      style={{
                        left: `${r.left}%`,
                        top: `${r.top}%`,
                        width: `${r.width}%`,
                        height: `${r.height}%`,
                      }}
                    />
                  ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <VerdictBadge verdict={item.verdict} size="md" />
                <p className="text-right">
                  <span className="block font-mono text-[11px] tracking-[0.1em] text-nb-muted uppercase">
                    Confidence
                  </span>
                  <span className="font-display text-[1.75rem] leading-none font-extrabold text-nb-black">
                    {item.confidence.toFixed(1)}%
                  </span>
                </p>
              </div>

              <dl className="mt-6 divide-y-2 divide-nb-black border-[3px] border-nb-black bg-nb-surface px-4 text-[13px] shadow-nb-sm">
                <Row label="SHA-256" value={item.sha256} mono copy />
                <Row label="Perceptual hash" value={item.perceptualHash} mono />
                <Row label="Arkiv record" value={item.arkivRecord} mono copy />
                <Row label="0G storage root" value={item.storageRoot} mono copy />
                <Row label="Owner" value={item.owner} mono />
                <Row
                  label="Human attestation"
                  value={item.humanVerified ? "World ID verified" : "None"}
                />
                <Row label="Altered regions" value={String(item.alteredRegions)} />
                <Row label="File" value={`${formatBytes(item.sizeBytes)} · ${item.dimensions}`} />
                <Row label="Source" value={item.source} />
              </dl>

              <h3 className="mt-8 font-mono text-[12px] font-normal tracking-[0.15em] text-nb-black uppercase">
                Integrity history
              </h3>
              <ol className="relative mt-4 space-y-5 border-l-[3px] border-nb-black pl-6">
                {item.history.map((event, i) => {
                  const Icon = historyIcon[event.type];
                  return (
                    <li key={i} className="relative">
                      <span
                        className={cn(
                          "absolute top-0 -left-[38px] grid size-6 place-items-center border-2 border-nb-black text-nb-black",
                          event.type === "tamper-detected"
                            ? "bg-nb-pink"
                            : event.type === "lookup-miss"
                              ? "bg-nb-orange"
                              : "bg-nb-green",
                        )}
                      >
                        <Icon className="size-3.5" strokeWidth={2.5} />
                      </span>
                      <p className="font-heading text-[15px] font-bold text-nb-black">
                        {event.label}
                      </p>
                      <p className="font-mono text-[11px] text-nb-muted">
                        {dateFmt.format(new Date(event.at))} UTC · {timeAgo(event.at)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  copy?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="shrink-0 font-mono text-[11px] tracking-[0.05em] text-nb-muted uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "flex min-w-0 items-center gap-1.5 text-right font-medium text-nb-black",
          mono && "font-mono text-[12px]",
        )}
      >
        <span className="truncate">
          {value ? (mono ? truncateMiddle(value, 10, 6) : value) : "—"}
        </span>
        {copy && value && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(value).then(() => setCopied(true))}
            aria-label={`Copy ${label}`}
            className="grid size-6 shrink-0 place-items-center border-2 border-nb-black bg-nb-surface text-nb-black transition-colors hover:bg-nb-yellow"
          >
            {copied ? (
              <CircleCheck className="size-3.5" strokeWidth={2.5} />
            ) : (
              <Copy className="size-3" strokeWidth={2.5} />
            )}
          </button>
        )}
      </dd>
    </div>
  );
}
