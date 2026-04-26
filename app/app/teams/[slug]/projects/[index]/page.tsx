import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { EditableText } from "@/components/profile/editable-text";
import { getTeamBySlug } from "@/lib/data";
import { getRole } from "@/lib/session-server";
import { DEMO_MANAGER_TEAM_SLUG } from "@/lib/signals";

export const dynamic = "force-dynamic";

type Params = { slug: string; index: string };

export default async function TeamProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, index: rawIndex } = await params;
  const projectIndex = Number.parseInt(rawIndex, 10);
  if (Number.isNaN(projectIndex)) notFound();

  const team = await getTeamBySlug(slug);
  if (!team || projectIndex < 0 || projectIndex >= team.currentProjects.length) {
    notFound();
  }

  const role = await getRole();
  const project = team.currentProjects[projectIndex];
  const canEditProject = role === "manager" && team.slug === DEMO_MANAGER_TEAM_SLUG;

  return (
    <div className="flex flex-col gap-10 py-4">
      <div>
        <Link
          href={`/app/teams/${team.slug}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-[#666] hover:text-[#0a0a0a]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to {team.name}
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <Eyebrow>
          Project · {team.name} · {project.status}
        </Eyebrow>
        <CaveatHeading as="h1">{project.title}</CaveatHeading>
        {canEditProject ? (
          <EditableText
            initial={project.description}
            label="project description"
            multiline
            className="max-w-3xl"
            textClassName="text-[15px] leading-[1.65] text-[#0a0a0a] pr-16"
          />
        ) : (
          <p className="max-w-3xl text-[15px] leading-[1.65] text-[#0a0a0a]">
            {project.description}
          </p>
        )}
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-[#dce4ef] p-5">
          <CalendarDays className="h-4 w-4 text-[#3a566e]" />
          <Eyebrow className="mt-3 text-[#3a566e]/80">Timeline</Eyebrow>
          <p className="mt-2 text-[14px] font-semibold text-[#0a0a0a]">
            {project.timeline}
          </p>
        </div>
        <div className="rounded-2xl bg-[#f5edd0] p-5">
          <CheckCircle2 className="h-4 w-4 text-[#7a6520]" />
          <Eyebrow className="mt-3 text-[#7a6520]/80">Owner</Eyebrow>
          <p className="mt-2 text-[14px] font-semibold text-[#0a0a0a]">
            {project.owner}
          </p>
        </div>
        <div className="rounded-2xl bg-[#e2edd9] p-5">
          <Users className="h-4 w-4 text-[#3d6132]" />
          <Eyebrow className="mt-3 text-[#3d6132]/80">Collaborators</Eyebrow>
          <p className="mt-2 text-[14px] font-semibold text-[#0a0a0a]">
            {project.collaborators.length > 0
              ? project.collaborators.join(", ")
              : team.name}
          </p>
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-[1.35fr_0.9fr]">
        <main className="flex flex-col gap-8">
          <section className="rounded-2xl border border-[#eee] bg-white p-6">
            <Eyebrow>Problem</Eyebrow>
            {canEditProject ? (
              <EditableText
                initial={project.problem}
                label="project problem"
                multiline
                className="mt-3"
                textClassName="text-[14px] leading-[1.75] text-[#333] pr-16"
              />
            ) : (
              <p className="mt-3 text-[14px] leading-[1.75] text-[#333]">
                {project.problem}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-[#eee] bg-white p-6">
            <Eyebrow>Approach</Eyebrow>
            <ul className="mt-4 flex flex-col gap-3">
              {project.approach.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-3 text-[14px] leading-[1.6] text-[#333]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3a566e]" />
                  {canEditProject ? (
                    <EditableText
                      initial={item}
                      label={`approach item ${index + 1}`}
                      multiline
                      className="flex-1"
                      textClassName="pr-16"
                    />
                  ) : (
                    item
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#eee] bg-white p-6">
            <Eyebrow>Success metrics</Eyebrow>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.successMetrics.map((metric) => (
                <div
                  key={metric}
                  className="rounded-xl bg-[#fafafa] px-4 py-3 text-[13px] font-medium leading-[1.5] text-[#444]"
                >
                  {metric}
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl bg-[#dce4ef] p-5">
            <Eyebrow className="text-[#3a566e]/80">Milestones</Eyebrow>
            <ol className="mt-4 flex flex-col gap-3">
              {project.milestones.map((milestone, index) => (
                <li key={milestone} className="flex gap-3 text-[13px] leading-[1.55] text-[#3a566e]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-[10px] font-bold">
                    {index + 1}
                  </span>
                  {milestone}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-[#eee] bg-white p-5">
            <Eyebrow>Risks</Eyebrow>
            <ul className="mt-3 flex flex-col gap-2">
              {project.risks.map((risk) => (
                <li key={risk} className="text-[13px] leading-[1.55] text-[#666]">
                  {risk}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#eee] bg-white p-5">
            <Eyebrow>Team stack</Eyebrow>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {team.techStack.map((tech) => (
                <Badge key={tech} variant="outline" className="normal-case tracking-normal">
                  {tech}
                </Badge>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
