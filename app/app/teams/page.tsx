import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { TeamFiltersAndList } from "@/components/teams/team-filters";
import { getTeams } from "@/lib/data";
import { getRole } from "@/lib/session-server";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const [teams, role] = await Promise.all([
    getTeams(),
    getRole(),
  ]);

  return (
    <div className="flex flex-col gap-10 py-4">
      <header className="flex flex-col gap-3">
        <Eyebrow>Teams · {role === "manager" ? "manager" : "engineer"} view</Eyebrow>
        <CaveatHeading as="h1">Browse internal teams.</CaveatHeading>
        <p className="max-w-2xl text-[14px] leading-[1.65] text-[#666]">
          {role === "manager"
            ? "Browse team pages, current projects, skill gaps, and recent interest from internal candidates."
            : "See what each team owns, what they&apos;re working on, and where they&apos;d welcome new help — before any role is formally posted."}
        </p>
      </header>
      <TeamFiltersAndList
        teams={teams}
        showBestFits={role === "engineer"}
      />
    </div>
  );
}
