import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GitPullRequest,
  Briefcase,
  MessageSquare,
  FileText,
} from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { Badge } from "@/components/ui/badge";
import { EditableText } from "@/components/profile/editable-text";
import {
  getEngineerById,
  getProfileByEngineerId,
} from "@/lib/data";
import { getCurrentEngineerId } from "@/lib/session-server";
import type { Profile } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Params = { id: string; index: string };

const EVIDENCE_ICON: Record<
  Profile["contributionEvidence"][number]["type"],
  React.ReactNode
> = {
  github: <GitPullRequest className="h-3.5 w-3.5" />,
  jira: <Briefcase className="h-3.5 w-3.5" />,
  slack: <MessageSquare className="h-3.5 w-3.5" />,
  doc: <FileText className="h-3.5 w-3.5" />,
};

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, index: rawIndex } = await params;
  const themeIndex = parseInt(rawIndex, 10);
  if (isNaN(themeIndex)) notFound();

  const engineer = await getEngineerById(id);
  if (!engineer) notFound();

  const currentEngineerId = await getCurrentEngineerId();
  const isOwnProfile = id === currentEngineerId;
  const backHref = isOwnProfile ? "/app/profile" : `/app/profile/${id}`;

  const profile = await getProfileByEngineerId(id);
  if (!profile || themeIndex < 0 || themeIndex >= profile.projectThemes.length)
    notFound();

  const theme = profile.projectThemes[themeIndex];
  const canEdit = isOwnProfile && !profile.published;

  // Find contribution evidence whose url/summary mentions any of the theme's artifact refs
  const relatedEvidence = profile.contributionEvidence.filter((ev) =>
    theme.artifactRefs.some(
      (ref) =>
        (ev.url && ev.url.includes(ref)) ||
        ev.summary.toLowerCase().includes(ref.replace(/.*:/, "").toLowerCase())
    )
  );

  // Find skills whose evidence mentions any of the theme's artifact refs
  const relatedSkills = profile.skills.filter((skill) =>
    skill.evidence.some((e) =>
      theme.artifactRefs.some((ref) =>
        e.toLowerCase().includes(ref.replace(/.*:/, "").toLowerCase())
      )
    )
  );

  const CONFIDENCE_TONE: Record<string, string> = {
    high: "bg-[#fce8e1] text-[#9e4433] ring-1 ring-[#f5c4b8]",
    medium: "bg-[#f5edd0] text-[#7a6520] ring-1 ring-[#e5d5a0]",
    low: "bg-[#f5f5f5] text-[#666] ring-1 ring-[#e5e5e5]",
  };

  return (
    <div className="flex flex-col gap-10 py-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-[13px] text-[#666] hover:text-[#0a0a0a]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {engineer.name}&apos;s profile
      </Link>

      <header className="flex flex-col gap-3">
        <Eyebrow>
          Project · {engineer.name} · {engineer.team}
        </Eyebrow>
        <CaveatHeading as="h1">{theme.title}</CaveatHeading>
      </header>

      {/* Editable summary */}
      <section className="rounded-2xl bg-[#fce8e1] p-6">
        <Eyebrow className="text-[#9e4433]/80">Summary</Eyebrow>
        {canEdit ? (
          <EditableText
            initial={theme.summary}
            label="summary"
            className="mt-3"
            textClassName="text-[15px] leading-[1.65] text-[#0a0a0a]"
          />
        ) : (
          <p className="mt-3 text-[15px] leading-[1.65] text-[#0a0a0a]">
            {theme.summary}
          </p>
        )}
      </section>

      {/* Editable description */}
      <section className="flex flex-col gap-3">
        <CaveatHeading as="h2">Details</CaveatHeading>
        {canEdit ? (
          <EditableText
            initial={theme.description}
            label="description"
            multiline
            textClassName="text-[14px] leading-[1.75] text-[#333]"
          />
        ) : (
          <p className="text-[14px] leading-[1.75] text-[#333]">
            {theme.description}
          </p>
        )}
      </section>

      {theme.artifactRefs.length > 0 && (
        <section className="flex flex-col gap-3">
          <CaveatHeading as="h2">Artifacts</CaveatHeading>
          <div className="flex flex-wrap gap-2">
            {theme.artifactRefs.map((ref) => (
              <Badge
                key={ref}
                variant="outline"
                className="font-mono text-[12px]"
              >
                {ref}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {relatedSkills.length > 0 && (
        <section className="flex flex-col gap-4">
          <CaveatHeading as="h2">Related Skills</CaveatHeading>
          <div className="grid gap-3 md:grid-cols-2">
            {relatedSkills.map((skill) => {
              const skillIndex = profile.skills.indexOf(skill);
              return (
                <Link
                  key={skill.name}
                  href={`/app/profile/${id}/skill/${skillIndex}`}
                  className="block"
                >
                  <div
                    className={`rounded-xl p-4 transition-all hover:shadow-md ${CONFIDENCE_TONE[skill.confidence]}`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold">{skill.name}</p>
                      <span className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase">
                        {skill.confidence}
                      </span>
                    </div>
                    {skill.summary && (
                      <p className="mt-1.5 text-[12px] leading-[1.5] text-[#444]">
                        {skill.summary}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {relatedEvidence.length > 0 && (
        <section className="flex flex-col gap-4">
          <CaveatHeading as="h2">Contribution Evidence</CaveatHeading>
          <ul className="flex flex-col divide-y divide-[#eee] rounded-2xl border border-[#eee]">
            {relatedEvidence.map((ev, i) => (
              <li
                key={`${ev.type}-${i}`}
                className="flex items-start gap-3 px-5 py-4"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#555]">
                  {EVIDENCE_ICON[ev.type]}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#999]">
                    {ev.type}
                  </span>
                  <p className="text-[13px] leading-[1.55] text-[#0a0a0a]">
                    {ev.summary}
                  </p>
                  {ev.url && (
                    <span className="font-mono text-[11px] text-[#9e4433]">
                      {ev.url}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
