import {
  condenseWorkItems,
  loadPipelineWorkItems,
  type WorkItemSource,
} from "@/lib/staged-profile-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_ENGINEER_ID = "eng-arnav-chintawar";

type SourceFilter = "github" | "jira" | "slack";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    sources?: string[];
  };
  const sources = normalizeSources(body.sources);
  const items = await loadPipelineWorkItems(DEMO_ENGINEER_ID);
  const selected = items.filter((item) => sourceMatches(item.source, sources));

  if (selected.length === 0) {
    return Response.json(
      { error: "No matching demo artifacts found for selected sources" },
      { status: 404 }
    );
  }

  try {
    const condensed = await condenseWorkItems(selected);

    return Response.json({
      engineerId: DEMO_ENGINEER_ID,
      itemCount: selected.length,
      condensed,
    });
  } catch (err) {
    return Response.json(
      { error: errorMessage(err, "Phase 1 condensation failed") },
      { status: 500 }
    );
  }
}

function normalizeSources(sources: string[] | undefined): SourceFilter[] {
  const valid: SourceFilter[] = ["github", "jira", "slack"];
  const selected = (sources ?? []).filter((source): source is SourceFilter =>
    valid.includes(source as SourceFilter)
  );
  return selected.length > 0 ? selected : ["github", "jira"];
}

function sourceMatches(
  source: WorkItemSource,
  selected: SourceFilter[]
): boolean {
  if (selected.includes("github") && source.startsWith("github_")) return true;
  if (selected.includes("jira") && source.startsWith("jira_")) return true;
  if (selected.includes("slack") && source === "slack_thread") return true;
  return false;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
