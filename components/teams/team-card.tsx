import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Team } from "@/lib/schemas";

const VISIBLE_TECH = 4;

export function TeamCard({ team }: { team: Team }) {
  const visible = team.techStack.slice(0, VISIBLE_TECH);
  const overflow = team.techStack.length - visible.length;

  return (
    <Link
      href={`/app/teams/${team.slug}`}
      className={cn(
        "group flex flex-col gap-4 rounded-2xl bg-[#dce4ef] p-6 transition-all",
        "hover:-rotate-1 hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#b5c5d6] px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[#3a566e]">
          TEAM
        </span>
        <span className="text-[11px] text-[#3a566e]/70">
          {team.ownedServices.length} services
        </span>
      </div>
      <h3
        className="text-[28px] font-bold leading-tight text-[#0a0a0a]"
        style={{ fontFamily: "var(--font-caveat), cursive" }}
      >
        {team.name}
      </h3>
      <p className="line-clamp-3 text-[13px] leading-[1.55] text-[#3a566e]">
        {team.mission}
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {visible.map((t) => (
          <span
            key={t}
            className="rounded-md bg-white/60 px-2 py-0.5 text-[11px] font-medium text-[#3a566e]"
          >
            {t}
          </span>
        ))}
        {overflow > 0 && (
          <span className="rounded-md bg-white/40 px-2 py-0.5 text-[11px] font-medium text-[#3a566e]/70">
            +{overflow}
          </span>
        )}
      </div>
    </Link>
  );
}
