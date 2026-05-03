"use client";

import { useEffect, useMemo, useState } from "react";

import { TeamCard } from "./team-card";
import { Eyebrow } from "@/components/shared/eyebrow";
import { cn } from "@/lib/utils";
import type { Team } from "@/lib/schemas";

export type TeamFit = {
  teamSlug: string;
  score: number;
  reasons: string[];
};

type Props = {
  teams: Team[];
  showBestFits?: boolean;
};

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export function TeamFiltersAndList({ teams, showBestFits = false }: Props) {
  const [tech, setTech] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const [bestFits, setBestFits] = useState<TeamFit[]>([]);
  const [bestFitsLoading, setBestFitsLoading] = useState(showBestFits);
  const [bestFitsError, setBestFitsError] = useState<string | null>(null);

  useEffect(() => {
    if (!showBestFits) return;

    let cancelled = false;

    async function loadBestFits() {
      setBestFitsLoading(true);
      setBestFitsError(null);

      try {
        const res = await fetch("/api/teams/recommendations", {
          cache: "no-store",
        });
        const text = await res.text();
        const data = text
          ? (JSON.parse(text) as {
              recommendations?: TeamFit[];
              error?: string;
            })
          : {};

        if (!res.ok) {
          throw new Error(
            data.error ?? `Could not rank teams (${res.status})`
          );
        }

        if (!cancelled) {
          setBestFits(data.recommendations ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setBestFitsError(
            err instanceof Error ? err.message : "Could not rank teams"
          );
        }
      } finally {
        if (!cancelled) {
          setBestFitsLoading(false);
        }
      }
    }

    void loadBestFits();

    return () => {
      cancelled = true;
    };
  }, [showBestFits]);

  const allTech = useMemo(
    () => uniqueSorted(teams.flatMap((t) => t.techStack)),
    [teams]
  );
  const allProjects = useMemo(
    () => uniqueSorted(teams.flatMap((t) => t.projectTypes)),
    [teams]
  );

  const filtered = useMemo(
    () =>
      teams.filter((t) => {
        if (tech && !t.techStack.includes(tech)) return false;
        if (project && !t.projectTypes.includes(project)) return false;
        return true;
      }),
    [teams, tech, project]
  );
  const teamsBySlug = useMemo(
    () => new Map(teams.map((team) => [team.slug, team])),
    [teams]
  );
  const bestFitTeams = bestFits
    .map((fit) => {
      const team = teamsBySlug.get(fit.teamSlug);
      return team ? { team, fit } : null;
    })
    .filter((item): item is { team: Team; fit: TeamFit } => item !== null);

  return (
    <div className="flex flex-col gap-8">
      {showBestFits && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Eyebrow>Best fit teams</Eyebrow>
            <p className="text-[13px] leading-[1.55] text-[#666]">
              AI-ranked from your profile skills, tech stack, interests, and
              each team&apos;s current skill gaps.
            </p>
          </div>
          {bestFitsLoading ? (
            <div className="grid gap-5 md:grid-cols-3">
              <BestFitSkeleton />
              <BestFitSkeleton />
              <BestFitSkeleton />
            </div>
          ) : bestFitsError ? (
            <p className="rounded-2xl border border-dashed border-[#b5c5d6] bg-[#dce4ef]/45 p-5 text-[13px] text-[#3a566e]">
              Best fit ranking failed: {bestFitsError}
            </p>
          ) : bestFitTeams.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {bestFitTeams.map(({ team, fit }) => (
                <TeamCard
                  key={team.slug}
                  team={team}
                  fitScore={fit.score}
                  fitReasons={fit.reasons}
                />
              ))}
            </div>
          ) : null}
        </section>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[#eee] bg-[#fafafa] p-5">
        <FilterRow
          eyebrow="Project type"
          options={allProjects}
          selected={project}
          onSelect={setProject}
        />
        <FilterRow
          eyebrow="Tech stack"
          options={allTech}
          selected={tech}
          onSelect={setTech}
        />
        {(tech || project) && (
          <button
            type="button"
            onClick={() => {
              setTech(null);
              setProject(null);
            }}
            className="self-start text-[11px] font-medium text-[#999] underline-offset-2 hover:text-[#0a0a0a] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p
          className="rounded-2xl border border-dashed border-[#ddd] p-8 text-center text-[18px] text-[#999]"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          no teams match these filters yet…
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TeamCard key={t.slug} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function BestFitSkeleton() {
  return (
    <div className="flex min-h-[260px] animate-pulse flex-col gap-4 rounded-2xl bg-[#dce4ef] p-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded-full bg-[#b5c5d6]" />
        <div className="h-3 w-12 rounded-full bg-[#b5c5d6]/70" />
      </div>
      <div className="h-8 w-2/3 rounded-md bg-white/50" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded-full bg-[#b5c5d6]/60" />
        <div className="h-3 w-5/6 rounded-full bg-[#b5c5d6]/60" />
        <div className="h-3 w-4/6 rounded-full bg-[#b5c5d6]/60" />
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        <div className="h-5 w-16 rounded-md bg-white/50" />
        <div className="h-5 w-20 rounded-md bg-white/50" />
        <div className="h-5 w-14 rounded-md bg-white/50" />
      </div>
    </div>
  );
}

function FilterRow({
  eyebrow,
  options,
  selected,
  onSelect,
}: {
  eyebrow: string;
  options: string[];
  selected: string | null;
  onSelect: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt === selected;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(active ? null : opt)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "bg-[#3a566e] text-white"
                  : "bg-white text-[#3a566e] ring-1 ring-[#dce4ef] hover:bg-[#dce4ef]"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
