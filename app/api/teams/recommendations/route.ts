import { getEngineerById, getProfileByEngineerId, getTeams } from "@/lib/data";
import { getRole } from "@/lib/session-server";
import { DEMO_ENGINEER_ID } from "@/lib/signals";
import { getBestFitTeams } from "@/lib/team-fit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const role = await getRole();
  if (role !== "engineer") {
    return Response.json({ recommendations: [] });
  }

  const [teams, engineer, profile] = await Promise.all([
    getTeams(),
    getEngineerById(DEMO_ENGINEER_ID),
    getProfileByEngineerId(DEMO_ENGINEER_ID),
  ]);

  if (!engineer || !profile) {
    return Response.json(
      { error: "Engineer profile not found" },
      { status: 404 }
    );
  }

  try {
    const recommendations = await getBestFitTeams(teams, engineer, profile);
    return Response.json({ recommendations });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Team recommendations failed";
    const status = message.toLowerCase().includes("quota") ? 429 : 500;

    return Response.json({ error: message }, { status });
  }
}
