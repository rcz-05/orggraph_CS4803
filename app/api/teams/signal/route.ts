import { appendSignal } from "@/lib/signals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { teamSlug?: string; engineerId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { teamSlug, engineerId } = body;
  if (!teamSlug || !engineerId) {
    return Response.json(
      { error: "teamSlug and engineerId required" },
      { status: 400 }
    );
  }

  await appendSignal({
    teamSlug,
    engineerId,
    at: new Date().toISOString(),
  });

  return Response.json({ ok: true, message: "Manager notified" });
}
