"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useAccount, useEnsName } from "wagmi";
import { useArkivWriter } from "@/hooks/useArkivWriter";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  ImageUp,
  Loader2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { cn, formatBytes, truncateMiddle } from "@/lib/utils";

type RegisterResult =
  | {
      status: "REGISTERED_SUCCESS";
      entityKey: string;
      txHash: string;
      swarmRef: string;
      pHash: string;
    }
  | {
      status: "ALREADY_OWNED";
      owner: string;
      registeredAt: number;
      similarityPercent?: number;
    }
  | {
      status: "ALREADY_EXISTS";
      ownerWallet: string;
      targetImageHash: string;
    }
  | {
      status: "SIMILAR_EXISTS";
      similarityPercent: number;
      ownerWallet: string;
      targetImageHash: string;
    };

/** Tracks the automatic, buttonless incident log that fires the instant a detection banner appears. */
type IncidentAutoState =
  | { phase: "recording" }
  | { phase: "recorded"; entityKey: string; txHash: string }
  | { phase: "failed" };

const subscribeNoop = () => () => {};

export function RegisterPanel({
  onRegistered,
  onIncidentReported,
}: {
  onRegistered?: () => void;
  onIncidentReported?: () => void;
}) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const { address, isConnected } = useAccount();
  const displayConnected = mounted && isConnected;
  const displayAddress = mounted ? address : undefined;
  const { data: ensName } = useEnsName({ address: displayAddress });

  const { registerImageOnChain, createIncidentOnChain } = useArkivWriter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lifetimeDays, setLifetimeDays] = useState<number>(365);
  const [loading, setLoading] = useState(false);
  const [stepText, setStepText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [incidentState, setIncidentState] = useState<IncidentAutoState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    setError(null);
    setResult(null);
    setIncidentState(null);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleReset = () => {
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setStepText("");
    setIncidentState(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !displayConnected || !address) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setIncidentState(null);
    setStepText("1/2: Checking Arkiv registry for this image…");

    try {
      // Step 1: POST to /api/register — computes pHash and runs the read-only exact/similar
      // checks against Arkiv BEFORE touching Swarm or signing anything on-chain.
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("ownerWallet", address);

      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process image on server");
      }

      const checkResult = data.result;

      if (checkResult.status === "ALREADY_OWNED") {
        setResult({
          status: "ALREADY_OWNED",
          owner: checkResult.owner,
          registeredAt: checkResult.registeredAt,
          similarityPercent: checkResult.similarityPercent,
        });
        return;
      }

      // ALREADY_EXISTS / SIMILAR_EXISTS: show the detection banner immediately, then — with no
      // confirmation dialog and no button — sign and record the incident log on Arkiv right away.
      if (checkResult.status === "ALREADY_EXISTS" || checkResult.status === "SIMILAR_EXISTS") {
        const targetImageHash: string = checkResult.targetImageHash;
        const legitimateOwner: string = checkResult.ownerWallet;
        const similarityScore = checkResult.status === "ALREADY_EXISTS" ? 100 : checkResult.similarityPercent;

        setResult(
          checkResult.status === "ALREADY_EXISTS"
            ? { status: "ALREADY_EXISTS", ownerWallet: legitimateOwner, targetImageHash }
            : {
                status: "SIMILAR_EXISTS",
                similarityPercent: similarityScore,
                ownerWallet: legitimateOwner,
                targetImageHash,
              },
        );

        setIncidentState({ phase: "recording" });

        try {
          const incident = await createIncidentOnChain({
            targetImageHash,
            claimerWallet: address,
            legitimateOwner,
            similarityScore,
          });
          setIncidentState({
            phase: "recorded",
            entityKey: incident.entityKey,
            txHash: incident.txHash,
          });
          if (onIncidentReported) onIncidentReported();
        } catch (incidentErr) {
          // MetaMask rejection or signing failure — detection already shown, never crash the UI.
          console.warn("Failed to record incident on Arkiv:", incidentErr);
          setIncidentState({ phase: "failed" });
        }
        return;
      }

      if (checkResult.status !== "PROCEED_TO_REGISTER") {
        throw new Error("Unexpected response from server while checking Arkiv registry");
      }

      // Clean on both checks — now it's safe to upload to Swarm (already done server-side)
      // and sign the registration transaction with MetaMask.
      const { pHash, buckets, swarmRef } = checkResult;

      setStepText("2/2: Confirm transaction in your wallet to sign on Arkiv…");

      const blocksPerDay = 24 * 60 * 30; // 43,200 blocks/day
      const lifetimeBlocks = BigInt(Math.round(lifetimeDays * blocksPerDay));

      const onChain = await registerImageOnChain(
        pHash,
        buckets,
        swarmRef,
        ensName ?? "none",
        lifetimeBlocks,
      );

      setResult({
        status: "REGISTERED_SUCCESS",
        entityKey: onChain.entityKey,
        txHash: onChain.txHash,
        swarmRef,
        pHash,
      });

      if (onRegistered) onRegistered();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred during registration",
      );
    } finally {
      setLoading(false);
      setStepText("");
    }
  };

  return (
    <div className="border-[3px] border-nb-black bg-nb-surface p-5 shadow-nb sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 border-[2px] border-nb-black bg-nb-lavender px-2.5 py-0.5 font-heading text-[11px] font-bold uppercase text-nb-black">
            Arkiv Web3 DB + ETH Swarm
          </div>
          <h2 className="mt-1.5 font-display text-[18px] font-extrabold tracking-tight text-nb-black uppercase">
            Register image ownership
          </h2>
          <p className="mt-0.5 text-[13px] text-nb-muted">
            Anchors perceptual hash (pHash) into Arkiv and stores unencrypted backup on Swarm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ConnectWallet />
          {imageFile && !loading && (
            <button
              type="button"
              onClick={handleReset}
              className="nb-press-sm inline-flex items-center gap-1.5 border-[2px] border-nb-black bg-nb-surface px-3 py-1.5 font-heading text-[12px] font-bold text-nb-black uppercase"
            >
              <RotateCcw className="size-3.5" /> Register another
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleSelectFile(e.target.files?.[0])}
      />

      {/* Always render form, never conditionally swap element type */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Upload Zone or Preview */}
        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleSelectFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "group relative flex w-full flex-col items-center justify-center overflow-hidden border-[3px] border-dashed px-6 py-10 text-center transition-colors duration-200",
              dragging ? "border-nb-black bg-nb-yellow/20" : "border-nb-black bg-nb-bg",
            )}
          >
            <span className="grid size-12 place-items-center border-[3px] border-nb-black bg-nb-yellow text-nb-black shadow-nb-sm transition-transform duration-300 group-hover:-translate-y-1">
              <ImageUp className="size-5" />
            </span>
            <span className="mt-3 font-display text-[15px] font-extrabold text-nb-black uppercase">
              {dragging ? "Release image to select" : "Click or drag image to register"}
            </span>
            <span className="mt-1 text-[13px] text-nb-muted">
              JPG, PNG, WebP up to 25 MB · Generates 64-bit DCT perceptual hash
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-4 border-[3px] border-nb-black bg-nb-bg p-4 sm:flex-row sm:items-center">
            <div className="relative aspect-video w-full max-w-[180px] shrink-0 overflow-hidden border-[3px] border-nb-black bg-nb-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Selected preview" className="size-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-nb-black">{imageFile?.name}</p>
              <p className="text-[12.5px] text-nb-muted">
                {imageFile ? formatBytes(imageFile.size) : ""} · Ready for pHash indexing
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="text-[12px] font-bold text-nb-black underline decoration-2 underline-offset-2 disabled:opacity-50"
                >
                  Change file
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Inputs: Lifetime and Wallet Display */}
        {previewUrl && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="lifetime"
                className="mb-1 block font-heading text-[11px] font-bold tracking-[0.06em] text-nb-black uppercase"
              >
                Registry Lifetime (Days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="lifetime"
                  type="number"
                  min="1"
                  max="3650"
                  value={lifetimeDays}
                  onChange={(e) => setLifetimeDays(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={loading}
                  className="h-9 w-full border-[2px] border-nb-black bg-nb-surface px-3 text-[13px] font-bold text-nb-black outline-none focus:bg-nb-yellow/15"
                />
                <div className="flex gap-1">
                  {[30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setLifetimeDays(d)}
                      disabled={loading}
                      className={cn(
                        "border-[2px] border-nb-black px-2 py-1 text-[11px] font-bold transition",
                        lifetimeDays === d
                          ? "bg-nb-black text-nb-bg"
                          : "bg-nb-surface text-nb-black hover:bg-nb-yellow",
                      )}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-[11px] text-nb-muted">
                Auto-converts to ~{lifetimeDays * 24 * 60 * 30} Arkiv blocks
              </p>
            </div>

            <div>
              <label className="mb-1 block font-heading text-[11px] font-bold tracking-[0.06em] text-nb-black uppercase">
                Owner Wallet
              </label>
              <div className="flex h-9 items-center justify-between border-[2px] border-nb-black bg-nb-bg px-3 font-mono text-[12.5px] font-bold text-nb-black">
                <span>
                  {displayAddress ? truncateMiddle(displayAddress, 8, 6) : "Wallet not connected"}
                </span>
                {ensName && (
                  <span className="font-sans text-[11px] font-bold text-nb-black">{ensName}</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-nb-muted">
                Automatically registered as on-chain $owner
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 border-[3px] border-nb-black bg-nb-pink px-3 py-2 text-[13px] font-bold text-nb-black">
            <TriangleAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button - always rendered inside form when not in result state */}
        {!result && (
          <button
            type="submit"
            disabled={!displayConnected || loading || !imageFile}
            className="nb-press flex h-12 w-full items-center justify-center gap-2 border-[3px] border-nb-black bg-nb-yellow font-heading text-[14px] font-bold text-nb-black uppercase disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{stepText || "Checking Arkiv, uploading to Swarm & signing on Arkiv…"}</span>
              </>
            ) : !displayConnected ? (
              <>
                <Wallet className="size-4" />
                <span>Connect wallet to register</span>
              </>
            ) : (
              <>
                <span>Register Original on Arkiv + Swarm</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        )}
      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-5 space-y-3">
          {/* 'REGISTERED_SUCCESS' → show success: entityKey, txHash, swarmRef */}
          {result.status === "REGISTERED_SUCCESS" && (
            <div className="border-[3px] border-nb-black bg-nb-green p-4 text-nb-black">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-5" />
                <h3 className="font-heading text-[15px] font-bold uppercase">
                  Image Registered Successfully
                </h3>
              </div>
              <p className="mt-1 text-[13px]">
                Original image anchored on Arkiv Web3 database with public unencrypted replica on
                ETH Swarm.
              </p>

              <div className="mt-3 divide-y-[2px] divide-nb-black border-[2px] border-nb-black bg-nb-surface p-3 text-[12.5px]">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">Entity Key</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-nb-black">
                    <span>{truncateMiddle(result.entityKey, 10, 8)}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.entityKey, "entity")}
                      title="Copy Entity Key"
                      className="text-nb-muted hover:text-nb-black"
                    >
                      {copiedKey === "entity" ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">Transaction Hash</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-nb-black">
                    <span>{truncateMiddle(result.txHash, 10, 8)}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.txHash, "tx")}
                      title="Copy Tx Hash"
                      className="text-nb-muted hover:text-nb-black"
                    >
                      {copiedKey === "tx" ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">Swarm Reference</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-nb-black">
                    <span>{truncateMiddle(result.swarmRef, 10, 8)}</span>
                    <a
                      href={`https://api.gateway.ethswarm.org/bzz/${result.swarmRef}/`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open in Swarm Gateway"
                      className="inline-flex items-center gap-0.5 hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">pHash (64-bit DCT)</span>
                  <span className="font-mono font-bold text-nb-black">{result.pHash}</span>
                </div>
              </div>
            </div>
          )}

          {/* 'ALREADY_OWNED' → exact or similar match, same owner as connected wallet */}
          {result.status === "ALREADY_OWNED" && (
            <div className="border-[3px] border-nb-black bg-nb-orange p-4 text-nb-black">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5" />
                <h3 className="font-heading text-[15px] font-bold uppercase">
                  Already Registered
                </h3>
              </div>
              <p className="mt-2 text-[13.5px] font-medium">
                {result.similarityPercent !== undefined
                  ? "You already have a similar image registered."
                  : "This image is already registered by you."}
              </p>
              <p className="mt-1 text-[12px]">
                Registered on: {new Date(result.registeredAt * 1000).toLocaleString()}
                {result.similarityPercent !== undefined &&
                  ` · Similarity: ${result.similarityPercent}%`}
              </p>
            </div>
          )}

          {/* 'ALREADY_EXISTS' → exact match, different owner — incident is logged automatically */}
          {result.status === "ALREADY_EXISTS" && (
            <div className="border-[3px] border-nb-black bg-nb-pink p-4 text-nb-black">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5" />
                <h3 className="font-heading text-[15px] font-bold uppercase">
                  🚩 This exact image is already registered by another wallet
                </h3>
              </div>
              <p className="mt-2 text-[13.5px] font-medium">
                Owner:{" "}
                <span className="font-mono font-bold">
                  {truncateMiddle(result.ownerWallet, 8, 6)}
                </span>
              </p>
              <IncidentStatusLine incidentState={incidentState} />
            </div>
          )}

          {/* 'SIMILAR_EXISTS' → similar image found, different owner — incident is logged automatically */}
          {result.status === "SIMILAR_EXISTS" && (
            <div className="border-[3px] border-nb-black bg-nb-orange p-4 text-nb-black">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5" />
                <h3 className="font-heading text-[15px] font-bold uppercase">
                  🚩 A similar image is already registered (similarity: {result.similarityPercent}
                  %)
                </h3>
              </div>
              <p className="mt-2 text-[13.5px] font-medium">
                Owner:{" "}
                <span className="font-mono font-bold">
                  {truncateMiddle(result.ownerWallet, 8, 6)}
                </span>
              </p>
              <IncidentStatusLine incidentState={incidentState} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the live status of the automatic, buttonless incident log — "Recording…" while the
 * wallet is signing, the entityKey/txHash once confirmed, or a soft failure note if MetaMask
 * rejected or the write errored. Never throws, never blocks the rest of the UI.
 */
function IncidentStatusLine({ incidentState }: { incidentState: IncidentAutoState | null }) {
  if (!incidentState || incidentState.phase === "recording") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-nb-black">
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
        Recording incident on-chain…
      </p>
    );
  }

  if (incidentState.phase === "recorded") {
    return (
      <div className="mt-3 border-[2px] border-nb-black bg-nb-surface p-3 font-mono text-[12px]">
        <div className="flex items-center gap-1.5 text-nb-black">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span className="font-sans font-bold">Incident recorded on-chain ✅</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-nb-muted">Incident Key</span>
          <span className="font-bold text-nb-black">
            {truncateMiddle(incidentState.entityKey, 12, 10)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-nb-muted">Tx Hash</span>
          <span className="font-bold text-nb-black">
            {truncateMiddle(incidentState.txHash, 12, 10)}
          </span>
        </div>
      </div>
    );
  }

  // phase === "failed"
  return (
    <p className="mt-2 text-[12.5px] font-bold text-nb-black">
      Detection noted but incident could not be recorded on-chain
    </p>
  );
}
