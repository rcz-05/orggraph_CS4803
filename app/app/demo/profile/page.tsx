import { notFound } from "next/navigation";

import { DemoEngineerView } from "@/components/demo/demo-engineer-view";
import { ProfileView } from "@/components/profile/profile-view";
import { PreferencesEditor } from "@/components/profile/preferences-editor";
import { getEngineerById, getProfileByEngineerId } from "@/lib/data";

export const dynamic = "force-dynamic";

const DEMO_PROFILE_ID = "eng-arnav-chintawar";

export default async function DemoGeneratedProfilePage() {
  const [engineer, profile] = await Promise.all([
    getEngineerById(DEMO_PROFILE_ID),
    getProfileByEngineerId(DEMO_PROFILE_ID),
  ]);

  if (!engineer || !profile) notFound();

  return (
    <div className="flex flex-col gap-12">
      <DemoEngineerView />
      <ProfileView engineer={engineer} profile={profile} />
      <PreferencesEditor
        initial={engineer.preferences}
        initialPublished={profile.published}
      />
    </div>
  );
}
