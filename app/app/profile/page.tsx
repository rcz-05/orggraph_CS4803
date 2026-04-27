import { notFound } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { PreferencesEditor } from "@/components/profile/preferences-editor";
import { GenerateEmptyState } from "@/components/profile/generate-empty-state";
import { GithubConnectBanner } from "@/components/profile/github-connect-banner";
import { GithubEvidencePanel } from "@/components/profile/github-evidence-panel";
import {
  getEngineerById,
  getProfileByEngineerId,
} from "@/lib/data";
import { getCurrentEngineerId } from "@/lib/session-server";
import { readTokenCookie } from "@/lib/github-oauth";
import { fetchGhProfile, type GhProfile } from "@/lib/github";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ gh?: string; reason?: string }>;

export default async function MyProfilePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const engineerId = await getCurrentEngineerId();
  const engineer = await getEngineerById(engineerId);
  if (!engineer) notFound();

  const profile = await getProfileByEngineerId(engineerId);

  if (!profile) {
    return (
      <GenerateEmptyState
        engineerId={engineer.id}
        engineerName={engineer.name}
      />
    );
  }

  // GitHub OAuth state — independent of the seeded profile, never breaks the
  // existing demo path if the token is missing or fetching fails.
  const params = await searchParams;
  const ghToken = await readTokenCookie();
  let ghProfile: GhProfile | null = null;
  let ghBannerState: "idle" | "cancelled" | "error" = "idle";

  if (ghToken) {
    try {
      ghProfile = await fetchGhProfile(ghToken);
    } catch (err) {
      console.error("GitHub fetch failed:", err);
      ghBannerState = "error";
    }
  } else if (params.gh === "cancelled") {
    ghBannerState = "cancelled";
  } else if (params.gh === "error") {
    ghBannerState = "error";
  }

  return (
    <div className="flex flex-col gap-12">
      {ghProfile ? (
        <GithubEvidencePanel data={ghProfile} />
      ) : (
        <GithubConnectBanner state={ghBannerState} />
      )}
      <ProfileView engineer={engineer} profile={profile} />
      <PreferencesEditor
        initial={engineer.preferences}
        initialPublished={profile.published}
      />
    </div>
  );
}
