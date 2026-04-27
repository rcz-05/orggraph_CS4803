"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  GitPullRequest,
  MessageSquare,
  Sparkles,
  Ticket,
} from "lucide-react";

import { CaveatHeading } from "@/components/shared/caveat-heading";
import { Eyebrow } from "@/components/shared/eyebrow";

// Demo-tuned duration — full-length 2m34s pipeline compressed ~13x so judges
// see the visual rhythm of all 8 stages without a dead-air stretch.
// Original 154_000ms value is preserved in git history if a longer
// presentation is ever needed.
const DURATION_MS = 12_000;

const STAGES = [
  { at: 0, progress: 0, label: "Connecting to source APIs", icon: <GitPullRequest className="h-4 w-4" /> },
  { at: 800, progress: 10, label: "Reading pull requests and review comments", icon: <GitPullRequest className="h-4 w-4" /> },
  { at: 2_400, progress: 30, label: "Mapping Jira ownership and project scope", icon: <Ticket className="h-4 w-4" /> },
  { at: 4_000, progress: 40, label: "Finding mentoring and design signals in Slack", icon: <MessageSquare className="h-4 w-4" /> },
  { at: 6_100, progress: 60, label: "Clustering evidence into skills and projects", icon: <Sparkles className="h-4 w-4" /> },
  { at: 8_500, progress: 80, label: "Drafting profile summary", icon: <Sparkles className="h-4 w-4" /> },
  { at: 10_500, progress: 90, label: "Attaching evidence snippets", icon: <CheckCircle2 className="h-4 w-4" /> },
  { at: 12_000, progress: 100, label: "Profile ready", icon: <CheckCircle2 className="h-4 w-4" /> },
];

function getStage(elapsedMs: number) {
  return STAGES.reduce((current, stage) =>
    elapsedMs >= stage.at ? stage : current
  );
}

export function DemoLoading() {
  const router = useRouter();
  const [elapsedMs, setElapsedMs] = useState(0);
  const activeStage = getStage(elapsedMs);
  const progress = activeStage.progress;

  useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      setElapsedMs(nextElapsed);
      if (nextElapsed >= DURATION_MS) {
        window.clearInterval(interval);
        router.push("/app/demo/profile");
      }
    }, 200);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl flex-col justify-center gap-8 py-8">
      <header className="flex flex-col gap-3">
        <Eyebrow>Generating profile · Arnav Chintawar</Eyebrow>
        <CaveatHeading as="h1">Making invisible work visible.</CaveatHeading>
        <p className="max-w-2xl text-[14px] leading-[1.65] text-[#666]">
          OrgGraph is scanning connected work artifacts, clustering evidence,
          and drafting an editable expertise profile.
        </p>
      </header>

      <section className="rounded-2xl border border-[#eee] bg-white p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Progress</Eyebrow>
            <p className="mt-2 text-[15px] font-semibold text-[#0a0a0a]">
              {activeStage.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold tabular-nums text-[#0a0a0a]">
              {progress}%
            </p>
            <p className="text-[11px] text-[#999]">working from evidence</p>
          </div>
        </div>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-[#f5f5f5]">
          <div
            className="h-full rounded-full bg-[#3a566e] transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <ol className="grid gap-3 md:grid-cols-2">
        {STAGES.slice(0, -1).map((stage) => {
          const complete = elapsedMs >= stage.at;
          return (
            <li
              key={stage.label}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[13px] ${
                complete
                  ? "border-[#b8cdb0] bg-[#e2edd9] text-[#3d6132]"
                  : "border-[#eee] bg-[#fafafa] text-[#777]"
              }`}
            >
              {stage.icon}
              {stage.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
