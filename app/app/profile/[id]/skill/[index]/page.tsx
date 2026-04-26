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

const CONFIDENCE_TONE: Record<
  string,
  { bg: string; text: string; ring: string; eyebrow: string }
> = {
  high: {
    bg: "bg-[#fce8e1]",
    text: "text-[#9e4433]",
    ring: "ring-[#f5c4b8]",
    eyebrow: "text-[#9e4433]/80",
  },
  medium: {
    bg: "bg-[#f5edd0]",
    text: "text-[#7a6520]",
    ring: "ring-[#e5d5a0]",
    eyebrow: "text-[#7a6520]/80",
  },
  low: {
    bg: "bg-[#f5f5f5]",
    text: "text-[#666]",
    ring: "ring-[#e5e5e5]",
    eyebrow: "text-[#666]/80",
  },
};

const EVIDENCE_ICON: Record<
  Profile["contributionEvidence"][number]["type"],
  React.ReactNode
> = {
  github: <GitPullRequest className="h-3.5 w-3.5" />,
  jira: <Briefcase className="h-3.5 w-3.5" />,
  slack: <MessageSquare className="h-3.5 w-3.5" />,
  doc: <FileText className="h-3.5 w-3.5" />,
};

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, index: rawIndex } = await params;
  const skillIndex = parseInt(rawIndex, 10);
  if (isNaN(skillIndex)) notFound();

  const engineer = await getEngineerById(id);
  if (!engineer) notFound();

  const currentEngineerId = await getCurrentEngineerId();
  const isOwnProfile = id === currentEngineerId;
  const backHref = isOwnProfile ? "/app/profile" : `/app/profile/${id}`;

  const profile = await getProfileByEngineerId(id);
  if (!profile || skillIndex < 0 || skillIndex >= profile.skills.length)
    notFound();

  const skill = profile.skills[skillIndex];
  const tone = CONFIDENCE_TONE[skill.confidence];
  const canEdit = isOwnProfile && !profile.published;

  // Find contribution evidence that mentions terms from this skill's evidence
  const relatedEvidence = profile.contributionEvidence.filter((ev) =>
    skill.evidence.some((e) => {
      // Extract PR numbers, Jira keys, etc. from evidence strings
      const refs = e.match(/(?:PR #?\d+|[A-Z]+-\d+|#[\w-]+)/gi) ?? [];
      return refs.some(
        (ref) =>
          ev.summary.toLowerCase().includes(ref.toLowerCase()) ||
          (ev.url && ev.url.toLowerCase().includes(ref.toLowerCase()))
      );
    })
  );

  // Find project themes whose artifact refs overlap with this skill's evidence
  const relatedThemes = profile.projectThemes.filter((theme) =>
    theme.artifactRefs.some((ref) =>
      skill.evidence.some((e) =>
        e.toLowerCase().includes(ref.replace(/.*:/, "").toLowerCase())
      )
    )
  );

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
          Skill · {engineer.name} · {engineer.team}
        </Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <CaveatHeading as="h1">{skill.name}</CaveatHeading>
          <Badge
            className={`${tone.bg} ${tone.text} ring-1 ${tone.ring} border-0`}
          >
            {skill.confidence} confidence
          </Badge>
        </div>
      </header>

      {/* Editable summary */}
      <section className={`rounded-2xl ${tone.bg} p-6`}>
        <Eyebrow className={tone.eyebrow}>Summary</Eyebrow>
        {canEdit ? (
          <EditableText
            initial={skill.summary || `${skill.name} — ${skill.confidence} confidence skill.`}
            label="summary"
            className="mt-3"
            textClassName="text-[15px] leading-[1.65] text-[#0a0a0a]"
          />
        ) : (
          <p className="mt-3 text-[15px] leading-[1.65] text-[#0a0a0a]">
            {skill.summary || `${skill.name} — ${skill.confidence} confidence skill.`}
          </p>
        )}
      </section>

      {/* Editable description */}
      {(skill.description || canEdit) && (
        <section className="flex flex-col gap-3">
          <CaveatHeading as="h2">Details</CaveatHeading>
          {canEdit ? (
            <EditableText
              initial={skill.description || "Add a detailed description of this skill."}
              label="description"
              multiline
              textClassName="text-[14px] leading-[1.75] text-[#333]"
            />
          ) : (
            <p className="text-[14px] leading-[1.75] text-[#333]">
              {skill.description}
            </p>
          )}
        </section>
      )}

      {/* Evidence */}
      <section className="flex flex-col gap-3">
        <CaveatHeading as="h2">Evidence</CaveatHeading>
        <ul className="flex flex-col gap-3">
          {skill.evidence.map((e, i) => (
            <li
              key={i}
              className={`rounded-xl p-4 ring-1 ${tone.bg} ${tone.ring}`}
            >
              <p className="text-[13px] leading-[1.6] text-[#0a0a0a]">{e}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Related themes */}
      {relatedThemes.length > 0 && (
        <section className="flex flex-col gap-4">
          <CaveatHeading as="h2">Related Project Themes</CaveatHeading>
          <div className="grid gap-3 md:grid-cols-2">
            {relatedThemes.map((theme) => {
              const themeIndex = profile.projectThemes.indexOf(theme);
              return (
                <Link
                  key={theme.title}
                  href={`/app/profile/${id}/project/${themeIndex}`}
                  className="block"
                >
                  <div className="rounded-xl border border-[#eee] bg-[#fafafa] p-4 transition-all hover:shadow-md">
                    <p className="text-[14px] font-semibold text-[#0a0a0a]">
                      {theme.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-[1.5] text-[#666]">
                      {theme.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Related contribution evidence */}
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
