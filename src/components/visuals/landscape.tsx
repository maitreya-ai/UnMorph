import { scenePalettes, type SceneVariant } from "@/lib/scenes";
import { cn } from "@/lib/utils";

type LandscapeProps = {
  variant?: SceneVariant;
  /** Renders the "morphed" version: a fabricated peak and a cloned sun. */
  tampered?: boolean;
  className?: string;
  title?: string;
};

/** Where the tampered edits sit, in % of the frame — used for heatmap overlays. */
export const TAMPER_REGIONS = [
  { id: "A", label: "Generative fill", left: 77, top: 36, width: 19, height: 27, score: 97.2 },
  { id: "B", label: "Cloned element", left: 11, top: 10, width: 13, height: 19, score: 92.6 },
] as const;

const STARS = [
  [24, 18],
  [62, 40],
  [104, 22],
  [150, 46],
  [188, 14],
  [226, 34],
  [262, 12],
  [318, 26],
  [352, 48],
  [378, 16],
  [130, 70],
  [40, 66],
  [210, 60],
  [300, 64],
] as const;

const INK = "#000000";
const LINE = 2.5;

/**
 * A procedural landscape "photograph", drawn neubrutalist: flat fills, 2.5px
 * black outlines, square stars, no gradients. Purely presentational SVG — it
 * stands in for user imagery across the marketing site and dashboard.
 */
export function Landscape({
  variant = "glacier",
  tampered = false,
  className,
  title,
}: LandscapeProps) {
  const p = scenePalettes[variant];
  const night = variant === "aurora";
  const stroke = { stroke: INK, strokeWidth: LINE, strokeLinejoin: "miter" as const };

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block size-full", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="400" height="260" fill={p.sky} />

      {night && (
        <g>
          {STARS.map(([x, y], i) => {
            const s = i % 3 === 0 ? 4 : 2.5;
            return <rect key={i} x={x - s / 2} y={y - s / 2} width={s} height={s} fill="#FFFFFF" />;
          })}
          {/* aurora: two hard-edged ribbons */}
          <path
            d="M-10 92 L60 58 L140 96 L220 52 L300 74 L420 40 V60 L300 94 L220 72 L140 116 L60 78 L-10 112Z"
            fill="#88D498"
            {...stroke}
          />
          <path
            d="M-10 70 L80 40 L160 70 L240 34 L330 52 L420 26 V36 L330 62 L240 44 L160 80 L80 50 L-10 80Z"
            fill="#7FDBDA"
            {...stroke}
          />
        </g>
      )}

      {/* sun */}
      <circle cx="290" cy="70" r={night ? 16 : 26} fill={p.sun} {...stroke} />

      {/* flat clouds */}
      {!night && (
        <g fill="#FFFFFF" {...stroke}>
          <path d="M70 62 H132 V52 H118 V44 H92 V52 H70Z" />
          <path d="M318 108 H364 V100 H350 V94 H330 V100 H318Z" />
        </g>
      )}

      {/* far ridge */}
      <path
        d="M-4 150 L30 132 L62 142 L98 112 L132 134 L168 104 L204 128 L238 116 L276 138 L312 108 L350 130 L404 112 V264 H-4Z"
        fill={p.far}
        {...stroke}
      />

      {/* mid mountains */}
      <path
        d="M-4 186 L48 150 L78 166 L132 92 L176 150 L206 132 L246 168 L298 118 L340 156 L372 140 L404 152 V264 H-4Z"
        fill={p.mid}
        {...stroke}
      />
      <path d="M132 92 L117 112 L126 109 L133 117 L140 108 L149 113Z" fill={p.snow} {...stroke} />
      <path d="M298 118 L286 133 L294 130 L300 137 L306 129 L313 132Z" fill={p.snow} {...stroke} />

      {tampered && (
        <g>
          {/* fabricated peak (generative fill) */}
          <path d="M314 162 L346 102 L380 160Z" fill={p.mid} {...stroke} />
          <path
            d="M346 102 L336 117 L344 114 L347 121 L352 113 L359 117Z"
            fill={p.snow}
            {...stroke}
          />
          {/* cloned sun */}
          <circle cx="70" cy="50" r="15" fill={p.sun} {...stroke} />
        </g>
      )}

      {/* lake */}
      <rect x="-4" y="194" width="408" height="70" fill={p.water} {...stroke} />
      <g stroke={INK} strokeWidth="2">
        <line x1="40" y1="207" x2="96" y2="207" />
        <line x1="180" y1="214" x2="260" y2="214" />
        <line x1="270" y1="204" x2="312" y2="204" />
        <line x1="120" y1="222" x2="150" y2="222" />
      </g>

      {/* foreground shore + pines */}
      <path
        d="M-4 236 L60 222 L120 232 L180 220 L240 236 L300 226 L360 234 L404 228 V264 H-4Z"
        fill={p.near}
        {...stroke}
      />
      <g fill={INK}>
        <path d="M26 230 L34 204 L42 230Z" />
        <path d="M40 232 L50 196 L60 232Z" />
        <path d="M58 230 L65 210 L72 230Z" />
        <path d="M342 232 L351 206 L360 232Z" />
        <path d="M356 234 L364 214 L372 234Z" />
      </g>
    </svg>
  );
}
