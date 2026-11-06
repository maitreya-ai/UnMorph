import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { signRequest } from "@worldcoin/idkit-core/signing";

const labels = new Set([
  "A-fixed-action-1",
  "A-fixed-action-2",
  "B-dynamic-action-1",
  "B-dynamic-action-2",
  "C-replay-same-proof",
]);
const lastProofPath = "spike-last-proof.json";

type StoredProof = {
  proof: Record<string, unknown>;
  action: string;
  signal: string;
  nonce: string;
};

const loadLocalEnv = (): void => {
  if (!existsSync(".env.local")) return;

  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/u)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/u);
    if (!match || match[1] in process.env) continue;

    const value = match[2].replace(/^(['"])(.*)\1$/u, "$2");
    process.env[match[1]] = value;
  }
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const requestSignal = (label: string): string =>
  `0x${createHash("sha256")
    .update(
      canonical({
        requestId: `${label}-${Date.now()}`,
        faceId: "spike-face",
        sceneId: "spike-scene",
        purposeId: "spike-purpose",
        requesterId: "spike-requester",
        createdAt: new Date().toISOString(),
        nonce: randomUUID(),
      }),
    )
    .digest("hex")}`;

const run = async (label: string) => {
  const baseUrl = process.env.SPIKE_BASE_URL ?? "http://localhost:3000";
  if (!labels.has(label)) {
    throw new Error(`Unknown label. Use one of: ${[...labels].join(", ")}`);
  }

  if (label === "C-replay-same-proof") {
    if (!existsSync(lastProofPath)) {
      throw new Error("No stored proof. Complete A-fixed-action-1 first.");
    }
    const stored = JSON.parse(await readFile(lastProofPath, "utf8")) as StoredProof;
    const response = await fetch(`${baseUrl}/api/spike/verify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-spike-action": stored.action,
        "x-spike-signal": stored.signal,
        "x-spike-nonce": stored.nonce,
      },
      body: JSON.stringify(stored.proof),
    });
    console.log(`C-replay-same-proof HTTP ${response.status}`);
    return;
  }

  const fixedAction = required("WORLD_ACTION");
  const requestId = `${label}-${Date.now()}-${randomUUID()}`;
  const action = label.startsWith("A-") ? fixedAction : `approve-likeness:${requestId}`;
  const signature = signRequest({
    signingKeyHex: required("WORLD_SIGNING_KEY"),
    action,
    ttl: 300,
  });
  const signal = requestSignal(label);
  const query = new URLSearchParams({
    app_id: required("WORLD_APP_ID"),
    rp_id: required("WORLD_RP_ID"),
    environment: process.env.WORLD_ENV ?? "sandbox",
    action,
    signal,
    nonce: signature.nonce,
    created_at: String(signature.createdAt),
    expires_at: String(signature.expiresAt),
    sig: signature.sig,
    label,
  });
  console.log(`Open on desktop: ${baseUrl}/spike?${query.toString()}`);
  console.log("Complete the phone flow, then return to this terminal.");
};

const report = async () => {
  if (!existsSync("spike-results.jsonl")) {
    console.log("No spike results. Q1-Q5: NOT TESTED");
    return;
  }
  const rows = (await readFile("spike-results.jsonl", "utf8"))
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  console.table(
    rows.map((row) => ({
      timestamp: row.timestamp,
      action: row.action,
      status: row.http_status,
      error: row.world_error_code,
      nullifier: row.nullifier_present,
      sybilScore: row.sybil_score ?? "N/A",
      nonceEcho: row.nonce_echoed ?? "NO",
      signalHash: row.signal_hash_echoed ?? "NO",
      elapsedMs: row.elapsed_ms,
    })),
  );
  const outcome = (selected: Record<string, unknown>[], predicate: () => boolean) =>
    selected.length === 0 ? "NOT TESTED" : predicate() ? "YES" : "NO";
  const fixed = rows.filter((row) => String(row.action) === process.env.WORLD_ACTION);
  const dynamic = rows.filter((row) => String(row.action).startsWith("approve-likeness:"));
  const succeeded = (row: Record<string, unknown>) => row.http_status === 200;
  console.log(
    `Q1 nullifier present: ${outcome(rows, () => rows.some((row) => row.nullifier_present === true))}`,
  );
  console.log(
    `Q2 fixed action passes twice: ${outcome(fixed, () => fixed.length >= 2 && fixed.slice(-2).every(succeeded))}`,
  );
  console.log(
    `Q3 dynamic action accepted and passes twice: ${outcome(dynamic, () => dynamic.length >= 2 && dynamic.slice(-2).every(succeeded))}`,
  );
  console.log(
    `Q4 signal hash matches hash_to_field: ${outcome(rows, () => rows.some((row) => row.signal_hash_echoed === row.expected_signal_hash))}`,
  );
  console.log(
    `Q5 nonce echoed: ${outcome(rows, () => rows.some((row) => Boolean(row.nonce_echoed)))}`,
  );
  console.log("Supporting rows are the table above; no result is inferred for missing runs.");
};

const [, , command, argument] = process.argv;

const main = async () => {
  loadLocalEnv();
  if (command === "run" && argument) {
    await run(argument);
  } else if (command === "report") {
    await report();
  } else {
    console.error("Usage: bun run spike run <label> | bun run spike report");
    process.exitCode = 1;
  }
};

void main();
