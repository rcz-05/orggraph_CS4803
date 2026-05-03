import { generateObject } from "ai";
import { z } from "zod";

import { MODEL_FAST } from "@/lib/ai";
import {
  TEAM_FIT_SYSTEM_PROMPT,
  buildTeamFitUserPrompt,
} from "@/lib/prompts/team-fit";
import type { Engineer, Profile, Team } from "@/lib/schemas";

export type TeamFit = {
  teamSlug: string;
  score: number;
  reasons: string[];
};

const TeamFitSchema = z.object({
  teamSlug: z.string(),
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()).min(1),
});

const TeamFitResponseSchema = z.object({
  recommendations: z.array(TeamFitSchema).length(3),
});

export async function getBestFitTeams(
  teams: Team[],
  engineer: Engineer,
  profile: Profile
): Promise<TeamFit[]> {
  const knownSlugs = new Set(teams.map((team) => team.slug));
  const { object } = await generateObject({
    model: MODEL_FAST,
    schema: TeamFitResponseSchema,
    system: TEAM_FIT_SYSTEM_PROMPT,
    prompt: buildTeamFitUserPrompt(engineer, profile, teams),
    maxRetries: 0,
  });

  return object.recommendations
    .filter((fit) => knownSlugs.has(fit.teamSlug))
    .map((fit) => ({
      ...fit,
      score: Math.round(fit.score),
      reasons: fit.reasons.slice(0, 3),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
