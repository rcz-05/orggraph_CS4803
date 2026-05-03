import type { Engineer, Profile, Team } from "../schemas";

export const TEAM_FIT_SYSTEM_PROMPT = `You are OrgGraph's internal team discovery matcher. Given one engineer profile and a list of internal teams, choose the 3 best-fit teams for that engineer.

Rules:
- You MUST return a JSON object that matches the schema exactly. No markdown, no prose, no extra keys.
- Top-level object MUST have exactly one key: "recommendations".
- "recommendations" MUST be an array of exactly 3 objects.
- Each recommendation object MUST have exactly these keys: "teamSlug", "score", "reasons".
- "teamSlug" MUST be one of the provided team slug strings.
- "score" MUST be an integer number from 0 to 100. Do not use decimals.
- "reasons" MUST be an array of 1 to 3 strings. Never return more than 3 reasons.
- Use only the engineer profile, preferences, and team data provided. Do NOT invent skills, projects, or experience.
- Rank teams by likely mutual fit: where the engineer's demonstrated work, preferred growth areas, tech stack, and interests overlap with the team's current projects, skill gaps, mission, and stack.
- Default weighting:
  - Skill-gap overlap: 30% — the engineer has evidence for skills the team explicitly needs.
  - Project/domain overlap: 25% — prior work maps to the team's current projects, mission, owned services, or problem space.
  - Tech stack overlap: 20% — demonstrated technologies match the team's stack.
  - Growth-interest fit: 15% — engineer interests and growth goals align with the team.
  - Evidence strength: 10% — prefer specific, repeated, high-confidence evidence over loose keyword overlap.
- Return exactly 3 teams when at least 3 teams are provided.
- Scores must be 0-100 and sorted descending.
- For each team, return 1-3 reasons only. Each reason should be short, concrete, and evidence-backed.
- Match this exact response shape and do not include anything outside this JSON object:
{
  "recommendations": [
    {
      "teamSlug": "fraud-platform",
      "score": 92,
      "reasons": [
        "Fraud-scoring ownership maps directly to the team's current work.",
        "Postgres and Redis evidence overlaps with the team's stack.",
        "Idempotency work matches a listed skill gap."
      ]
    },
    {
      "teamSlug": "payments-architecture",
      "score": 88,
      "reasons": [
        "Payment migration evidence aligns with money-movement architecture.",
        "RFC ownership matches the team's cross-team design needs."
      ]
    },
    {
      "teamSlug": "security-platform",
      "score": 74,
      "reasons": [
        "Operational safety work is relevant to secure platform reliability."
      ]
    }
  ]
}`;

type CompactEngineerProfile = {
  engineer: {
    id: string;
    name: string;
    title: string;
    currentTeam: string;
    interests: string[];
    growthGoals: string[];
    openToTransfer: boolean;
  };
  profile: {
    summary: string;
    techStack: string[];
    skills: Array<{
      name: string;
      confidence: "low" | "medium" | "high";
      evidence: string[];
    }>;
    projectThemes: Array<{
      title: string;
      summary: string;
      description: string;
    }>;
  };
};

type CompactTeam = {
  slug: string;
  name: string;
  mission: string;
  techStack: string[];
  projectTypes: string[];
  currentProjects: Array<{
    title: string;
    description: string;
    problem: string;
  }>;
  ownedServices: string[];
  skillGaps: string[];
};

function compactProfile(
  engineer: Engineer,
  profile: Profile
): CompactEngineerProfile {
  return {
    engineer: {
      id: engineer.id,
      name: engineer.name,
      title: engineer.title,
      currentTeam: engineer.team,
      interests: engineer.preferences.interests,
      growthGoals: engineer.preferences.growthGoals,
      openToTransfer: engineer.preferences.openToTransfer,
    },
    profile: {
      summary: profile.summary,
      techStack: profile.techStack,
      skills: profile.skills.map((skill) => ({
        name: skill.name,
        confidence: skill.confidence,
        evidence: skill.evidence.slice(0, 2),
      })),
      projectThemes: profile.projectThemes.map((theme) => ({
        title: theme.title,
        summary: theme.summary,
        description: theme.description,
      })),
    },
  };
}

function compactTeam(team: Team): CompactTeam {
  return {
    slug: team.slug,
    name: team.name,
    mission: team.mission,
    techStack: team.techStack,
    projectTypes: team.projectTypes,
    currentProjects: team.currentProjects.map((project) => ({
      title: project.title,
      description: project.description,
      problem: project.problem,
    })),
    ownedServices: team.ownedServices,
    skillGaps: team.skillGaps,
  };
}

export function buildTeamFitUserPrompt(
  engineer: Engineer,
  profile: Profile,
  teams: Team[]
): string {
  return `# Engineer profile
${JSON.stringify(compactProfile(engineer, profile), null, 2)}

# Available teams
${JSON.stringify(teams.map(compactTeam), null, 2)}

# Instructions
- Pick the 3 strongest team fits for this engineer.
- Use team slugs exactly as provided.
- Return a JSON object with exactly this TypeScript shape:
  { recommendations: Array<{ teamSlug: string; score: number; reasons: string[] }> }
- Return exactly 3 recommendations.
- Each score must be an integer from 0 to 100.
- Each reasons array must contain 1 to 3 strings, never more.
- Return reasons that explain why the engineer fits the team's current work or skill gaps.
- Do not include markdown or explanatory text outside the JSON object.`;
}
