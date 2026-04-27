import { NextResponse, type NextRequest } from "next/server";
import { clearTokenCookie } from "@/lib/github-oauth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await clearTokenCookie();
  const url = new URL("/app/profile", req.url);
  url.searchParams.set("gh", "disconnected");
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(req: NextRequest) {
  // Convenience for testing — same behavior as POST.
  return POST(req);
}
