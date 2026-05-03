import { NextResponse, type NextRequest } from "next/server";
import { buildAuthorizeUrl, issueState } from "@/lib/jira-oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("return_to");
  try {
    const state = await issueState(returnTo);
    const url = buildAuthorizeUrl(state);
    return NextResponse.redirect(url, { status: 302 });
  } catch (err) {
    // Most likely cause: env vars not set yet (Atlassian app not registered).
    // Land back on the page with a flag so the UI can render a friendly hint
    // instead of a server-error screen.
    console.error("Jira connect failed:", err);
    const fallback = returnTo && returnTo.startsWith("/") ? returnTo : "/app/demo";
    const url = new URL(fallback, req.url);
    url.searchParams.set("jira", "error");
    url.searchParams.set("reason", "not_configured");
    return NextResponse.redirect(url, { status: 302 });
  }
}
