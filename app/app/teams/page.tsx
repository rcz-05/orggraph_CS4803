import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import {
  TeamFiltersAndList,
  type TeamFit,
} from "@/components/teams/team-filters";
import { getEngineerById, getProfileByEngineerId, getTeams } from "@/lib/data";
import { getRole } from "@/lib/session-server";
import { DEMO_ENGINEER_ID } from "@/lib/signals";
import type { Engineer, Profile, Team } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const [teams, engineer, profile, role] = await Promise.all([
    getTeams(),
    getEngineerById(DEMO_ENGINEER_ID),
    getProfileByEngineerId(DEMO_ENGINEER_ID),
    getRole(),
  ]);
  const bestFits =
    role === "engineer" && engineer && profile
      ? getBestFitTeams(teams, engineer, profile)
      : [];

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
      <TeamFiltersAndList teams={teams} bestFits={bestFits} />
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

function getBestFitTeams(
  teams: Team[],
  engineer: Engineer,
  profile: Profile
): TeamFit[] {
  const profileTerms = [
    ...profile.techStack,
    ...profile.skills.map((skill) => skill.name),
    ...profile.projectThemes.map((theme) => theme.title),
    ...engineer.preferences.interests,
    ...engineer.preferences.growthGoals,
  ];

  return teams
    .map((team) => {
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
      const matchedTypes = team.projectTypes.filter((type) =>
        includesAny(type, engineer.preferences.interests)
      );

      const score = Math.min(
        98,
        38 +
          matchedTech.length * 7 +
          matchedGaps.length * 12 +
          matchedProjects.length * 10 +
          matchedTypes.length * 6
      );
      const reasons = [
        matchedTech.length > 0
          ? `Stack overlap: ${matchedTech.slice(0, 3).join(", ")}`
          : null,
        matchedGaps.length > 0
          ? `Skill-gap match: ${matchedGaps[0]}`
          : null,
        matchedProjects.length > 0
          ? `Project fit: ${matchedProjects[0].title}`
          : null,
        matchedTypes.length > 0 ? `Interest match: ${matchedTypes[0]}` : null,
      ].filter((reason): reason is string => reason !== null);

      return { teamSlug: team.slug, score, reasons };
    })
    .filter((fit) => fit.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
