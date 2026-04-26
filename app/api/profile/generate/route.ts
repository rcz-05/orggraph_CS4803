import { promises as fs } from "node:fs";
import path from "node:path";

import { generateProfile } from "@/lib/profile-pipeline";
import { getEngineerById } from "@/lib/data";
import { ProfileSchema, type Profile } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROFILES_FILE = path.join(process.cwd(), "data", "profiles.json");

export async function POST(req: Request) {
  let body: { engineerId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const engineerId = body.engineerId;
  if (!engineerId) {
    return Response.json({ error: "engineerId required" }, { status: 400 });
  }

  const engineer = await getEngineerById(engineerId);
  if (!engineer) {
    return Response.json({ error: `Unknown engineerId: ${engineerId}` }, { status: 404 });
  }

  let profile: Profile;
  try {
    profile = await generateProfile(engineer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return Response.json({ error: message }, { status: 500 });
  }

  const existing: Profile[] = await (async () => {
    try {
      const raw = await fs.readFile(PROFILES_FILE, "utf-8");
      const parsed = JSON.parse(raw) as unknown[];
      return parsed.map((r) => ProfileSchema.parse(r));
    } catch {
      return [];
    }
  })();

  const filtered = existing.filter((p) => p.engineerId !== engineerId);
  filtered.push(profile);
  await fs.writeFile(PROFILES_FILE, JSON.stringify(filtered, null, 2) + "\n");

  return Response.json(profile);
}
