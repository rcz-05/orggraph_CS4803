import { notFound } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { PreferencesEditor } from "@/components/profile/preferences-editor";
import { GenerateEmptyState } from "@/components/profile/generate-empty-state";
import {
  getEngineerById,
  getProfileByEngineerId,
} from "@/lib/data";
import { getCurrentEngineerId } from "@/lib/session-server";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
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

  return (
    <div className="flex flex-col gap-12">
      <ProfileView engineer={engineer} profile={profile} />
      <PreferencesEditor
        initial={engineer.preferences}
        initialPublished={profile.published}
      />
    </div>
  );
}
