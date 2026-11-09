import { NextRequest, NextResponse } from "next/server";
import { computePHash, similarityPercent } from "@/lib/phash";
import { findExactImage, findSimilarImages, type ArkivEntity } from "@/lib/arkiv";
import { uploadImageToSwarm } from "@/lib/swarm";

function isValidEthereumAddress(address: unknown): address is string {
  return typeof address === "string" && /^0x[0-9a-fA-F]{40}$/.test(address.trim());
}

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

function getEntityOwner(entity: ArkivEntity | null | undefined): string {
  const owner = entity?.$owner;
  return typeof owner === "string" ? owner.toLowerCase() : "";
}

function parseEntityPayload(entity: ArkivEntity | null | undefined): {
  swarmRef: string;
  registeredAt: number;
} {
  const fallback = {
    swarmRef: "",
    registeredAt: Math.floor(Date.now() / 1000),
  };

  // The `payload` column is a `bytes` attribute, decoded by the SDK as a lowercase 0x hex string —
  // never a Uint8Array — so it must be hex-decoded back to UTF-8 before JSON.parse.
  const hexPayload = getAttributeValue(entity, "payload");
  if (!hexPayload) return fallback;

  try {
    const text = Buffer.from(hexPayload.replace(/^0x/, ""), "hex").toString("utf-8");
    const parsed = JSON.parse(text);
    return {
      swarmRef: parsed.swarmRef || fallback.swarmRef,
      registeredAt: parsed.registeredAt ?? fallback.registeredAt,
    };
  } catch {
    return fallback;
  }
}

function isSameAddress(addr1: string, addr2: string): boolean {
  if (!addr1 || !addr2) return false;
  const clean1 = addr1.trim().toLowerCase().replace(/^0x/, "");
  const clean2 = addr2.trim().toLowerCase().replace(/^0x/, "");
  return clean1 === clean2;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");
    const ownerWalletRaw = formData.get("ownerWallet");

    // Validate image presence
    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid image file in request" },
        { status: 400 },
      );
    }

    // Validate connected wallet — required up front so the exact/similar checks below can
    // tell "already owned by you" apart from "owned by someone else" before anything is written.
    if (!ownerWalletRaw || !isValidEthereumAddress(ownerWalletRaw)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid ownerWallet address (expected 0x... 40 hex chars)",
        },
        { status: 400 },
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    if (imageBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded image file is empty" },
        { status: 400 },
      );
    }

    const mimeType = imageFile.type || "image/png";
    const ownerWallet = ownerWalletRaw.trim().toLowerCase();

    // 1. Compute 64-bit perceptual hash & buckets (client-free heavy compute)
    const pHashResult = await computePHash(imageBuffer);
    const buckets = {
      b0: pHashResult.b0,
      b1: pHashResult.b1,
      b2: pHashResult.b2,
      b3: pHashResult.b3,
    };

    // 2. CHECK ARKIV FIRST — read-only queries via publicClient (no gas, no MetaMask popup).
    //    Nothing below this point touches Swarm or Arkiv writes until proven clean.

    // 2a. Exact match check
    const exactMatch = await findExactImage(pHashResult.fullHash);
    if (exactMatch) {
      const owner = getEntityOwner(exactMatch);
      const { registeredAt } = parseEntityPayload(exactMatch);

      if (isSameAddress(owner, ownerWallet)) {
        return NextResponse.json(
          { success: true, result: { status: "ALREADY_OWNED", owner, registeredAt } },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          result: {
            status: "ALREADY_EXISTS",
            ownerWallet: owner,
            registeredAt,
            targetImageHash: pHashResult.fullHash,
          },
        },
        { status: 200 },
      );
    }

    // 2b. No exact match — search for similar images via 16-bit bucket sub-chunks
    const candidates = await findSimilarImages(buckets);
    let bestCandidate: { entity: ArkivEntity; similarity: number } | null = null;

    for (const candidate of candidates) {
      const candidateHash = getAttributeValue(candidate, "imageHash");
      if (!candidateHash) continue;

      const similarity = similarityPercent(candidateHash, pHashResult.fullHash);
      if (similarity >= 70 && (!bestCandidate || similarity > bestCandidate.similarity)) {
        bestCandidate = { entity: candidate, similarity };
      }
    }

    if (bestCandidate) {
      const owner = getEntityOwner(bestCandidate.entity);
      const targetImageHash = getAttributeValue(bestCandidate.entity, "imageHash") || "";

      if (isSameAddress(owner, ownerWallet)) {
        const { registeredAt } = parseEntityPayload(bestCandidate.entity);
        return NextResponse.json(
          {
            success: true,
            result: {
              status: "ALREADY_OWNED",
              owner,
              registeredAt,
              similarityPercent: bestCandidate.similarity,
            },
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          result: {
            status: "SIMILAR_EXISTS",
            similarityPercent: bestCandidate.similarity,
            ownerWallet: owner,
            targetImageHash,
          },
        },
        { status: 200 },
      );
    }

    // 3. Both checks returned clean — safe to upload to Swarm and register on Arkiv.
    //    Never spend a postage batch on an image that already exists anywhere on Arkiv.
    const swarm = await uploadImageToSwarm(imageBuffer, mimeType);

    return NextResponse.json(
      {
        success: true,
        result: {
          status: "PROCEED_TO_REGISTER",
          pHash: pHashResult.fullHash,
          buckets,
          swarmRef: swarm.reference,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred while processing registration";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
