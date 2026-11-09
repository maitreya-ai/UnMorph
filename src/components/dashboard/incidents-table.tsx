"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAccount } from "wagmi";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import type { ArkivEntity } from "@/lib/arkiv";
import { truncateMiddle } from "@/lib/utils";

/**
 * Reads a custom schema attribute off a query row. Without a `.from(schema)` selection, the SDK
 * returns every custom attribute wrapped as `{ type, value }` under `$attributes` — never as a
 * top-level field — so callers must unwrap it here rather than reading `entity.<name>` directly.
 */
function getAttributeValue(
  entity: ArkivEntity | null | undefined,
  name: string,
): string | undefined {
  const attributes = entity?.$attributes as Record<string, { value?: unknown }> | undefined;
  const value = attributes?.[name]?.value;
  return typeof value === "string" ? value : undefined;
}

/** Browser-safe hex → UTF-8 decoder (no Buffer — this component runs client-side). */
function hexToUtf8(hex: string): string {
  const clean = hex.trim().replace(/^0x/, "");
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Decodes the `payload` bytes attribute into { similarityScore, detectedAt }. The payload column
 * is only ever present as a lowercase 0x hex string on the SDK's query response — never a raw
 * object — so it must be hex-decoded then JSON-parsed. Never throws; falls back to nulls so the
 * row can render "N/A" / "Unknown" instead of crashing on a malformed entity.
 */
function decodePayload(entity: ArkivEntity | null | undefined): {
  similarityScore: number | null;
  detectedAt: number | null;
} {
  const hex = getAttributeValue(entity, "payload");
  if (!hex) return { similarityScore: null, detectedAt: null };

  try {
    const json = hexToUtf8(hex);
    const parsed = JSON.parse(json);
    return {
      similarityScore: typeof parsed.similarityScore === "number" ? parsed.similarityScore : null,
      detectedAt: typeof parsed.detectedAt === "number" ? parsed.detectedAt : null,
    };
  } catch {
    return { similarityScore: null, detectedAt: null };
  }
}

const subscribeNoop = () => () => {};

export function IncidentsTable({ refreshSignal }: { refreshSignal?: number }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const { address, isConnected } = useAccount();
  const displayConnected = mounted && isConnected;

  const [incidents, setIncidents] = useState<ArkivEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/incidents?wallet=${address}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load incidents");
      }
      setIncidents(Array.isArray(data.incidents) ? data.incidents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Fetch on mount and whenever the connected wallet changes.
  useEffect(() => {
    if (!address) return;
    const timer = setTimeout(() => {
      void fetchIncidents();
    }, 0);
    return () => clearTimeout(timer);
  }, [address, fetchIncidents]);

  // Auto-refresh after any new incident is created elsewhere on the dashboard (register or
  // verify panel) — delayed 3s to give Arkiv time to index the just-written entity.
  const lastSignalRef = useRef(refreshSignal);
  useEffect(() => {
    if (refreshSignal === undefined) return;
    if (lastSignalRef.current === refreshSignal) return;
    lastSignalRef.current = refreshSignal;
    const timer = setTimeout(() => {
      void fetchIncidents();
    }, 3000);
    return () => clearTimeout(timer);
  }, [refreshSignal, fetchIncidents]);

  const displayedIncidents = address ? incidents : [];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="border-[3px] border-nb-black bg-nb-surface shadow-nb">
      <div className="flex flex-col gap-4 border-b-[3px] border-nb-black p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center border-[2px] border-nb-black bg-nb-pink text-nb-black">
              <ShieldAlert className="size-4" />
            </span>
            <h2 className="font-display text-[17px] font-extrabold tracking-tight text-nb-black uppercase">
              Morphing incident log
            </h2>
            <span
              className={`border-[2px] border-nb-black px-2 py-0.5 font-heading text-[11px] font-bold ${
                incidents.length > 0 ? "bg-nb-pink text-nb-black" : "bg-nb-bg text-nb-muted"
              }`}
            >
              {incidents.length} {incidents.length === 1 ? "incident" : "incidents"}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-nb-muted">
            Immutable security logs recorded on Arkiv whenever someone attempts to re-register or
            verify a morphed variant of your images.
          </p>
        </div>

        {displayConnected && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchIncidents}
              disabled={loading}
              className="nb-press-sm inline-flex items-center gap-1.5 border-[2px] border-nb-black bg-nb-surface px-3 py-1.5 font-heading text-[12px] font-bold text-nb-black uppercase"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        )}
      </div>

      {!displayConnected ? (
        <div className="p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center border-[3px] border-nb-black bg-nb-orange text-nb-black">
            <Wallet className="size-6" />
          </div>
          <h3 className="mt-3 font-heading text-[15px] font-bold text-nb-black uppercase">
            Connect wallet to view incident logs
          </h3>
          <p className="mx-auto mt-1 max-w-md text-[13px] text-nb-muted">
            Arkiv indexes incident logs by legitimate owner. Connect the wallet that owns your
            registered images to query live on-chain logs.
          </p>
          <div className="mt-4 flex justify-center">
            <ConnectWallet />
          </div>
        </div>
      ) : loading && incidents.length === 0 ? (
        <div className="p-2">
          <table className="w-full text-left text-[13px]">
            <tbody className="divide-y-[2px] divide-nb-black">
              {[0, 1, 2].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="h-3.5 w-32 bg-nb-bg" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3.5 w-28 bg-nb-bg" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3.5 w-12 bg-nb-bg" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3.5 w-24 bg-nb-bg" />
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <div className="ml-auto h-3.5 w-24 bg-nb-bg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <div className="mx-auto grid size-10 place-items-center border-[3px] border-nb-black bg-nb-pink text-nb-black">
            <AlertTriangle className="size-5" />
          </div>
          <h3 className="mt-2 font-heading text-[14.5px] font-bold text-nb-black uppercase">
            Failed to load incidents
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-nb-muted">{error}</p>
          <button
            type="button"
            onClick={fetchIncidents}
            className="nb-press-sm mt-3 inline-flex items-center gap-1.5 border-[2px] border-nb-black bg-nb-surface px-3 py-1.5 font-heading text-[12px] font-bold text-nb-black uppercase"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : displayedIncidents.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto grid size-10 place-items-center border-[3px] border-nb-black bg-nb-green text-nb-black">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="mt-2 font-heading text-[14.5px] font-bold text-nb-black uppercase">
            No incidents detected
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-nb-muted">
            Your registered images have not been targeted yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-nb-black text-[11px] font-bold tracking-wider text-nb-bg uppercase">
              <tr>
                <th className="px-5 py-3 sm:px-6">Target Image Hash</th>
                <th className="px-4 py-3">Claimer Wallet</th>
                <th className="px-4 py-3">Similarity</th>
                <th className="px-4 py-3">Detected At</th>
                <th className="px-5 py-3 text-right sm:px-6">Incident Key</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-nb-black">
              {displayedIncidents.map((inc, i) => {
                const { similarityScore, detectedAt } = decodePayload(inc);
                const targetHash = getAttributeValue(inc, "targetImageHash") || "N/A";
                const claimer = getAttributeValue(inc, "claimerWallet") || inc.$owner || "Unknown";
                const incidentKey = inc.$key || `inc_${i}`;

                // Target Image Hash (truncated, first 8 + last 4 chars)
                const formattedHash =
                  targetHash !== "N/A" && targetHash.length > 12
                    ? `${targetHash.slice(0, 8)}...${targetHash.slice(-4)}`
                    : targetHash;

                return (
                  <tr key={incidentKey} className="transition-colors hover:bg-nb-yellow/15">
                    <td className="px-5 py-3 font-mono font-bold text-nb-black sm:px-6">
                      <span title={targetHash}>{formattedHash}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-nb-muted">
                      <div className="flex items-center gap-1.5">
                        <span title={claimer}>
                          {claimer === "Unknown" ? claimer : truncateMiddle(claimer, 8, 6)}
                        </span>
                        {claimer !== "Unknown" && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(claimer, `claim_${i}`)}
                            className="hover:text-nb-black"
                            title="Copy claimer address"
                          >
                            {copiedKey === `claim_${i}` ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 border-[2px] border-nb-black bg-nb-pink px-2 py-0.5 text-[11.5px] font-bold text-nb-black">
                        <AlertTriangle className="size-3" />
                        {similarityScore !== null ? `${similarityScore}%` : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-nb-muted">
                      {detectedAt !== null && detectedAt > 0
                        ? new Date(detectedAt * 1000).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[12px] text-nb-muted sm:px-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <span title={incidentKey}>{truncateMiddle(incidentKey, 8, 6)}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(incidentKey, `key_${i}`)}
                          className="hover:text-nb-black"
                          title="Copy Incident Key"
                        >
                          {copiedKey === `key_${i}` ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
