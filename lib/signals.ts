import "server-only";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Signals are written outside the project tree to avoid Next dev's file watcher
 * → Turbopack worker crash on each interest signal.
 */
export const SIGNALS_FILE = path.join(os.tmpdir(), "orggraph-signals.json");

export type Signal = {
  teamSlug: string;
  engineerId: string;
  at: string;
};

export async function readAllSignals(): Promise<Signal[]> {
  try {
    const raw = await fs.readFile(SIGNALS_FILE, "utf-8");
    return JSON.parse(raw) as Signal[];
  } catch {
    return [];
  }
}

export async function getSignalsForTeam(
  teamSlug: string,
  limit = 10
): Promise<Signal[]> {
  const all = await readAllSignals();
  return all
    .filter((s) => s.teamSlug === teamSlug)
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);
}

export async function appendSignal(signal: Signal): Promise<void> {
  const existing = await readAllSignals();
  existing.push(signal);
  await fs.writeFile(SIGNALS_FILE, JSON.stringify(existing, null, 2) + "\n");
}
