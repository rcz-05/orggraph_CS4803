import { NextResponse, type NextRequest } from "next/server";
import { buildAuthorizeUrl, issueState } from "@/lib/github-oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("return_to");
  const state = await issueState(returnTo);
  const url = buildAuthorizeUrl(state);
  return NextResponse.redirect(url, { status: 302 });
}
