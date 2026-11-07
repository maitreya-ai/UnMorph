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

type NewImageResult =
  | {
      status: "REGISTERED_SUCCESS";
      entityKey: string;
      txHash: string;
      swarmRef: string;
      pHash: string;
    }
  | {
      status: "ALREADY_REGISTERED";
      owner: string;
      registeredAt: number;
    }
  | {
      status: "MORPHING_DETECTED";
      incidentKey: string;
      similarityPercent: number;
      legitimateOwner: string;
    };

const subscribeNoop = () => () => {};

export function RegisterPanel({ onRegistered }: { onRegistered?: () => void }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const { address, isConnected } = useAccount();
  const displayConnected = mounted && isConnected;
  const displayAddress = mounted ? address : undefined;
  const { data: ensName } = useEnsName({ address: displayAddress });

  const { registerImageOnChain } = useArkivWriter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lifetimeDays, setLifetimeDays] = useState<number>(365);
  const [loading, setLoading] = useState(false);
  const [stepText, setStepText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NewImageResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    setError(null);
    setResult(null);
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
    setStepText("1/2: Computing pHash & uploading backup to Swarm…");

    try {
      console.log("Step 1: Starting register...");
      // Step 1: POST to /api/register to compute pHash & upload to Swarm
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Step 2: Got server response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process image on server");
      }

      const pHash = data.pHash || data.result?.pHash;
      const buckets = data.buckets || data.result?.buckets;
      const swarmRef = data.swarmRef || data.result?.swarmRef;

      // Step 2: Call registerImageOnChain() from hook -> Wallet popup appears -> user signs
      setStepText("2/2: Confirm transaction in your wallet to sign on Arkiv…");

      const blocksPerDay = 24 * 60 * 30; // 43,200 blocks/day
      const lifetimeBlocks = BigInt(Math.round(lifetimeDays * blocksPerDay));

      console.log("Step 3: Calling registerImageOnChain with:", { pHash, buckets, swarmRef });
      const onChain = await registerImageOnChain(
        pHash,
        buckets,
        swarmRef,
        ensName ?? "none",
        lifetimeBlocks,
      );

      // Step 3: Show real txHash from MetaMask transaction
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
          <div className="inline-flex items-center gap-1.5 bg-nb-yellow px-2.5 py-0.5 text-[11.5px] font-semibold text-nb-black">
            Arkiv Web3 DB + ETH Swarm
          </div>
          <h2 className="mt-1 font-heading text-[18px] font-medium tracking-tight text-nb-black">
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
              className="inline-flex nb-press-sm items-center gap-1.5 border-2 border-nb-black bg-nb-surface px-3 py-1.5 font-heading text-[13px] font-bold text-nb-black"
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
              "group relative flex w-full flex-col items-center justify-center overflow-hidden border-2 border-dashed px-6 py-10 text-center transition-colors duration-200",
              dragging
                ? "border-nb-black bg-nb-yellow"
                : "border-nb-black bg-nb-bg-warm hover:border-nb-black hover:bg-nb-yellow",
            )}
          >
            <span className="grid size-12 place-items-center bg-nb-surface text-nb-black transition-transform duration-300 group-hover:-translate-y-1">
              <ImageUp className="size-5" />
            </span>
            <span className="mt-3 font-heading text-[16px] font-bold text-nb-black">
              {dragging ? "Release image to select" : "Click or drag image to register"}
            </span>
            <span className="mt-1 text-[13px] text-nb-muted">
              JPG, PNG, WebP up to 25 MB · Generates 64-bit DCT perceptual hash
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-4 border-2 border-nb-black bg-nb-bg-warm p-4 sm:flex-row sm:items-center">
            <div className="relative aspect-video w-full max-w-[180px] shrink-0 overflow-hidden border-2 border-nb-black bg-nb-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Selected preview" className="size-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-nb-black">{imageFile?.name}</p>
              <p className="text-[12.5px] text-nb-muted">
                {imageFile ? formatBytes(imageFile.size) : ""} · Ready for pHash indexing
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="text-[12px] font-medium text-nb-black hover:underline disabled:opacity-50"
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
              <label htmlFor="lifetime" className="block text-[12px] font-medium text-nb-black">
                Registry Lifetime (Days)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="lifetime"
                  type="number"
                  min="1"
                  max="3650"
                  value={lifetimeDays}
                  onChange={(e) => setLifetimeDays(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={loading}
                  className="h-9 w-full border-2 border-nb-black bg-nb-surface px-3 text-[13px] text-nb-black outline-none focus:border-nb-black"
                />
                <div className="flex gap-1">
                  {[30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setLifetimeDays(d)}
                      disabled={loading}
                      className={cn(
                        "border-2 px-2.5 py-1 font-mono text-[12px] font-bold transition-colors",
                        lifetimeDays === d
                          ? "border-nb-black bg-nb-black text-nb-white"
                          : "border-nb-black bg-nb-surface text-nb-black hover:bg-nb-yellow-light",
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
              <label className="block text-[12px] font-medium text-nb-black">Owner Wallet</label>
              <div className="mt-1 flex h-9 items-center justify-between border-2 border-nb-black bg-nb-bg-warm px-3 font-mono text-[12.5px] text-nb-black">
                <span>
                  {displayAddress ? truncateMiddle(displayAddress, 8, 6) : "Wallet not connected"}
                </span>
                {ensName && <span className="font-sans text-[11px] text-nb-black">{ensName}</span>}
              </div>
              <p className="mt-1 text-[11px] text-nb-muted">
                Automatically registered as on-chain $owner
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-nb-pink-light px-3 py-2 text-[13px] text-nb-black">
            <TriangleAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button - always rendered inside form when not in result state */}
        {!result && (
          <button
            type="submit"
            disabled={!displayConnected || loading || !imageFile}
            className="flex h-11 w-full items-center justify-center gap-2 bg-nb-black text-[14px] font-semibold text-nb-white transition hover:bg-nb-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin text-nb-black" />
                <span>
                  {stepText || "Processing pHash, uploading to Swarm & signing on Arkiv…"}
                </span>
              </>
            ) : !displayConnected ? (
              <>
                <Wallet className="size-4 text-nb-black" />
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

      {/* Result Display — strictly per prompt requirements */}
      {result && (
        <div className="mt-5 space-y-3">
          {/* 'REGISTERED_SUCCESS' → show success: entityKey, txHash, swarmRef */}
          {result.status === "REGISTERED_SUCCESS" && (
            <div className="border-2 border-nb-black bg-nb-green-light p-4">
              <div className="flex items-center gap-2.5 text-nb-black">
                <CheckCircle2 className="size-5 text-nb-black" />
                <h3 className="text-[15px] font-semibold">Image Registered Successfully</h3>
              </div>
              <p className="mt-1 text-[13px] text-nb-muted">
                Original image anchored on Arkiv Web3 database with public unencrypted replica on
                ETH Swarm.
              </p>

              <div className="mt-3 divide-y-2 divide-nb-black border-2 border-nb-black bg-nb-surface p-3 text-[12.5px]">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">Entity Key</span>
                  <div className="flex items-center gap-1.5 font-mono text-nb-black">
                    <span>{truncateMiddle(result.entityKey, 10, 8)}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.entityKey, "entity")}
                      title="Copy Entity Key"
                      className="text-nb-muted hover:text-nb-black"
                    >
                      {copiedKey === "entity" ? (
                        <CheckCircle2 className="size-3.5 text-nb-black" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">Transaction Hash</span>
                  <div className="flex items-center gap-1.5 font-mono text-nb-black">
                    <span>{truncateMiddle(result.txHash, 10, 8)}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.txHash, "tx")}
                      title="Copy Tx Hash"
                      className="text-nb-muted hover:text-nb-black"
                    >
                      {copiedKey === "tx" ? (
                        <CheckCircle2 className="size-3.5 text-nb-black" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">Swarm Reference</span>
                  <div className="flex items-center gap-1.5 font-mono text-nb-black">
                    <span>{truncateMiddle(result.swarmRef, 10, 8)}</span>
                    <a
                      href={`https://api.gateway.ethswarm.org/bzz/${result.swarmRef}/`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open in Swarm Gateway"
                      className="inline-flex items-center gap-0.5 text-nb-black hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-nb-muted">pHash (64-bit DCT)</span>
                  <span className="font-mono text-nb-black">{result.pHash}</span>
                </div>
              </div>
            </div>
          )}

          {/* 'ALREADY_REGISTERED' → show: "This image is already registered by [owner]" */}
          {result.status === "ALREADY_REGISTERED" && (
            <div className="border-2 border-nb-black bg-nb-orange-light p-4 text-nb-black">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-nb-black" />
                <h3 className="text-[15px] font-semibold">Already Registered</h3>
              </div>
              <p className="mt-2 text-[13.5px]">
                This image is already registered by{" "}
                <span className="font-mono font-semibold">{result.owner}</span>
              </p>
              <p className="mt-1 text-[12px] text-nb-muted">
                Registered on: {new Date(result.registeredAt * 1000).toLocaleString()}
              </p>
            </div>
          )}

          {/* 'MORPHING_DETECTED' → show warning: "Morphing attempt detected — similarity: X%, legitimate owner: [legitimateOwner]" also show incidentKey */}
          {result.status === "MORPHING_DETECTED" && (
            <div className="border-2 border-nb-black bg-nb-pink-light p-4 text-nb-black">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-nb-black" />
                <h3 className="text-[15px] font-semibold">Morphing Attempt Detected</h3>
              </div>
              <p className="mt-2 text-[13.5px] font-medium">
                Morphing attempt detected — similarity: {result.similarityPercent}%, legitimate
                owner: <span className="font-mono font-semibold">{result.legitimateOwner}</span>
              </p>
              <div className="mt-3 border-2 border-nb-black bg-nb-surface p-3 font-mono text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-nb-muted">Incident Log Key:</span>
                  <span className="font-bold text-nb-black">
                    {truncateMiddle(result.incidentKey, 12, 10)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11.5px] text-nb-muted">
                An immutable security incident was logged on Arkiv under the legitimate owner&apos;s
                records.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
