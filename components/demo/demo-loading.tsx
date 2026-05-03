"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  GitPullRequest,
  MessageSquare,
  Sparkles,
  Ticket,
} from "lucide-react";

import { CaveatHeading } from "@/components/shared/caveat-heading";
import { Eyebrow } from "@/components/shared/eyebrow";

const STAGES = [
  { progress: 5, label: "Connecting to selected work sources", icon: <GitPullRequest className="h-4 w-4" /> },
  { progress: 35, label: "Condensing commits, PRs, Jira tickets, and sprints", icon: <Ticket className="h-4 w-4" /> },
  { progress: 65, label: "Consolidating repository-level ownership", icon: <GitPullRequest className="h-4 w-4" /> },
  { progress: 90, label: "Drafting profile from staged evidence", icon: <Sparkles className="h-4 w-4" /> },
  { progress: 100, label: "Profile ready", icon: <CheckCircle2 className="h-4 w-4" /> },
];

type PipelineState = {
  condensed?: unknown[];
  profileInput?: unknown;
};

export function DemoLoading() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const activeStage = STAGES[stageIndex];
  const progress = activeStage.progress;

  useEffect(() => {
    let cancelled = false;
    const sources =
      searchParams
        .get("sources")
        ?.split(",")
        .map((source) => source.trim())
        .filter(Boolean) ?? [];

    async function runPipeline() {
      try {
        setError(null);
        setStageIndex(0);

        const state: PipelineState = {};

        setStageIndex(1);
        const phase1 = await postJson<{
          condensed: unknown[];
        }>("/api/demo/pipeline/phase1", { sources });
        state.condensed = phase1.condensed;
        if (cancelled) return;

        setStageIndex(2);
        const phase2 = await postJson<{
          profileInput: unknown;
        }>("/api/demo/pipeline/phase2", {
          condensed: state.condensed,
        });
        state.profileInput = phase2.profileInput;
        if (cancelled) return;

        setStageIndex(3);
        await postJson("/api/demo/pipeline/phase3", {
          profileInput: state.profileInput,
        });
        if (cancelled) return;

        setStageIndex(4);
        window.setTimeout(() => {
          if (!cancelled) router.push("/app/demo/profile");
        }, 600);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Pipeline failed");
        }
      }
    }

    void runPipeline();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

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
              {error ? "Pipeline needs attention" : activeStage.label}
            </p>
            {error && (
              <p className="mt-2 max-w-xl text-[12px] leading-[1.5] text-[#9e4433]">
                {error}
              </p>
            )}
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
        {STAGES.slice(0, -1).map((stage, index) => {
          const complete = index <= stageIndex && !error;
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

async function postJson<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as { error?: string }) : {};

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  return data as T;
}
