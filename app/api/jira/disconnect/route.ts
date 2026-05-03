import { NextResponse, type NextRequest } from "next/server";
import { clearTokenCookie } from "@/lib/jira-oauth";
import { safeReturnTo } from "@/lib/oauth-cookie";

export const dynamic = "force-dynamic";

const DEFAULT_RETURN_TO = "/app/demo";

async function disconnect(req: NextRequest): Promise<NextResponse> {
  await clearTokenCookie();
  const requested = req.nextUrl.searchParams.get("return_to");
  const returnTo = safeReturnTo(requested, DEFAULT_RETURN_TO);
  const url = new URL(returnTo, req.url);
  url.searchParams.set("jira", "disconnected");
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  return disconnect(req);
}

export async function GET(req: NextRequest) {
  return disconnect(req);
}
