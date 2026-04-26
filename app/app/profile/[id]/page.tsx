import { notFound } from "next/navigation";

import { ManagerMatchCard } from "@/components/profile/manager-match-card";
import { ProfileView } from "@/components/profile/profile-view";
import { getEngineerById, getProfileByEngineerId, getTeamBySlug } from "@/lib/data";
import { getRole } from "@/lib/session-server";
import { DEMO_MANAGER_TEAM_SLUG } from "@/lib/signals";
import type { Engineer, Profile, Team } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function ProfileByIdPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const engineer = await getEngineerById(id);
  if (!engineer) notFound();

  const [profile, role, managerTeam] = await Promise.all([
    getProfileByEngineerId(id),
    getRole(),
    getTeamBySlug(DEMO_MANAGER_TEAM_SLUG),
  ]);
  if (!profile) {
    return (
      <div className="flex flex-col gap-3 py-10">
        <h1 className="text-2xl font-semibold text-[#0a0a0a]">{engineer.name}</h1>
        <p className="text-[14px] text-[#666]">
          {engineer.title} · {engineer.team}
        </p>
        <p
          className="mt-6 text-[18px] text-[#999]"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          this engineer hasn&apos;t generated a profile yet…
        </p>
      </div>
    );
  }

  const match =
    role === "manager" && managerTeam
      ? {
          teamName: managerTeam.name,
          ...getManagerMatch(engineer, profile, managerTeam),
        }
      : null;

  return (
    <div className="flex flex-col gap-12">
      {match && (
        <ManagerMatchCard
          teamName={match.teamName}
          score={match.score}
          reasons={match.reasons}
        />
      )}
      <ProfileView engineer={engineer} profile={profile} />
    </div>
  );
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function includesAny(haystack: string, needles: string[]): boolean {
  const normalized = normalize(haystack);
  return needles.some((needle) => normalized.includes(normalize(needle)));
}

function getManagerMatch(
  engineer: Engineer,
  profile: Profile,
  team: Team
): { score: number; reasons: string[] } {
  const profileTerms = [
    ...profile.techStack,
    ...profile.skills.map((skill) => skill.name),
    ...profile.skills.flatMap((skill) => skill.evidence),
    ...profile.projectThemes.map((theme) => theme.title),
    ...engineer.preferences.interests,
    ...engineer.preferences.growthGoals,
  ];
  const matchedTech = team.techStack.filter((tech) =>
    profile.techStack.some(
      (profileTech) => normalize(profileTech) === normalize(tech)
    )
  );
  const matchedGaps = team.skillGaps.filter((gap) =>
    includesAny(gap, profileTerms)
  );
  const matchedProjects = team.currentProjects.filter((project) =>
    includesAny(
      `${project.title} ${project.description} ${project.problem}`,
      profileTerms
    )
  );

  const score = Math.min(
    98,
    35 +
      matchedTech.length * 7 +
      matchedGaps.length * 13 +
      matchedProjects.length * 10 +
      (engineer.preferences.openToTransfer ? 6 : 0)
  );
  const reasons = [
    matchedTech.length > 0
      ? `Stack overlap: ${matchedTech.slice(0, 3).join(", ")}`
      : null,
    matchedGaps.length > 0 ? `Skill-gap match: ${matchedGaps[0]}` : null,
    matchedProjects.length > 0
      ? `Project relevance: ${matchedProjects[0].title}`
      : null,
    engineer.preferences.openToTransfer ? "Open to internal transfer" : null,
  ].filter((reason): reason is string => reason !== null);

  return { score, reasons };
}
