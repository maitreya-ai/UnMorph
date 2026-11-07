"use client";

import { motion } from "motion/react";
import {
  CircleCheck,
  CodeXml,
  Database,
  FingerprintPattern,
  HardDrive,
  ScanFace,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { recentVerifications, seededHex } from "@/lib/mock-data";
import { cn, truncateMiddle } from "@/lib/utils";

export function Infrastructure() {
  return (
    <section
      id="infrastructure"
      className="relative border-b-4 border-nb-black bg-nb-lavender-light px-5 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="04 — Infrastructure"
          title="Trust that no single party controls."
          description="UnMorph composes three open networks into one integrity layer — so proof outlives any company, server or policy change, including ours."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-6">
          <Reveal className="lg:col-span-3">
            <SpotlightCard tone="dark" className="h-full min-h-[380px]">
              <CardHeader
                icon={ScanFace}
                name="World ID"
                title="Proof of human, not identity."
                body="Registrations can require a privacy-preserving proof that a unique human is behind them — no names, no documents, no tracking."
                dark
              />
              <Parallax speed={0.06} className="relative mt-6 h-44">
                <PersonhoodOrb />
              </Parallax>
            </SpotlightCard>
          </Reveal>

          <Reveal className="lg:col-span-3" delay={0.08}>
            <SpotlightCard className="h-full min-h-[380px]">
              <CardHeader
                icon={Database}
                name="Arkiv"
                title="Integrity records you own."
                body="Fingerprints, ownership references and verification history live in wallet-owned, queryable records — portable and independently auditable."
              />
              <RecordTicker />
            </SpotlightCard>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={0.04}>
            <SpotlightCard className="h-full">
              <CardHeader
                icon={HardDrive}
                name="0G"
                title="Decentralized storage & compute."
                body="Originals and evidence bundles are stored on 0G; tamper models run on its decentralized compute."
              />
              <NodeMesh />
            </SpotlightCard>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={0.1}>
            <SpotlightCard className="h-full">
              <CardHeader
                icon={FingerprintPattern}
                name="Fingerprints"
                title="Two hashes, one verdict."
                body="SHA-256 proves byte-level identity. A perceptual hash recognises the image through resizing, recompression and screenshots."
              />
              <HashCompare />
            </SpotlightCard>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={0.16}>
            <SpotlightCard className="h-full">
              <CardHeader
                icon={CodeXml}
                name="API"
                title="Verify from anywhere."
                body="One call returns the verdict, confidence, regions and the on-chain record behind them."
              />
              <CodeSnippet />
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function CardHeader({
  icon: Icon,
  name,
  title,
  body,
  dark,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  name: string;
  title: string;
  body: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "inline-flex items-center gap-2 border-2 border-nb-black px-2.5 py-1 font-mono text-[11px] tracking-[0.1em] uppercase",
          dark ? "bg-nb-yellow text-nb-black" : "bg-nb-lavender text-nb-black shadow-nb-sm",
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.25} />
        {name}
      </p>
      <h3
        className={cn("mt-5 text-[1.5rem] leading-tight", dark ? "text-nb-white" : "text-nb-black")}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 text-[15px] leading-relaxed",
          dark ? "text-nb-white/80" : "text-nb-black/80",
        )}
      >
        {body}
      </p>
    </div>
  );
}

function PersonhoodOrb() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute size-20 border-[3px] border-nb-yellow"
          animate={{ scale: [1, 2.4], opacity: [1, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "linear", delay: i * 1.2 }}
        />
      ))}
      <div className="relative grid size-20 place-items-center border-[3px] border-nb-white bg-nb-yellow text-nb-black shadow-nb-inverse">
        <ScanFace className="size-9" strokeWidth={2} />
      </div>
      <span className="absolute top-2 left-[6%] inline-flex items-center gap-1.5 border-2 border-nb-black bg-nb-surface px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] text-nb-black uppercase">
        <CircleCheck className="size-3.5" /> Unique human
      </span>
      <span className="absolute right-[6%] bottom-2 inline-flex items-center gap-1.5 border-2 border-nb-black bg-nb-green px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] text-nb-black uppercase">
        <CircleCheck className="size-3.5" /> Zero personal data
      </span>
    </div>
  );
}

const verdictDot: Record<string, string> = {
  authentic: "bg-verdict-authentic",
  tampered: "bg-verdict-tampered",
  unregistered: "bg-verdict-unregistered",
};

function RecordTicker() {
  const rows = recentVerifications.filter((v) => v.arkivRecord);
  const loop = [...rows, ...rows];
  return (
    <div
      className="relative mt-6 h-44 overflow-hidden border-[3px] border-nb-black bg-nb-bg-warm p-2"
      aria-hidden
    >
      <ul className="animate-marquee-y space-y-2 group-hover:[animation-play-state:paused]">
        {loop.map((row, i) => (
          <li
            key={`${row.id}-${i}`}
            className="flex items-center gap-3 border-2 border-nb-black bg-nb-surface px-3 py-2 text-[12px]"
          >
            <span
              className={cn("size-3 shrink-0 border-2 border-nb-black", verdictDot[row.verdict])}
            />
            <span className="font-mono text-nb-black">
              {truncateMiddle(row.arkivRecord ?? "", 10, 4)}
            </span>
            <span className="ml-auto truncate text-nb-muted">{row.fileName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const NODES = [
  [30, 40],
  [90, 20],
  [150, 52],
  [210, 24],
  [262, 60],
  [60, 100],
  [128, 112],
  [196, 104],
  [250, 128],
  [24, 150],
  [104, 160],
  [176, 158],
] as const;
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [2, 6],
  [3, 7],
  [5, 9],
  [9, 10],
  [10, 11],
  [6, 10],
  [7, 11],
  [4, 8],
] as const;

/** Storage mesh: square nodes, 2px black links, pink packets on a few routes. */
function NodeMesh() {
  return (
    <svg viewBox="0 0 290 180" className="mt-5 h-40 w-full" aria-hidden>
      {EDGES.map(([a, b], i) => (
        <g key={i}>
          <line
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
            stroke="#000000"
            strokeWidth="2"
          />
          {i % 3 === 0 && (
            <line
              x1={NODES[a][0]}
              y1={NODES[a][1]}
              x2={NODES[b][0]}
              y2={NODES[b][1]}
              stroke="#FF6B6B"
              strokeWidth="5"
              strokeDasharray="8 32"
              className="animate-dash"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          )}
        </g>
      ))}
      {NODES.map(([x, y], i) => {
        const key = i % 4 === 0;
        const r = key ? 8 : 5.5;
        return (
          <rect
            key={i}
            x={x - r}
            y={y - r}
            width={r * 2}
            height={r * 2}
            fill={key ? "#FFD23F" : "#FFFFFF"}
            stroke="#000000"
            strokeWidth="2.5"
          />
        );
      })}
    </svg>
  );
}

const PH_A = seededHex(501, 16);
const SHA_A = seededHex(502, 40);

function HashCompare() {
  return (
    <div className="mt-6 space-y-3 font-mono text-[11px]">
      <div className="border-2 border-nb-black bg-nb-bg-warm p-3">
        <p className="flex items-center justify-between text-[10.5px] tracking-[0.1em] text-nb-black uppercase">
          Perceptual
          <span className="border-2 border-nb-black bg-nb-green px-1.5 tracking-[0.05em]">
            survives edits
          </span>
        </p>
        <p className="mt-1.5 text-nb-black">{PH_A}</p>
      </div>
      <div className="border-2 border-nb-black bg-nb-bg-warm p-3">
        <p className="flex items-center justify-between text-[10.5px] tracking-[0.1em] text-nb-black uppercase">
          SHA-256
          <span className="border-2 border-nb-black bg-nb-blue px-1.5 tracking-[0.05em]">
            exact bytes
          </span>
        </p>
        <p className="mt-1.5 truncate text-nb-black">{SHA_A}</p>
      </div>
    </div>
  );
}

/** `.code-block`: midnight panel with the reference's syntax colours. */
function CodeSnippet() {
  return (
    <pre className="mt-6 overflow-x-auto p-4 nb-code text-[11.5px] leading-relaxed">
      <span className="text-nb-pink">const</span> report ={" "}
      <span className="text-nb-pink">await</span> unmorph
      {"\n  "}.<span className="text-nb-cyan">verify</span>(file)
      {"\n\n"}report.<span className="text-nb-cyan">verdict</span>
      {"     "}
      <span className="text-nb-code-fg/45">{"// "}</span>
      <span className="text-nb-green">&quot;authentic&quot;</span>
      {"\n"}report.<span className="text-nb-cyan">confidence</span>
      {"  "}
      <span className="text-nb-code-fg/45">{"// "}</span>
      <span className="text-nb-yellow">0.994</span>
      {"\n"}report.<span className="text-nb-cyan">record</span>
      {"      "}
      <span className="text-nb-code-fg/45">{"// ark_7f3a…"}</span>
    </pre>
  );
}
