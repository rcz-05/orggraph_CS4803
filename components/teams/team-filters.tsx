"use client";

import { useMemo, useState } from "react";

import { TeamCard } from "./team-card";
import { Eyebrow } from "@/components/shared/eyebrow";
import { cn } from "@/lib/utils";
import type { Team } from "@/lib/schemas";

type Props = { teams: Team[] };

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export function TeamFiltersAndList({ teams }: Props) {
  const [tech, setTech] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-8">
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
