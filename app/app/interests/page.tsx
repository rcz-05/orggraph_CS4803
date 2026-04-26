import { Bell } from "lucide-react";

import { InterestCenter } from "@/components/interests/interest-center";
import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { getEngineers, getTeams } from "@/lib/data";
import { getRole } from "@/lib/session-server";
import {
  DEMO_ENGINEER_ID,
  DEMO_MANAGER_TEAM_SLUG,
  readAllSignals,
} from "@/lib/signals";

export const dynamic = "force-dynamic";

export default async function InterestsPage() {
  const [role, teams, engineers, signals] =
    await Promise.all([
      getRole(),
      getTeams(),
      getEngineers(),
      readAllSignals(),
    ]);

  const managedTeam =
    teams.find((team) => team.slug === DEMO_MANAGER_TEAM_SLUG) ?? null;
  const engineerId = DEMO_ENGINEER_ID;
  const scopedSignals =
    role === "manager"
      ? managedTeam
        ? signals.filter((signal) => signal.teamSlug === managedTeam.slug)
        : []
      : signals.filter((signal) => signal.engineerId === engineerId);

  return (
    <div className="flex flex-col gap-10 py-4">
      <header className="flex flex-col gap-3">
        <Eyebrow>
          {role === "manager" ? "Team interest inbox" : "Your sent interests"}
        </Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <CaveatHeading as="h1">
            {role === "manager" ? "Warm leads for your team." : "Teams you reached out to."}
          </CaveatHeading>
          <Bell className="h-5 w-5 text-[#bbb]" />
        </div>
        <p className="max-w-2xl text-[14px] leading-[1.65] text-[#666]">
          {role === "manager"
            ? "Review engineers who signaled interest in your managed team. Track read status, star strong leads, and add follow ups."
            : "Track the teams you signaled, why you reached out, and any follow ups from managers."}
        </p>
      </header>

      <InterestCenter
        key={`${role}:${role === "manager" ? managedTeam?.slug ?? "none" : engineerId}`}
        role={role}
        currentEngineerId={engineerId}
        managedTeam={managedTeam}
        initialSignals={scopedSignals}
        teams={teams}
        engineers={engineers}
      />
    </div>
  );
}
