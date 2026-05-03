"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  GitPullRequest,
  MessageSquare,
  Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { Eyebrow } from "@/components/shared/eyebrow";
import { cn } from "@/lib/utils";

type OauthStatus = { connected: false } | { connected: true; label: string };

type Props = {
  github: OauthStatus;
  jira: OauthStatus;
  flashGh: string | null;
  flashJira: string | null;
  flashReason: string | null;
};

const RETURN_TO = "/app/demo";

export function DemoConnectors({
  github,
  jira,
  flashGh,
  flashJira,
  flashReason,
}: Props) {
  const router = useRouter();
  const [slackToggled, setSlackToggled] = useState(false);

  const githubConnected = github.connected;
  const jiraConnected = jira.connected;

  const connectedCount =
    (githubConnected ? 1 : 0) +
    (jiraConnected ? 1 : 0) +
    (slackToggled ? 1 : 0);
  const canContinue = connectedCount > 0;

  const sources = useMemo(() => {
    const out: string[] = [];
    if (githubConnected) out.push("github");
    if (jiraConnected) out.push("jira");
    if (slackToggled) out.push("slack");
    return out;
  }, [githubConnected, jiraConnected, slackToggled]);

  const buttonLabel = canContinue
    ? "Continue"
    : "Connect at least 1 tool to continue";

  function startConnect(provider: "github" | "jira") {
    const url = `/api/${provider}/connect?return_to=${encodeURIComponent(
      RETURN_TO
    )}`;
    window.location.href = url;
  }

  function disconnect(provider: "github" | "jira") {
    const url = `/api/${provider}/disconnect?return_to=${encodeURIComponent(
      RETURN_TO
    )}`;
    window.location.href = url;
  }

  const flashes: Array<{ tone: "info" | "warn" | "error"; text: string }> = [];
  if (flashGh === "connected")
    flashes.push({ tone: "info", text: "GitHub connected." });
  if (flashGh === "disconnected")
    flashes.push({ tone: "info", text: "GitHub disconnected." });
  if (flashGh === "cancelled")
    flashes.push({
      tone: "warn",
      text: "GitHub authorization was cancelled.",
    });
  if (flashGh === "error")
    flashes.push({
      tone: "error",
      text: `GitHub connection failed${flashReason ? ` (${flashReason})` : ""}.`,
    });

  if (flashJira === "connected")
    flashes.push({ tone: "info", text: "Jira connected." });
  if (flashJira === "disconnected")
    flashes.push({ tone: "info", text: "Jira disconnected." });
  if (flashJira === "cancelled")
    flashes.push({ tone: "warn", text: "Jira authorization was cancelled." });
  if (flashJira === "error" && flashReason === "not_configured")
    flashes.push({
      tone: "warn",
      text: "Jira OAuth isn't configured yet — register an Atlassian OAuth 2.0 (3LO) app and set JIRA_CLIENT_ID / JIRA_CLIENT_SECRET / JIRA_REDIRECT_URI in the environment.",
    });
  if (flashJira === "error" && flashReason !== "not_configured")
    flashes.push({
      tone: "error",
      text: `Jira connection failed${flashReason ? ` (${flashReason})` : ""}.`,
    });

  return (
    <div className="flex flex-col gap-10 py-4">
      <header className="flex flex-col gap-3">
        <Eyebrow>Profile generation demo</Eyebrow>
        <CaveatHeading as="h1">Connect your work graph.</CaveatHeading>
        <p className="max-w-2xl text-[14px] leading-[1.65] text-[#666]">
          Choose the tools OrgGraph should scan for evidence. GitHub and Jira
          run real OAuth flows — the consent screens you see are the real ones.
          The pipeline still runs against seeded artifacts for the demo
          engineer (Arnav Chintawar).
        </p>
      </header>

      {flashes.length > 0 && (
        <div className="flex flex-col gap-2">
          {flashes.map((f, i) => (
            <p
              key={i}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-[12px]",
                f.tone === "info" &&
                  "border-[#b8cdb0] bg-[#e2edd9] text-[#3d6132]",
                f.tone === "warn" &&
                  "border-[#e5d5a0] bg-[#f5edd0] text-[#7a6520]",
                f.tone === "error" &&
                  "border-[#f5c4b8] bg-[#fce8e1] text-[#9e4433]"
              )}
            >
              {f.text}
            </p>
          ))}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        <ConnectorCard
          name="GitHub"
          description="Pull requests, reviews, ownership, and technical review depth."
          accent="bg-[#fce8e1] text-[#9e4433] ring-[#f5c4b8]"
          icon={<GitPullRequest className="h-5 w-5" />}
          status={github}
          onConnect={() => startConnect("github")}
          onDisconnect={() => disconnect("github")}
        />
        <ConnectorCard
          name="Jira"
          description="Tickets, delivery scope, incident work, and project leadership."
          accent="bg-[#f5edd0] text-[#7a6520] ring-[#e5d5a0]"
          icon={<Ticket className="h-5 w-5" />}
          status={jira}
          onConnect={() => startConnect("jira")}
          onDisconnect={() => disconnect("jira")}
        />
        <ConnectorCard
          name="Slack"
          description="Design discussion, mentoring, unblock messages, and team support."
          accent="bg-[#dce4ef] text-[#3a566e] ring-[#b5c5d6]"
          icon={<MessageSquare className="h-5 w-5" />}
          status={
            slackToggled
              ? { connected: true, label: "Selected (stub)" }
              : { connected: false }
          }
          onConnect={() => setSlackToggled(true)}
          onDisconnect={() => setSlackToggled(false)}
          stubBadge="Demo stub"
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#eee] bg-[#fafafa] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Eyebrow>Selected sources</Eyebrow>
          <p className="mt-1 text-[13px] text-[#666]">
            {sources.length > 0
              ? sources
                  .map((s) => s[0].toUpperCase() + s.slice(1))
                  .join(", ")
              : "No tools connected yet."}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          disabled={!canContinue}
          onClick={() => {
            const qs = sources.join(",");
            router.push(`/app/loading?sources=${encodeURIComponent(qs)}`);
          }}
        >
          {buttonLabel}
          {canContinue && <ArrowRight className="h-4 w-4" />}
        </Button>
      </section>
    </div>
  );
}

function ConnectorCard({
  name,
  description,
  accent,
  icon,
  status,
  onConnect,
  onDisconnect,
  stubBadge,
}: {
  name: string;
  description: string;
  accent: string;
  icon: React.ReactNode;
  status: OauthStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  stubBadge?: string;
}) {
  const isConnected = status.connected;
  const label = isConnected ? status.label : null;

  return (
    <div
      className={cn(
        "group flex min-h-64 flex-col items-start justify-between rounded-2xl p-6 text-left ring-1 transition-all",
        accent
      )}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <span className="rounded-full bg-white/60 p-3">{icon}</span>
        <div className="flex flex-col items-end gap-1">
          {isConnected ? (
            <Badge variant="evidence">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )}
          {stubBadge && (
            <span className="text-[10px] uppercase tracking-[0.18em] opacity-60">
              {stubBadge}
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <div>
          <h2
            className="text-3xl font-bold leading-tight text-[#0a0a0a]"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            {name}
          </h2>
          <p className="mt-2 text-[13px] leading-[1.55] text-[#444]">
            {description}
          </p>
        </div>

        <div className="mt-2 flex w-full items-center justify-between gap-2">
          {isConnected ? (
            <>
              <span className="truncate text-[12px] font-medium text-[#0a0a0a]">
                {label}
              </span>
              <button
                type="button"
                onClick={onDisconnect}
                className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-medium text-[#0a0a0a] transition-colors hover:bg-white"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#0a0a0a] px-3.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-85"
            >
              Connect {name}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
