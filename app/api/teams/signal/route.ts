import { appendSignal, updateSignal } from "@/lib/signals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: {
    teamSlug?: string;
    engineerId?: string;
    intent?: "coffee-chat" | "role-interest";
    message?: string;
  };
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
  const at = new Date().toISOString();

  await appendSignal({
    id: `${teamSlug}:${engineerId}:${at}`,
    teamSlug,
    engineerId,
    at,
    intent: body.intent === "role-interest" ? "role-interest" : "coffee-chat",
    message: body.message?.trim() ?? "",
    read: false,
    starred: false,
    followUps: [],
  });

  return Response.json({ ok: true, message: "Manager notified" });
}

export async function PATCH(req: Request) {
  let body: {
    id?: string;
    read?: boolean;
    starred?: boolean;
    followUp?: string;
    author?: "manager" | "engineer";
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  const updated = await updateSignal(body.id, (signal) => ({
    ...signal,
    read: typeof body.read === "boolean" ? body.read : signal.read,
    starred:
      typeof body.starred === "boolean" ? body.starred : signal.starred,
    followUps: body.followUp?.trim()
      ? [
          ...signal.followUps,
          {
            at: new Date().toISOString(),
            author: body.author === "engineer" ? "engineer" : "manager",
            message: body.followUp.trim(),
          },
        ]
      : signal.followUps,
  }));

  if (!updated) {
    return Response.json({ error: "Interest not found" }, { status: 404 });
  }

  return Response.json({ signal: updated });
}
