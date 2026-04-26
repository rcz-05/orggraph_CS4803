import type { Engineer, Profile } from "../schemas";

export const SEARCH_SYSTEM_PROMPT = `You are OrgGraph's internal talent matcher. A hiring manager gives you a free-text query (e.g. "fraud detection", "who has React experience?") and a JSON list of engineer profiles. You return a ranked list of candidates.

Rules:
- Score each engineer 0-100 by how well their profile EVIDENCE matches the query. Use only what the profile contains. Do NOT invent skills, projects, or experience.
- Calibration:
  - 85-100: profile has multiple high-confidence skills or project themes that directly match the query.
  - 60-84: at least one strong, evidence-backed match.
  - 30-59: tangential or partial match (related stack, helper-level involvement).
  - 0-29: no real signal. Omit anyone scoring under 30 unless fewer than 3 candidates have any signal at all.
- Return the array sorted by matchScore descending.
- For each candidate, list 1-4 \`matchedSkills\` — exact skill names from their profile that drove the match.
- \`reason\` is one short sentence (under 25 words) citing the strongest evidence (e.g. "Led the Stripe migration and owns the fraud-rules query path.").
- Set \`openToTransfer\` from the engineer record (the user provides it inline; do not re-derive).
- Output MUST validate against the SearchResult[] schema you've been bound to.
- If nothing matches, return an empty array.`;

type CompactProfile = {
  engineerId: string;
  name: string;
  title: string;
  team: string;
  openToTransfer: boolean;
  summary: string;
  skills: Array<{ name: string; confidence: "low" | "medium" | "high"; evidence: string[] }>;
  projectThemes: Array<{ title: string; description: string }>;
};

function compactProfile(profile: Profile, engineer: Engineer): CompactProfile {
  return {
    engineerId: profile.engineerId,
    name: engineer.name,
    title: engineer.title,
    team: engineer.team,
    openToTransfer: engineer.preferences.openToTransfer,
    summary: profile.summary,
    skills: profile.skills.map((s) => ({
      name: s.name,
      confidence: s.confidence,
      evidence: s.evidence.slice(0, 2),
    })),
    projectThemes: profile.projectThemes.map((t) => ({
      title: t.title,
      description: t.description,
    })),
  };
}

export function buildSearchUserPrompt(
  query: string,
  profiles: Profile[],
  engineers: Engineer[]
): string {
  const byId = new Map(engineers.map((e) => [e.id, e]));
  const compact = profiles
    .map((p) => {
      const eng = byId.get(p.engineerId);
      if (!eng) return null;
      return compactProfile(p, eng);
    })
    .filter((c): c is CompactProfile => c !== null);

  return `# Hiring manager query
${query}

# Available engineer profiles (compact JSON)
${JSON.stringify(compact, null, 2)}

# Instructions
- Rank these engineers against the query.
- Use only their profile evidence; no invention.
- Return a SearchResult[] sorted by matchScore desc.
- Cite the strongest specific evidence in \`reason\`.`;
}
