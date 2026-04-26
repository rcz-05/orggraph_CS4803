import "server-only";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Signals are written outside the project tree to avoid Next dev's file watcher
 * → Turbopack worker crash on each interest signal. The process id keeps demo
 * state session-scoped, so restarting the dev server resets to dummy data.
 */
export const SESSION_SIGNALS_FILE = path.join(
  os.tmpdir(),
  `orggraph-signals-${process.pid}.json`
);

export type Signal = {
  id: string;
  teamSlug: string;
  engineerId: string;
  at: string;
  intent: "coffee-chat" | "role-interest";
  message: string;
  read: boolean;
  starred: boolean;
  followUps: Array<{
    at: string;
    author: "manager" | "engineer";
    message: string;
  }>;
};

export const DEMO_MANAGER_TEAM_SLUG = "payments-architecture";
export const DEMO_ENGINEER_ID = "eng-rayan";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function managerInboxSeed(): Signal[] {
  return [
    {
      id: "demo-payments-interest-1",
      teamSlug: DEMO_MANAGER_TEAM_SLUG,
      engineerId: "eng-arnav",
      at: minutesAgo(18),
      intent: "role-interest",
      message:
        "I would be interested in future backend roles on Payments Architecture, especially around Postgres and payment-router reliability.",
      read: false,
      starred: true,
      followUps: [],
    },
    {
      id: "demo-payments-interest-2",
      teamSlug: DEMO_MANAGER_TEAM_SLUG,
      engineerId: "eng-tisha",
      at: minutesAgo(95),
      intent: "coffee-chat",
      message:
        "I would love a quick coffee chat to understand how frontend security and payments observability overlap on the team.",
      read: false,
      starred: false,
      followUps: [],
    },
    {
      id: "demo-payments-interest-3",
      teamSlug: DEMO_MANAGER_TEAM_SLUG,
      engineerId: "eng-sahib",
      at: minutesAgo(240),
      intent: "coffee-chat",
      message:
        "Curious how the RFC process works across Fraud Platform, Ledger, and Risk. Happy to chat if there is time this week.",
      read: true,
      starred: false,
      followUps: [
        {
          at: minutesAgo(180),
          author: "manager",
          message: "Let's set up 20 minutes after the demo rehearsal.",
        },
      ],
    },
  ];
}

function engineerSentSeed(): Signal[] {
  return [
    {
      id: "demo-rayan-sent-interest-1",
      teamSlug: "data-infra",
      engineerId: DEMO_ENGINEER_ID,
      at: minutesAgo(55),
      intent: "coffee-chat",
      message:
        "I would like to learn more about the LLM eval harness and how the data platform team thinks about model quality.",
      read: true,
      starred: true,
      followUps: [
        {
          at: minutesAgo(30),
          author: "manager",
          message: "Happy to chat. Priya can do Thursday afternoon.",
        },
      ],
    },
    {
      id: "demo-rayan-sent-interest-2",
      teamSlug: "security-platform",
      engineerId: DEMO_ENGINEER_ID,
      at: minutesAgo(150),
      intent: "role-interest",
      message:
        "I am interested in future roles where payments reliability overlaps with frontend security and incident prevention.",
      read: false,
      starred: false,
      followUps: [],
    },
  ];
}

function demoSignals(): Signal[] {
  return [...managerInboxSeed(), ...engineerSentSeed()];
}

type RawSignal = Partial<Signal> & {
  teamSlug: string;
  engineerId: string;
  at: string;
};

function signalId(signal: Pick<Signal, "teamSlug" | "engineerId" | "at">) {
  return `${signal.teamSlug}:${signal.engineerId}:${signal.at}`;
}

function normalizeSignal(raw: RawSignal): Signal {
  return {
    id: raw.id ?? signalId(raw),
    teamSlug: raw.teamSlug,
    engineerId: raw.engineerId,
    at: raw.at,
    intent: raw.intent ?? "coffee-chat",
    message: raw.message ?? "",
    read: raw.read ?? false,
    starred: raw.starred ?? false,
    followUps: raw.followUps ?? [],
  };
}

export async function readAllSignals(): Promise<Signal[]> {
  const demos = demoSignals();
  const stored = await readStoredSignals();
  const storedIds = new Set(stored.map((signal) => signal.id));
  return [
    ...stored,
    ...demos.filter((signal) => !storedIds.has(signal.id)),
  ];
}

async function readStoredSignals(): Promise<Signal[]> {
  try {
    const raw = await fs.readFile(SESSION_SIGNALS_FILE, "utf-8");
    return (JSON.parse(raw) as RawSignal[]).map(normalizeSignal);
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
  const existing = await readStoredSignals();
  existing.push(signal);
  await fs.writeFile(
    SESSION_SIGNALS_FILE,
    JSON.stringify(existing, null, 2) + "\n"
  );
}

export async function updateSignal(
  id: string,
  updater: (signal: Signal) => Signal
): Promise<Signal | null> {
  const existing = await readAllSignals();
  let updated: Signal | null = null;
  const next = existing.map((signal) => {
    if (signal.id !== id) return signal;
    updated = updater(signal);
    return updated;
  });

  if (!updated) return null;

  await fs.writeFile(
    SESSION_SIGNALS_FILE,
    JSON.stringify(next, null, 2) + "\n"
  );
  return updated;
}
