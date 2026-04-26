import { z } from "zod";

/**
 * Cross-feature contracts.
 *
 * Feature 1 (profile pipeline) PRODUCES `Profile`.
 * Feature 2 (talent search) CONSUMES `Profile` and produces `SearchResult[]`.
 * Feature 3 (team portal) PRODUCES `Team` and links to engineers by id.
 *
 * Any change here is a shared concern — open a PR to main, do not edit on a
 * feature branch only.
 */

export const PreferencesSchema = z.object({
  openToTransfer: z.boolean(),
  interests: z.array(z.string()).default([]),
  growthGoals: z.array(z.string()).default([]),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const EngineerSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  team: z.string(),
  avatarUrl: z.string().optional(),
  yearsAtCompany: z.number(),
  preferences: PreferencesSchema,
});
export type Engineer = z.infer<typeof EngineerSchema>;

export const SkillSchema = z.object({
  name: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(z.string()),
});
export type Skill = z.infer<typeof SkillSchema>;

export const ProjectThemeSchema = z.object({
  title: z.string(),
  description: z.string(),
  artifactRefs: z.array(z.string()),
});
export type ProjectTheme = z.infer<typeof ProjectThemeSchema>;

export const ContributionEvidenceSchema = z.object({
  type: z.enum(["github", "jira", "slack", "doc"]),
  summary: z.string(),
  url: z.string().optional(),
});
export type ContributionEvidence = z.infer<typeof ContributionEvidenceSchema>;

export const ProfileSchema = z.object({
  engineerId: z.string(),
  generatedAt: z.string(),
  published: z.boolean().default(false),
  summary: z.string(),
  skills: z.array(SkillSchema),
  projectThemes: z.array(ProjectThemeSchema),
  contributionEvidence: z.array(ContributionEvidenceSchema),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const SearchResultSchema = z.object({
  engineerId: z.string(),
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  reason: z.string(),
  openToTransfer: z.boolean(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const TeamSchema = z.object({
  slug: z.string(),
  name: z.string(),
  mission: z.string(),
  techStack: z.array(z.string()),
  projectTypes: z.array(z.string()),
  currentProjects: z.array(
    z.object({ title: z.string(), description: z.string() })
  ),
  ownedServices: z.array(z.string()),
  skillGaps: z.array(z.string()),
  manager: z.object({ name: z.string(), engineerId: z.string() }),
});
export type Team = z.infer<typeof TeamSchema>;
