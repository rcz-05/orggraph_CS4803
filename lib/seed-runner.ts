/**
 * Seed runner — pre-generates `data/profiles.json` from the mock artifacts in
 * `data/artifacts/<engineerId>/`. Run once (or whenever the artifacts change).
 *
 *   npm run seed:profiles            # all engineers
 *   npm run seed:profiles eng-rayan  # just one
 *
 * Requires `OPENROUTER_API_KEY` in the environment (set in `.env.local`). Per
 * ARCHITECTURE.md DR-004 the demo never calls profile generation live — the
 * committed `data/profiles.json` is what the UI renders.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { ProfileSchema, EngineerSchema, type Engineer, type Profile } from "./schemas";
import { generateProfile } from "./profile-pipeline";

const MODEL_LABEL = "openrouter/free";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const ENGINEERS_FILE = path.join(DATA, "engineers.json");
const PROFILES_FILE = path.join(DATA, "profiles.json");

async function loadEngineers(): Promise<Engineer[]> {
  const raw = await fs.readFile(ENGINEERS_FILE, "utf-8");
  const parsed = JSON.parse(raw) as unknown[];
  return parsed.map((r) => EngineerSchema.parse(r));
}

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "OPENROUTER_API_KEY is not set. Add it to .env.local."
    );
    process.exit(1);
  }

  const targetId = process.argv[2];
  const engineers = await loadEngineers();
  const queue = targetId
    ? engineers.filter((e) => e.id === targetId)
    : engineers;

  if (queue.length === 0) {
    console.error(`No engineers matched ${targetId ?? "(all)"}.`);
    process.exit(1);
  }

  console.log(
    `Generating profiles for ${queue.length} engineer(s) using ${MODEL_LABEL}...`
  );

  const existing: Profile[] = await (async () => {
    try {
      const raw = await fs.readFile(PROFILES_FILE, "utf-8");
      const parsed = JSON.parse(raw) as unknown[];
      return parsed.map((r) => ProfileSchema.parse(r));
    } catch {
      return [];
    }
  })();

  const out = new Map<string, Profile>(existing.map((p) => [p.engineerId, p]));

  for (const eng of queue) {
    process.stdout.write(`  ${eng.id} (${eng.name}) ... `);
    const t0 = Date.now();
    try {
      const profile = await generateProfile(eng);
      out.set(eng.id, profile);
      console.log(`ok (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (err) {
      console.log("FAILED");
      console.error(err);
      process.exitCode = 1;
    }
  }

  const ordered = engineers
    .map((e) => out.get(e.id))
    .filter((p): p is Profile => Boolean(p));

  await fs.writeFile(PROFILES_FILE, JSON.stringify(ordered, null, 2) + "\n");
  console.log(
    `\nWrote ${ordered.length} profile(s) to ${path.relative(ROOT, PROFILES_FILE)}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
