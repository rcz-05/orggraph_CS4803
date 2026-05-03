import { NextResponse, type NextRequest } from "next/server";
import {
  consumeReturnTo,
  consumeState,
  exchangeCodeForToken,
  setTokenCookie,
} from "@/lib/jira-oauth";

export const dynamic = "force-dynamic";

function redirectWith(
  req: NextRequest,
  returnTo: string,
  params: Record<string, string>
) {
  const url = new URL(returnTo, req.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url, { status: 302 });
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const code = search.get("code");
  const state = search.get("state");
  const error = search.get("error");

  const returnTo = await consumeReturnTo();

  if (error) {
    return redirectWith(req, returnTo, { jira: "cancelled" });
  }
  if (!code || !state) {
    return redirectWith(req, returnTo, {
      jira: "error",
      reason: "missing_params",
    });
  }

  const expected = await consumeState();
  if (!expected || expected !== state) {
    return redirectWith(req, returnTo, { jira: "error", reason: "bad_state" });
  }

  try {
    const token = await exchangeCodeForToken(code);
    await setTokenCookie(token);
    return redirectWith(req, returnTo, { jira: "connected" });
  } catch (err) {
    console.error("Jira OAuth callback failed:", err);
    return redirectWith(req, returnTo, {
      jira: "error",
      reason: "exchange_failed",
    });
  }
}
