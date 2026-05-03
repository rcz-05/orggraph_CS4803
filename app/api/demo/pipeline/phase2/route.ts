import {
  CondensedWorkItemSchema,
  buildPipelineProfileInput,
} from "@/lib/staged-profile-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      condensed?: unknown[];
    };
    const condensed = (body.condensed ?? []).map((item) =>
      CondensedWorkItemSchema.parse(item)
    );

    if (condensed.length === 0) {
      return Response.json(
        { error: "condensed work items required" },
        { status: 400 }
      );
    }

    const profileInput = await buildPipelineProfileInput(condensed);

    return Response.json({
      repoCount: profileInput.repoSummaries.length,
      jiraCount: profileInput.jiraAndSprintSummaries.length,
      otherCount: profileInput.otherSummaries.length,
      profileInput,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Phase 2 consolidation failed" },
      { status: 500 }
    );
  }
}
