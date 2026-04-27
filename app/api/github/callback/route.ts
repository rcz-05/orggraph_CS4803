import { NextResponse, type NextRequest } from "next/server";
import {
  consumeState,
  exchangeCodeForToken,
  setTokenCookie,
} from "@/lib/github-oauth";

export const dynamic = "force-dynamic";

const PROFILE_URL = "/app/profile";

function redirectWith(req: NextRequest, params: Record<string, string>) {
  const url = new URL(PROFILE_URL, req.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url, { status: 302 });
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const code = search.get("code");
  const state = search.get("state");
  const error = search.get("error");

  if (error) {
    // User clicked "Cancel" on the GitHub consent screen.
    return redirectWith(req, { gh: "cancelled" });
  }
  if (!code || !state) {
    return redirectWith(req, { gh: "error", reason: "missing_params" });
  }

  const expected = await consumeState();
  if (!expected || expected !== state) {
    return redirectWith(req, { gh: "error", reason: "bad_state" });
  }

  try {
    const token = await exchangeCodeForToken(code);
    await setTokenCookie(token);
    return redirectWith(req, { gh: "connected" });
  } catch (err) {
    console.error("GitHub OAuth callback failed:", err);
    return redirectWith(req, { gh: "error", reason: "exchange_failed" });
  }
}
