import { GitPullRequest, Briefcase, MessageSquare, FileText } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { PostitCard } from "@/components/shared/postit-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Engineer, Profile } from "@/lib/schemas";

const CONFIDENCE_ORDER = ["high", "medium", "low"] as const;

const CONFIDENCE_LABEL: Record<(typeof CONFIDENCE_ORDER)[number], string> = {
  high: "High confidence",
  medium: "Medium",
  low: "Low",
};

const CONFIDENCE_TONE: Record<
  (typeof CONFIDENCE_ORDER)[number],
  { chip: string; dot: string }
> = {
  high: {
    chip: "bg-[#fce8e1] text-[#9e4433] ring-[#f5c4b8]",
    dot: "bg-[#9e4433]",
  },
  medium: {
    chip: "bg-[#f5edd0] text-[#7a6520] ring-[#e5d5a0]",
    dot: "bg-[#7a6520]",
  },
  low: {
    chip: "bg-[#f5f5f5] text-[#666] ring-[#e5e5e5]",
    dot: "bg-[#aaa]",
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

type Props = {
  engineer: Engineer;
  profile: Profile;
};

export function ProfileView({ engineer, profile }: Props) {
  const skillsByConfidence = CONFIDENCE_ORDER.map((c) => ({
    confidence: c,
    skills: profile.skills.filter((s) => s.confidence === c),
  })).filter((g) => g.skills.length > 0);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <Eyebrow>Profile · {engineer.team}</Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <CaveatHeading as="h1">{engineer.name}</CaveatHeading>
          {engineer.preferences.openToTransfer && (
            <Badge variant="evidence">Open to transfer</Badge>
          )}
          <Badge variant={profile.published ? "default" : "outline"}>
            {profile.published ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="text-[13px] text-[#666]">
          {engineer.title} · {engineer.team} · {engineer.yearsAtCompany} year
          {engineer.yearsAtCompany === 1 ? "" : "s"} at company
        </p>
      </header>

      <section className="rounded-2xl bg-[#fce8e1] p-6">
        <Eyebrow className="text-[#9e4433]/80">Summary</Eyebrow>
        <p className="mt-3 text-[15px] leading-[1.65] text-[#0a0a0a]">
          {profile.summary}
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <CaveatHeading as="h2">Skills</CaveatHeading>
        {skillsByConfidence.map(({ confidence, skills }) => (
          <div key={confidence} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 rounded-full", CONFIDENCE_TONE[confidence].dot)}
              />
              <Eyebrow>{CONFIDENCE_LABEL[confidence]}</Eyebrow>
              <span className="text-[11px] text-[#bbb]">
                {skills.length} skill{skills.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {skills.map((s) => (
                <div
                  key={s.name}
                  className={cn(
                    "rounded-xl p-4 ring-1",
                    CONFIDENCE_TONE[confidence].chip
                  )}
                >
                  <p className="text-[14px] font-semibold">{s.name}</p>
                  {s.evidence.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5 text-[12px] leading-[1.5] text-[#444]">
                      {s.evidence.map((e, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[#bbb]">·</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <CaveatHeading as="h2">Project Themes</CaveatHeading>
        <div className="grid gap-4 md:grid-cols-2">
          {profile.projectThemes.map((theme, i) => (
            <PostitCard
              key={`${theme.title}-${i}`}
              accent="profile"
              badge="THEME"
              title={theme.title}
              description={theme.description}
            >
              {theme.artifactRefs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {theme.artifactRefs.map((ref) => (
                    <span
                      key={ref}
                      className="rounded-md bg-white/60 px-1.5 py-0.5 font-mono text-[10px] text-[#9e4433]"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </PostitCard>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <CaveatHeading as="h2">Evidence</CaveatHeading>
        <ul className="flex flex-col divide-y divide-[#eee] rounded-2xl border border-[#eee]">
          {profile.contributionEvidence.map((ev, i) => (
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
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-[#9e4433] hover:underline"
                  >
                    {ev.url}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
