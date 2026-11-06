import { appendFile, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { hashSignal } from "@worldcoin/idkit-core/hashing";

const RESULTS_PATH = "spike-results.jsonl";
const LAST_PROOF_PATH = "spike-last-proof.json";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const redact = (value: JsonValue, key = ""): JsonValue => {
  if (/(proof|signature|jwt|integrity_bundle|nullifier)/i.test(key)) {
    return "[REDACTED]";
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        redact(childValue, childKey),
      ]),
    );
  }
  return value;
};

const resultItem = (response: Record<string, JsonValue>): Record<string, JsonValue> | undefined => {
  const results = response.results;
  if (!Array.isArray(results)) {
    return undefined;
  }
  const item = results[0];
  return item && typeof item === "object" && !Array.isArray(item)
    ? (item as Record<string, JsonValue>)
    : undefined;
};

export async function POST(request: Request): Promise<Response> {
  const startedAt = Date.now();
  const body = await request.text();
  const requestedAction = request.headers.get("x-spike-action") ?? "";
  const signalSent = request.headers.get("x-spike-signal") ?? "";
  const requestedNonce = request.headers.get("x-spike-nonce") ?? "";
  const expectedEnvironment = process.env.WORLD_ENV ?? "sandbox";

  let proof: Record<string, JsonValue>;
  try {
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("proof must be a JSON object");
    }
    proof = parsed as Record<string, JsonValue>;
  } catch {
    return NextResponse.json({ error: "proof must be valid JSON" }, { status: 400 });
  }
  const action = typeof proof.action === "string" ? proof.action : requestedAction;
  const nonceIssued = typeof proof.nonce === "string" ? proof.nonce : requestedNonce;

  let status = 502;
  let worldResponse: Record<string, JsonValue> = {
    success: false,
    code: "world_request_failed",
  };

  try {
    const rpId = required("WORLD_RP_ID");
    const verifyBaseUrl =
      expectedEnvironment === "staging"
        ? "https://staging-developer.worldcoin.org"
        : "https://developer.world.org";

    const response = await fetch(
      `${verifyBaseUrl}/api/v4/verify/${encodeURIComponent(rpId)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      },
    );
    status = response.status;
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      worldResponse = parsed as Record<string, JsonValue>;
    }
  } catch (error) {
    worldResponse = {
      success: false,
      code: "world_request_failed",
      detail: error instanceof Error ? error.message : "World request failed",
    };
  }

  const item = resultItem(worldResponse);
  const verified =
    status >= 200 &&
    status < 300 &&
    worldResponse.success === true &&
    item?.success === true;
  const signalHashEchoed = item?.signal_hash ?? worldResponse.signal_hash ?? null;
  const nonceEchoed = worldResponse.nonce ?? item?.nonce ?? null;
  const nullifier = item?.nullifier ?? worldResponse.nullifier ?? null;
  const sybilScore = typeof item?.sybil_score === "number" ? item.sybil_score : null;
  const issuerSchemaId = typeof item?.issuer_schema_id === "number" ? item.issuer_schema_id : null;
  const credentialIdentifier = typeof item?.identifier === "string" ? item.identifier : null;

  const record = {
    timestamp: new Date().toISOString(),
    action,
    signal_sent: signalSent,
    nonce_issued: nonceIssued,
    nonce_echoed: nonceEchoed,
    signal_hash_echoed: signalHashEchoed,
    expected_signal_hash: hashSignal(signalSent),
    nullifier_present: Boolean(nullifier),
    identifier: credentialIdentifier,
    issuer_schema_id: issuerSchemaId,
    sybil_score: sybilScore,
    http_status: status,
    world_error_code: typeof worldResponse.code === "string" ? worldResponse.code : null,
    elapsed_ms: Date.now() - startedAt,
    world_response_redacted: redact(worldResponse),
  };

  await appendFile(RESULTS_PATH, `${JSON.stringify(record)}\n`, "utf8");
  if (verified) {
    await writeFile(
      LAST_PROOF_PATH,
      JSON.stringify({ proof, action, signal: signalSent, nonce: nonceIssued }),
      "utf8",
    );
  }

  if (!verified) {
    const code =
      typeof worldResponse.code === "string"
        ? worldResponse.code
        : typeof item?.code === "string"
          ? item.code
          : "world_verification_failed";
    return NextResponse.json({ success: false, code }, { status: 400 });
  }

  return NextResponse.json(worldResponse, { status: 200 });
}
