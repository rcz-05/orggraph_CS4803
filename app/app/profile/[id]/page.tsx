import { notFound } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { getEngineerById, getProfileByEngineerId } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function ProfileByIdPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const engineer = await getEngineerById(id);
  if (!engineer) notFound();

  const profile = await getProfileByEngineerId(id);
  if (!profile) {
    return (
      <div className="flex flex-col gap-3 py-10">
        <h1 className="text-2xl font-semibold text-[#0a0a0a]">{engineer.name}</h1>
        <p className="text-[14px] text-[#666]">
          {engineer.title} · {engineer.team}
        </p>
        <p
          className="mt-6 text-[18px] text-[#999]"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          this engineer hasn&apos;t generated a profile yet…
        </p>
      </div>
    );
  }

  return <ProfileView engineer={engineer} profile={profile} />;
}
