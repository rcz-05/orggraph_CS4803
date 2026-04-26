import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { EditableText } from "@/components/profile/editable-text";
import { SignalInterestButton } from "@/components/teams/signal-interest-button";
import { RecentInterestPanel } from "@/components/teams/recent-interest-panel";
import { getEngineers, getTeamBySlug } from "@/lib/data";
import { getRole } from "@/lib/session-server";
import { DEMO_ENGINEER_ID, DEMO_MANAGER_TEAM_SLUG } from "@/lib/signals";

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

  const [role, engineers] = await Promise.all([
    getRole(),
    getEngineers(),
  ]);
  const engineerLookup = new Map(engineers.map((e) => [e.id, e]));
  const canEditTeam = role === "manager" && team.slug === DEMO_MANAGER_TEAM_SLUG;

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
            {canEditTeam ? (
              <EditableText
                initial={team.mission}
                label="team mission"
                multiline
                textClassName="text-[15px] leading-[1.65] text-[#0a0a0a]"
              />
            ) : (
              <p className="text-[15px] leading-[1.65] text-[#0a0a0a]">
                {team.mission}
              </p>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Eyebrow>Current projects</Eyebrow>
              {canEditTeam && (
                <span className="text-[11px] text-[#999]">
                  Editable · session only
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-3">
              {team.currentProjects.map((p, i) => (
                <li
                  key={`${p.title}-${i}`}
                  className="rounded-2xl border border-[#eee] bg-white transition-all hover:border-[#b5c5d6] hover:shadow-md"
                >
                  {canEditTeam ? (
                    <div className="flex flex-col gap-4 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <EditableText
                          initial={p.title}
                          label="project title"
                          textClassName="text-[14px] font-semibold text-[#0a0a0a] pr-16"
                        />
                        <span className="rounded-full bg-[#dce4ef] px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-[#3a566e] uppercase">
                          {p.status}
                        </span>
                      </div>
                      <EditableText
                        initial={p.description}
                        label="project description"
                        multiline
                        textClassName="text-[13px] leading-[1.55] text-[#666] pr-16"
                      />
                      <Link
                        href={`/app/teams/${team.slug}/projects/${i}`}
                        className="inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#3a566e] underline-offset-2 hover:underline"
                      >
                        View project details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/app/teams/${team.slug}/projects/${i}`}
                      className="group flex items-start justify-between gap-4 p-5"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">
                            {p.title}
                          </h3>
                          <span className="rounded-full bg-[#dce4ef] px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-[#3a566e] uppercase">
                            {p.status}
                          </span>
                        </div>
                        <p className="mt-2 text-[13px] leading-[1.55] text-[#666]">
                          {p.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#bbb] transition-transform group-hover:translate-x-0.5 group-hover:text-[#3a566e]" />
                    </Link>
                  )}
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
              engineerId={DEMO_ENGINEER_ID}
              teamName={team.name}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
