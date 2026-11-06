import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit-core/signing";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }
    const configuredAction = required("WORLD_ACTION");
    if (action !== configuredAction && !action.startsWith("approve-likeness:")) {
      return NextResponse.json({ error: "action is not allowed for the spike" }, { status: 400 });
    }

    const signature = signRequest({
      signingKeyHex: required("WORLD_SIGNING_KEY"),
      action,
      ttl: 300,
    });

    return NextResponse.json({
      appId: required("WORLD_APP_ID") as `app_${string}`,
      rpId: required("WORLD_RP_ID"),
      environment: (process.env.WORLD_ENV as "staging" | "production" | "sandbox") ?? "sandbox",
      action,
      ...signature,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
