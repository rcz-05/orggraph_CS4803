"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, MessageSquare, Send, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/shared/eyebrow";
import { cn } from "@/lib/utils";
import type { Engineer, Team } from "@/lib/schemas";
import type { Role } from "@/lib/session";
import type { Signal } from "@/lib/signals";

type Props = {
  role: Role;
  currentEngineerId: string;
  managedTeam: Team | null;
  initialSignals: Signal[];
  teams: Team[];
  engineers: Engineer[];
};

type ReadFilter = "all" | "unread" | "read";

const INTENT_LABEL: Record<Signal["intent"], string> = {
  "coffee-chat": "Coffee chat",
  "role-interest": "Role interest",
};

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = then - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  if (Math.abs(diffMin) < 1) return "just now";
  if (Math.abs(diffMin) < 60) return RTF.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return RTF.format(diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  return RTF.format(diffDay, "day");
}

function latestActivityAt(signal: Signal): string {
  return signal.followUps.reduce(
    (latest, followUp) => (followUp.at > latest ? followUp.at : latest),
    signal.at
  );
}

function sortSignals(signals: Signal[]): Signal[] {
  return [...signals].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    const aActivity = latestActivityAt(a);
    const bActivity = latestActivityAt(b);
    return aActivity < bActivity ? 1 : aActivity > bActivity ? -1 : 0;
  });
}

export function InterestCenter({
  role,
  currentEngineerId,
  managedTeam,
  initialSignals,
  teams,
  engineers,
}: Props) {
  const [signals, setSignals] = useState(initialSignals);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<string, string>>(
    {}
  );
  const engineerById = useMemo(
    () => new Map(engineers.map((engineer) => [engineer.id, engineer])),
    [engineers]
  );
  const teamBySlug = useMemo(
    () => new Map(teams.map((team) => [team.slug, team])),
    [teams]
  );

  const isManager = role === "manager";

  useEffect(() => {
    setSignals(initialSignals);
    setReadFilter("all");
    setStarredOnly(false);
    setFollowUpDrafts({});
  }, [initialSignals, role, currentEngineerId, managedTeam?.slug]);

  const filteredSignals = sortSignals(
    signals.filter((signal) => {
      if (isManager && readFilter === "read" && !signal.read) return false;
      if (isManager && readFilter === "unread" && signal.read) return false;
      if (starredOnly && !signal.starred) return false;
      return true;
    })
  );

  async function patchSignal(
    id: string,
    payload: { read?: boolean; starred?: boolean; followUp?: string }
  ) {
    const res = await fetch("/api/teams/signal", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id,
        author: role === "manager" ? "manager" : "engineer",
        ...payload,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { signal: Signal };
    setSignals((current) =>
      current.map((signal) => (signal.id === id ? data.signal : signal))
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[#eee] bg-[#fafafa] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Eyebrow>
              {role === "manager" ? "Manager inbox" : "Sent interests"}
            </Eyebrow>
            <p className="text-[13px] text-[#666]">
              {role === "manager"
                ? managedTeam
                  ? `Showing signals for ${managedTeam.name}.`
                  : "No managed team is assigned to this demo identity."
                : `Showing signals sent by ${engineerById.get(currentEngineerId)?.name ?? currentEngineerId}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isManager &&
              (["all", "unread", "read"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setReadFilter(filter)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize",
                    readFilter === filter
                      ? "border-[#3a566e] bg-[#dce4ef] text-[#3a566e]"
                      : "border-[#e5e5e5] bg-white text-[#666]"
                  )}
                >
                  {filter}
                </button>
              ))}
            <button
              type="button"
              onClick={() => setStarredOnly((value) => !value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-medium",
                starredOnly
                  ? "border-[#7a6520] bg-[#f5edd0] text-[#7a6520]"
                  : "border-[#e5e5e5] bg-white text-[#666]"
              )}
            >
              <Star className={cn("h-3.5 w-3.5", starredOnly && "fill-current")} />
              Starred
            </button>
          </div>
        </div>
      </section>

      {filteredSignals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#ddd] p-10 text-center">
          <p
            className="text-[20px] text-[#999]"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            {isManager
              ? "no engineers have signaled this team yet."
              : "you haven't signaled any teams yet."}
          </p>
        </section>
      ) : (
        <ul className="flex flex-col gap-4">
          {filteredSignals.map((signal) => {
            const engineer = engineerById.get(signal.engineerId);
            const team = teamBySlug.get(signal.teamSlug);
            const draft = followUpDrafts[signal.id] ?? "";
            const activityAt = latestActivityAt(signal);

            return (
              <li
                key={signal.id}
                className={cn(
                  "rounded-2xl border bg-white p-5",
                  isManager && !signal.read ? "border-[#b5c5d6]" : "border-[#eee]"
                )}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/app/profile/${signal.engineerId}`}
                          className="text-[15px] font-semibold text-[#0a0a0a] underline-offset-2 hover:underline"
                        >
                          {engineer?.name ?? signal.engineerId}
                        </Link>
                        <span className="text-[12px] text-[#666]">to</span>
                        <Link
                          href={`/app/teams/${signal.teamSlug}`}
                          className="text-[13px] font-medium text-[#3a566e] underline-offset-2 hover:underline"
                        >
                          {team?.name ?? signal.teamSlug}
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={signal.intent === "role-interest" ? "teams" : "evidence"}>
                          {INTENT_LABEL[signal.intent]}
                        </Badge>
                        {!signal.read && role === "manager" && (
                          <Badge variant="outline">Unread</Badge>
                        )}
                        <span className="text-[11px] text-[#999]">
                          Updated {formatRelative(activityAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isManager && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            patchSignal(signal.id, { read: !signal.read })
                          }
                        >
                          <Check className="h-3.5 w-3.5" />
                          {signal.read ? "Mark unread" : "Mark read"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          patchSignal(signal.id, {
                            starred: !signal.starred,
                          })
                        }
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5",
                            signal.starred && "fill-current text-[#7a6520]"
                          )}
                        />
                        {signal.starred ? "Starred" : "Star"}
                      </Button>
                    </div>
                  </div>

                  {signal.message && (
                    <p className="rounded-xl bg-[#fafafa] px-4 py-3 text-[13px] leading-[1.6] text-[#444]">
                      {signal.message}
                    </p>
                  )}

                  {signal.followUps.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <Eyebrow>Follow ups</Eyebrow>
                      {signal.followUps.map((followUp) => (
                        <div
                          key={`${followUp.at}-${followUp.message}`}
                          className="rounded-xl border border-[#eee] px-4 py-3"
                        >
                          <p className="text-[12px] font-semibold capitalize text-[#0a0a0a]">
                            {followUp.author} · {formatRelative(followUp.at)}
                          </p>
                          <p className="mt-1 text-[13px] leading-[1.55] text-[#555]">
                            {followUp.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`follow-up-${signal.id}`}
                      className="text-[12px] font-medium text-[#666]"
                    >
                      Add follow up
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        id={`follow-up-${signal.id}`}
                        value={draft}
                        onChange={(event) =>
                          setFollowUpDrafts((current) => ({
                            ...current,
                            [signal.id]: event.target.value,
                          }))
                        }
                        placeholder={
                          role === "manager"
                            ? "Suggest a time or next step"
                            : "Add context or availability"
                        }
                        className="min-h-9 flex-1 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] focus:border-[#3a566e] focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!draft.trim()}
                        onClick={() => {
                          patchSignal(signal.id, { followUp: draft });
                          setFollowUpDrafts((current) => ({
                            ...current,
                            [signal.id]: "",
                          }));
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {role === "engineer" && (
        <Link
          href="/app/teams"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-white"
        >
          <Send className="h-4 w-4" />
          Signal another team
        </Link>
      )}
    </div>
  );
}
