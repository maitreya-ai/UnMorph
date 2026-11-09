"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, Copy, Database, ScanSearch, ShieldCheck, ShieldX, X } from "lucide-react";
import { VerdictBadge } from "@/components/dashboard/verdict-badge";
import { Landscape, TAMPER_REGIONS } from "@/components/visuals/landscape";
import { timeAgo, type HistoryEvent, type Verification } from "@/lib/mock-data";
import { cn, formatBytes, truncateMiddle } from "@/lib/utils";

const historyIcon: Record<HistoryEvent["type"], React.ComponentType<{ className?: string }>> = {
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
            className="absolute inset-0 bg-nb-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col overflow-hidden border-l-[3px] border-nb-black bg-nb-surface shadow-nb-xl sm:inset-y-3 sm:right-3 sm:border-[3px]"
          >
            <header className="flex items-start justify-between gap-4 border-b-[3px] border-nb-black p-5">
              <div className="min-w-0">
                <p className="text-[12px] text-nb-muted">{item.id} · Integrity report</p>
                <h2
                  id="drawer-title"
                  className="mt-0.5 truncate font-display text-lg font-extrabold tracking-tight text-nb-black uppercase"
                >
                  {item.fileName}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close report"
                className="nb-press-sm grid size-9 shrink-0 place-items-center border-[2px] border-nb-black text-nb-black"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="relative aspect-[16/10] overflow-hidden border-[3px] border-nb-black">
                <Landscape variant={item.scene} tampered={item.verdict === "tampered"} />
                {item.verdict === "tampered" &&
                  TAMPER_REGIONS.slice(0, Math.min(2, item.alteredRegions)).map((r) => (
                    <span
                      key={r.id}
                      className="absolute border-[3px] border-nb-black bg-verdict-tampered/25"
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
                  <span className="block text-[12px] text-nb-muted">Confidence</span>
                  <span className="font-display text-xl font-extrabold text-nb-black">
                    {item.confidence.toFixed(1)}%
                  </span>
                </p>
              </div>

              <dl className="mt-5 divide-y-[2px] divide-nb-black border-[2px] border-nb-black bg-nb-bg px-4 text-[13px]">
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

              <h3 className="mt-6 font-display text-[14px] font-extrabold text-nb-black uppercase">
                Integrity history
              </h3>
              <ol className="relative mt-3 space-y-4 border-l-[2px] border-nb-black pl-5">
                {item.history.map((event, i) => {
                  const Icon = historyIcon[event.type];
                  return (
                    <li key={i} className="relative">
                      <span
                        className={cn(
                          "absolute top-0.5 -left-[31px] grid size-5 place-items-center border-[2px] border-nb-black",
                          event.type === "tamper-detected"
                            ? "bg-nb-pink text-nb-black"
                            : event.type === "lookup-miss"
                              ? "bg-nb-orange text-nb-black"
                              : "bg-nb-green text-nb-black",
                        )}
                      >
                        <Icon className="size-3" />
                      </span>
                      <p className="text-[13px] font-bold text-nb-black">{event.label}</p>
                      <p className="text-[12px] text-nb-muted">
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
      <dt className="shrink-0 text-nb-muted">{label}</dt>
      <dd
        className={cn(
          "flex min-w-0 items-center gap-1.5 text-right font-bold text-nb-black",
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
            className="shrink-0 text-nb-muted hover:text-nb-black"
          >
            {copied ? <CircleCheck className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        )}
      </dd>
    </div>
  );
}
