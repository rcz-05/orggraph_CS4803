import { promises as fs } from "node:fs";
import path from "node:path";
import {
  EngineerSchema,
  ProfileSchema,
  TeamSchema,
  type Engineer,
  type Profile,
  type Team,
} from "./schemas";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(dataDir, file), "utf-8");
  return JSON.parse(raw) as T;
}

export async function getEngineers(): Promise<Engineer[]> {
  const raw = await readJson<unknown[]>("engineers.json");
  return raw.map((r) => EngineerSchema.parse(r));
}

export async function getEngineerById(id: string): Promise<Engineer | null> {
  const all = await getEngineers();
  return all.find((e) => e.id === id) ?? null;
}

export async function getTeams(): Promise<Team[]> {
  const raw = await readJson<unknown[]>("teams.json");
  return raw.map((r) => TeamSchema.parse(r));
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const all = await getTeams();
  return all.find((t) => t.slug === slug) ?? null;
}

export async function getProfiles(): Promise<Profile[]> {
  try {
    const raw = await readJson<unknown[]>("profiles.json");
    return raw.map((r) => ProfileSchema.parse(r));
  } catch {
    return [];
  }
}

export async function getProfileByEngineerId(
  engineerId: string
): Promise<Profile | null> {
  const all = await getProfiles();
  return all.find((p) => p.engineerId === engineerId) ?? null;
}
