import { promises as fs } from "node:fs";
import path from "node:path";

import { getEngineerById } from "@/lib/data";
import { ProfileSchema, type Profile } from "@/lib/schemas";
import {
  PipelineProfileInputSchema,
  generateProfileFromPipeline,
} from "@/lib/staged-profile-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_ENGINEER_ID = "eng-arnav-chintawar";
const PROFILES_FILE = path.join(process.cwd(), "data", "profiles.json");

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      profileInput?: unknown;
    };
    const profileInput = PipelineProfileInputSchema.parse(body.profileInput);
    const engineer = await getEngineerById(DEMO_ENGINEER_ID);

    if (!engineer) {
      return Response.json(
        { error: `Demo engineer not found: ${DEMO_ENGINEER_ID}` },
        { status: 404 }
      );
    }

    const profile = await generateProfileFromPipeline(engineer, profileInput);
    await saveProfile(profile);

    return Response.json({
      engineerId: DEMO_ENGINEER_ID,
      profile,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Phase 3 profile generation failed" },
      { status: 500 }
    );
  }
}

async function saveProfile(profile: Profile) {
  const existing: Profile[] = await (async () => {
    try {
      const raw = await fs.readFile(PROFILES_FILE, "utf-8");
      const parsed = JSON.parse(raw) as unknown[];
      return parsed.map((item) => ProfileSchema.parse(item));
    } catch {
      return [];
    }
  })();

  const next = [
    ...existing.filter((item) => item.engineerId !== profile.engineerId),
    profile,
  ];

  await fs.writeFile(PROFILES_FILE, JSON.stringify(next, null, 2) + "\n");
}
