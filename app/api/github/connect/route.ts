import { NextResponse } from "next/server";
import { buildAuthorizeUrl, issueState } from "@/lib/github-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await issueState();
  const url = buildAuthorizeUrl(state);
  return NextResponse.redirect(url, { status: 302 });
}
