"use client";

import { useEffect, useState } from "react";
import { IDKit, selfieCheck } from "@worldcoin/idkit-core";
import QRCode from "qrcode";

type SpikeConfig = {
  appId: `app_${string}`;
  rpId: string;
  environment: "staging" | "production" | "sandbox";
  action: string;
  signal: string;
  nonce: string;
  createdAt: number;
  expiresAt: number;
  sig: string;
  label: string;
};

type Status = "waiting" | "verifying" | "approved" | "rejected";

const headerValue = (value: string): string => value;

export default function SpikePage() {
  const [config, setConfig] = useState<SpikeConfig>();
  const [status, setStatus] = useState<Status>("waiting");
  const [connectorUri, setConnectorUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [message, setMessage] = useState("");
  const [useInviteCode, setUseInviteCode] = useState(false);
  const [extractedInviteCode, setExtractedInviteCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const required = (name: string): string => {
      const value = params.get(name);
      if (!value) throw new Error(`Missing ${name}`);
      return value;
    };

    try {
      setConfig({
        appId: required("app_id") as `app_${string}`,
        rpId: required("rp_id"),
        environment: required("environment") as SpikeConfig["environment"],
        action: required("action"),
        signal: required("signal"),
        nonce: required("nonce"),
        createdAt: Number(required("created_at")),
        expiresAt: Number(required("expires_at")),
        sig: required("sig"),
        label: required("label"),
      });
    } catch (error) {
      setStatus("rejected");
      setMessage(error instanceof Error ? error.message : "Invalid spike URL");
    }
  }, []);

  const start = async () => {
    if (!config) return;
    setStatus("verifying");
    setMessage("");

    let activeConfig = config;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (activeConfig.expiresAt <= nowInSeconds + 30) {
      try {
        const sigRes = await fetch(`/api/spike/signature?action=${encodeURIComponent(activeConfig.action)}`);
        if (sigRes.ok) {
          const freshSig = await sigRes.json();
          activeConfig = {
            ...activeConfig,
            appId: freshSig.appId as `app_${string}`,
            rpId: freshSig.rpId,
            nonce: freshSig.nonce,
            createdAt: freshSig.createdAt,
            expiresAt: freshSig.expiresAt,
            sig: freshSig.sig,
            environment: freshSig.environment ?? activeConfig.environment,
          };
          setConfig(activeConfig);
        }
      } catch {
        // Fall back to original config if signature endpoint fails
      }
    }

    try {
      const configParams = {
        app_id: activeConfig.appId,
        action: activeConfig.action,
        rp_context: {
          rp_id: activeConfig.rpId,
          nonce: activeConfig.nonce,
          created_at: activeConfig.createdAt,
          expires_at: activeConfig.expiresAt,
          signature: activeConfig.sig,
        },
        allow_legacy_proofs: false,
        environment: activeConfig.environment,
        return_to: window.location.href,
      };

      const builder = useInviteCode
        ? IDKit.requestWithInviteCode(configParams)
        : IDKit.request(configParams);

      const request = await builder.preset(selfieCheck({ signal: activeConfig.signal }));

      setConnectorUri(request.connectorURI);
      try {
        const uriObj = new URL(request.connectorURI);
        const code = uriObj.searchParams.get("c");
        setExtractedInviteCode(code ?? "");
      } catch {
        setExtractedInviteCode("");
      }
      setQrDataUrl(await QRCode.toDataURL(request.connectorURI));
      const completion = await request.pollUntilCompletion({
        pollInterval: 2000,
        timeout: 120000,
      });
      if (!completion.success) {
        throw new Error(`IDKit verification failed: ${completion.error}`);
      }
      const proof = completion.result;
      const response = await fetch("/api/spike/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-spike-action": headerValue(activeConfig.action),
          "x-spike-signal": headerValue(activeConfig.signal),
          "x-spike-nonce": headerValue(activeConfig.nonce),
        },
        body: JSON.stringify(proof),
      });

      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          result && typeof result === "object" && "code" in result
            ? String(result.code)
            : `World verification failed (${response.status})`,
        );
      }
      let extraInfo = "";
      if (result && typeof result === "object") {
        const results = "results" in result && Array.isArray(result.results) ? result.results[0] : null;
        if (results && typeof results === "object") {
          const score = "sybil_score" in results ? results.sybil_score : null;
          if (score !== null && score !== undefined) {
            extraInfo = ` (Sybil Score: ${score})`;
          }
        }
      }
      setStatus("approved");
      setMessage(`World verification succeeded${extraInfo}. Evidence was written to spike-results.jsonl.`);
    } catch (error) {
      setStatus("rejected");
      setMessage(error instanceof Error ? error.message : "Spike failed");
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <p><strong>WORLD ID SPIKE</strong></p>
      <h1>Selfie Check: {config?.label ?? "loading"}</h1>
      <p>Status: {status}</p>
      {config && <p>Action: <code>{config.action}</code></p>}
      {config && <p>Signal: <code>{config.signal}</code></p>}
      <div style={{ margin: "1rem 0" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={useInviteCode}
            onChange={(e) => setUseInviteCode(e.target.checked)}
            disabled={status === "verifying"}
          />
          <span><strong>Invite-Code Mode</strong> (Required for new / Cold iOS Sandbox installs)</span>
        </label>
      </div>
      <button type="button" onClick={start} disabled={!config || status === "verifying"}>
        Start Selfie Check
      </button>
      {extractedInviteCode && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#f3f4f6", borderRadius: "6px" }}>
          <strong>Invite Code:</strong> <code>{extractedInviteCode}</code>
          <span style={{ display: "block", fontSize: "12px", color: "#666", marginTop: "4px" }}>
            If the iOS Sandbox app asks for an invite code during sign up, enter the code above.
          </span>
        </div>
      )}
      {connectorUri && (
        <section style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <p style={{ fontWeight: "bold", color: "#d97706" }}>
            Important: Do NOT scan with your phone's default camera app.
          </p>
          <p>
            1. Open the <strong>Sandbox World ID App</strong> (installed via TestFlight or Google Play Beta track).<br />
            2. Tap the <strong>QR Scanner icon</strong> inside the app (top right of the ID/Home screen).<br />
            3. Scan the QR code below from inside the Sandbox app.
          </p>
          {qrDataUrl && (
            <div style={{ margin: "1rem 0" }}>
              <img src={qrDataUrl} alt="World App verification QR code" width={280} height={280} />
            </div>
          )}
          <div style={{ marginTop: "1rem", lineHeight: "1.6" }}>
            <p><strong>Testing on the same phone?</strong></p>
            <p style={{ fontSize: "13px", color: "#444" }}>
              Because the main production World App intercepts standard <code>world.org</code> web links, tapping a link directly in Safari will open the wrong app. Use one of these options:
            </p>
            <ul style={{ fontSize: "13px", paddingLeft: "1.2rem" }}>
              <li>
                <strong>Option A (Staging Scheme):</strong>{" "}
                <a href={connectorUri.replace(/^https:\/\/sandbox\.world\.org\/verify/u, "worldappstg://verify")}>
                  Open via <code>worldappstg://</code> scheme
                </a>
              </li>
              <li>
                <strong>Option B (Universal Link):</strong> Long-press this{" "}
                <a href={connectorUri} target="_blank" rel="noopener noreferrer">
                  Universal Link
                </a>{" "}
                and tap <em>"Open in WorldID"</em> (the TestFlight app) instead of the default.
              </li>
              <li>
                <strong>Option C (Cross-Device - Recommended):</strong> Keep this page open on your PC/Mac monitor and scan the QR code above from the in-app scanner inside your TestFlight app.
              </li>
            </ul>
          </div>
          <details style={{ marginTop: "1rem" }}>
            <summary style={{ cursor: "pointer", color: "#666" }}>Raw Connector URI</summary>
            <pre style={{ fontSize: "11px", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>{connectorUri}</pre>
          </details>
        </section>
      )}
      {message && <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>}
    </main>
  );
}
