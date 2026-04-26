/**
 * Shared profile-generation pipeline. Used by both the one-shot seed runner
 * (`lib/seed-runner.ts`) and the live API route (`app/api/profile/generate`).
 *
 * Per ARCHITECTURE.md DR-004 the demo never regenerates profiles live — the
 * route is only wired up for the empty-state "Generate my profile" button.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { generateObject } from "ai";

import { MODEL_DEFAULT } from "./ai";
import {
  ProfileSchema,
  type Engineer,
  type Profile,
} from "./schemas";
import {
  PROFILE_SYSTEM_PROMPT,
  buildProfileUserPrompt,
} from "./prompts/profile";

const ROOT = process.cwd();
const ARTIFACTS = path.join(ROOT, "data", "artifacts");

export type Artifact = { filename: string; content: string };

export async function loadArtifacts(engineerId: string): Promise<Artifact[]> {
  const dir = path.join(ARTIFACTS, engineerId);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const files = entries.filter((f) => !f.startsWith("."));
  const out: Artifact[] = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = await fs.stat(full);
    if (!stat.isFile()) continue;
    const content = await fs.readFile(full, "utf-8");
    out.push({ filename: f, content });
  }
  return out;
}

export async function generateProfile(engineer: Engineer): Promise<Profile> {
  const artifacts = await loadArtifacts(engineer.id);
  if (artifacts.length === 0) {
    throw new Error(
      `No artifacts found for ${engineer.id} at ${path.join(ARTIFACTS, engineer.id)}`
    );
  }
  const generatedAt = new Date().toISOString();
  const userPrompt = buildProfileUserPrompt(engineer, artifacts, generatedAt);

  const { object } = await generateObject({
    model: MODEL_DEFAULT,
    schema: ProfileSchema,
    system: PROFILE_SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  return {
    ...object,
    engineerId: engineer.id,
    generatedAt,
    published: false,
  };
}
