import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { SignalInterestButton } from "@/components/teams/signal-interest-button";
import { RecentInterestPanel } from "@/components/teams/recent-interest-panel";
import { getEngineers, getTeamBySlug } from "@/lib/data";
import { getCurrentEngineerId, getRole } from "@/lib/session-server";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const [engineerId, role, engineers] = await Promise.all([
    getCurrentEngineerId(),
    getRole(),
    getEngineers(),
  ]);
  const engineerLookup = new Map(engineers.map((e) => [e.id, e]));

  return (
    <div className="flex flex-col gap-10 py-4">
      <div>
        <Link
          href="/app/teams"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#666] hover:text-[#0a0a0a]"
        >
          <ArrowLeft className="h-3 w-3" />
          All teams
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <Eyebrow>Team · {team.projectTypes.join(" · ")}</Eyebrow>
        <CaveatHeading as="h1">{team.name}</CaveatHeading>
        <p className="text-[13px] text-[#666]">
          Manager:{" "}
          <Link
            href={`/app/profile/${team.manager.engineerId}`}
            className="font-medium text-[#0a0a0a] underline-offset-2 hover:underline"
          >
            {team.manager.name}
          </Link>
        </p>
      </header>

      <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-3">
            <Eyebrow>Mission</Eyebrow>
            <p className="text-[15px] leading-[1.65] text-[#0a0a0a]">
              {team.mission}
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <Eyebrow>Current projects</Eyebrow>
            <ul className="flex flex-col gap-3">
              {team.currentProjects.map((p, i) => (
                <li
                  key={`${p.title}-${i}`}
                  className="rounded-2xl border border-[#eee] bg-white p-5"
                >
                  <h3 className="text-[14px] font-semibold text-[#0a0a0a]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.55] text-[#666]">
                    {p.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-[#eee] bg-white p-5">
            <Eyebrow>Tech stack</Eyebrow>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {team.techStack.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-[#f5f5f5] px-2 py-0.5 text-[11px] font-medium text-[#444]"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#eee] bg-white p-5">
            <Eyebrow>Owned services</Eyebrow>
            <ul className="mt-3 flex flex-col gap-1.5 font-mono text-[12px] text-[#444]">
              {team.ownedServices.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#3a566e]" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-[#dce4ef] p-5">
            <Eyebrow className="text-[#3a566e]/80">
              Skill gaps · we&apos;d welcome help
            </Eyebrow>
            <ul className="mt-3 flex flex-col gap-2 text-[13px] text-[#3a566e]">
              {team.skillGaps.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3a566e]" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {role === "manager" ? (
            <RecentInterestPanel
              teamSlug={team.slug}
              engineerLookup={engineerLookup}
            />
          ) : (
            <SignalInterestButton
              teamSlug={team.slug}
              engineerId={engineerId}
              teamName={team.name}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
