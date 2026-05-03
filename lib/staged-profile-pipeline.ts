/**
 * Staged profile-generation pipeline.
 *
 * This is intentionally not wired into the UI yet. It gives us the pipeline
 * shape from the demo:
 * 1. Condense a single commit/PR/Jira ticket/sprint into compact evidence.
 * 2. Consolidate all condensed code work from one repo.
 * 3. Generate the final OrgGraph profile from all repo summaries plus Jira.
 */

import { generateObject } from "ai";
import { z } from "zod";

import { MODEL_DEFAULT, MODEL_FAST } from "./ai";
import { loadArtifacts } from "./profile-pipeline";
import {
  ProfileSchema,
  type Engineer,
  type Profile,
} from "./schemas";
import {
  CONDENSE_WORK_ITEMS_BATCH_SYSTEM_PROMPT,
  CONDENSE_WORK_ITEM_SYSTEM_PROMPT,
  CONSOLIDATE_REPO_SYSTEM_PROMPT,
  STAGED_PROFILE_SYSTEM_PROMPT,
  buildCondenseWorkItemsBatchPrompt,
  buildCondenseWorkItemPrompt,
  buildConsolidateRepoPrompt,
  buildStagedProfilePrompt,
} from "./prompts/profile-staged";

export const WorkItemSourceSchema = z.enum([
  "github_commit",
  "github_pr",
  "jira_ticket",
  "jira_sprint",
  "internal_doc",
  "slack_thread",
  "other",
]);
export type WorkItemSource = z.infer<typeof WorkItemSourceSchema>;

export const WorkItemInputSchema = z.object({
  artifactId: z.string(),
  source: WorkItemSourceSchema,
  repo: z.string().optional(),
  title: z.string().optional(),
  date: z.string().optional(),
  raw: z.unknown(),
});
export type WorkItemInput = z.infer<typeof WorkItemInputSchema>;

export const CondensedWorkItemSchema = z.object({
  artifactId: z.string(),
  source: WorkItemSourceSchema,
  repo: z.string().optional(),
  title: z.string().default(""),
  date: z.string().default(""),
  summary: z.string(),
  technologies: z.array(z.string()).default([]),
  skillSignals: z.array(z.string()).default([]),
  domainSignals: z.array(z.string()).default([]),
  ownershipSignals: z.array(z.string()).default([]),
  collaborationSignals: z.array(z.string()).default([]),
  impactSignals: z.array(z.string()).default([]),
  evidenceRefs: z.array(z.string()).default([]),
});
export type CondensedWorkItem = z.infer<typeof CondensedWorkItemSchema>;

export const RepoWorkSummarySchema = z.object({
  repo: z.string(),
  timeRange: z.string().default(""),
  summary: z.string(),
  keyContributions: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  skillSignals: z.array(z.string()).default([]),
  domainSignals: z.array(z.string()).default([]),
  ownershipSignals: z.array(z.string()).default([]),
  collaborationSignals: z.array(z.string()).default([]),
  impactSignals: z.array(z.string()).default([]),
  evidenceRefs: z.array(z.string()).default([]),
});
export type RepoWorkSummary = z.infer<typeof RepoWorkSummarySchema>;

export const PipelineProfileInputSchema = z.object({
  repoSummaries: z.array(RepoWorkSummarySchema),
  jiraAndSprintSummaries: z.array(CondensedWorkItemSchema),
  otherSummaries: z.array(CondensedWorkItemSchema).default([]),
});
export type PipelineProfileInput = z.infer<typeof PipelineProfileInputSchema>;

export async function condenseWorkItem(
  item: WorkItemInput
): Promise<CondensedWorkItem> {
  const parsed = WorkItemInputSchema.parse(item);
  const { object } = await generateObject({
    model: MODEL_FAST,
    schema: CondensedWorkItemSchema,
    system: CONDENSE_WORK_ITEM_SYSTEM_PROMPT,
    prompt: buildCondenseWorkItemPrompt(parsed),
  });

  return {
    ...object,
    artifactId: parsed.artifactId,
    source: parsed.source,
    repo: object.repo ?? parsed.repo,
  };
}

export async function condenseWorkItemsBatch(
  items: WorkItemInput[]
): Promise<CondensedWorkItem[]> {
  const parsed = items.map((item) => WorkItemInputSchema.parse(item));
  if (parsed.length === 0) return [];

  const { object } = await generateObject({
    model: MODEL_FAST,
    schema: z.object({
      items: z.array(CondensedWorkItemSchema).length(parsed.length),
    }),
    system: CONDENSE_WORK_ITEMS_BATCH_SYSTEM_PROMPT,
    prompt: buildCondenseWorkItemsBatchPrompt(parsed),
  });

  return object.items.map((item, index) => ({
    ...item,
    artifactId: parsed[index].artifactId,
    source: parsed[index].source,
    repo: item.repo ?? parsed[index].repo,
  }));
}

export async function consolidateRepoWork(
  repo: string,
  items: CondensedWorkItem[]
): Promise<RepoWorkSummary> {
  if (items.length === 0) {
    throw new Error(`Cannot consolidate repo ${repo}: no work items provided`);
  }

  const { object } = await generateObject({
    model: MODEL_FAST,
    schema: RepoWorkSummarySchema,
    system: CONSOLIDATE_REPO_SYSTEM_PROMPT,
    prompt: buildConsolidateRepoPrompt(repo, items),
  });

  return {
    ...object,
    repo,
  };
}

export async function generateProfileFromPipeline(
  engineer: Engineer,
  input: PipelineProfileInput,
  generatedAt = new Date().toISOString()
): Promise<Profile> {
  const parsed = PipelineProfileInputSchema.parse(input);
  const { object } = await generateObject({
    model: MODEL_DEFAULT,
    schema: ProfileSchema,
    system: STAGED_PROFILE_SYSTEM_PROMPT,
    prompt: buildStagedProfilePrompt(engineer, parsed, generatedAt),
  });

  return {
    ...object,
    engineerId: engineer.id,
    generatedAt,
    published: false,
  };
}

export async function generateProfileWithStagedPipeline(
  engineer: Engineer
): Promise<Profile> {
  const workItems = await loadPipelineWorkItems(engineer.id);
  const condensed = await condenseWorkItems(workItems);
  const input = await buildPipelineProfileInput(condensed);
  return generateProfileFromPipeline(engineer, input);
}

export async function condenseWorkItems(
  items: WorkItemInput[]
): Promise<CondensedWorkItem[]> {
  return condenseWorkItemsBatch(items);
}

export async function buildPipelineProfileInput(
  condensed: CondensedWorkItem[]
): Promise<PipelineProfileInput> {
  const codeItems = condensed.filter(
    (item) =>
      (item.source === "github_commit" || item.source === "github_pr") &&
      item.repo
  );
  const byRepo = new Map<string, CondensedWorkItem[]>();
  for (const item of codeItems) {
    const repo = item.repo;
    if (!repo) continue;
    byRepo.set(repo, [...(byRepo.get(repo) ?? []), item]);
  }

  const repoSummaries: RepoWorkSummary[] = [];
  for (const [repo, items] of byRepo) {
    repoSummaries.push(await consolidateRepoWork(repo, items));
  }

  const jiraAndSprintSummaries = condensed.filter(
    (item) => item.source === "jira_ticket" || item.source === "jira_sprint"
  );
  const otherSummaries = condensed.filter(
    (item) =>
      item.source !== "github_commit" &&
      item.source !== "github_pr" &&
      item.source !== "jira_ticket" &&
      item.source !== "jira_sprint"
  );

  return {
    repoSummaries,
    jiraAndSprintSummaries,
    otherSummaries,
  };
}

export async function loadPipelineWorkItems(
  engineerId: string
): Promise<WorkItemInput[]> {
  const artifacts = await loadArtifacts(engineerId);
  const out: WorkItemInput[] = [];

  for (const artifact of artifacts) {
    if (artifact.filename.endsWith(".json")) {
      const parsed = JSON.parse(artifact.content) as unknown;
      const records = Array.isArray(parsed) ? parsed : [parsed];
      for (const record of records) {
        out.push(toWorkItemInput(artifact.filename, record));
      }
      continue;
    }

    out.push({
      artifactId: `${artifact.filename}:full`,
      source: artifact.filename.includes("slack") ? "slack_thread" : "internal_doc",
      title: artifact.filename,
      raw: artifact.content,
    });
  }

  return out;
}

function toWorkItemInput(filename: string, raw: unknown): WorkItemInput {
  const record = isRecord(raw) ? raw : {};
  const id = stringField(record, "id") ?? `${filename}:${Math.random()}`;

  if (filename.includes("github")) {
    return {
      artifactId: id,
      source: filename.includes("commit") ? "github_commit" : "github_pr",
      repo: stringField(record, "repo"),
      title: stringField(record, "title"),
      date: stringField(record, "merged_at") ?? stringField(record, "committed_at"),
      raw,
    };
  }

  if (filename.includes("jira") || id.startsWith("jira:")) {
    return {
      artifactId: id,
      source: stringField(record, "type")?.toLowerCase().includes("sprint")
        ? "jira_sprint"
        : "jira_ticket",
      title: stringField(record, "title"),
      date: stringField(record, "resolved") ?? stringField(record, "created"),
      raw,
    };
  }

  return {
    artifactId: id,
    source: "other",
    title: stringField(record, "title") ?? filename,
    raw,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(
  record: Record<string, unknown>,
  field: string
): string | undefined {
  const value = record[field];
  return typeof value === "string" ? value : undefined;
}
