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

type ConnectorId = "github" | "jira" | "slack";

type Connector = {
  id: ConnectorId;
  name: string;
  description: string;
  accent: string;
  icon: React.ReactNode;
  connect: () => Promise<void>;
};

const CONNECTORS: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Pull requests, reviews, ownership, and technical review depth.",
    accent: "bg-[#fce8e1] text-[#9e4433] ring-[#f5c4b8]",
    icon: <GitPullRequest className="h-5 w-5" />,
    connect: async () => {},
  },
  {
    id: "jira",
    name: "Jira",
    description: "Tickets, delivery scope, incident work, and project leadership.",
    accent: "bg-[#f5edd0] text-[#7a6520] ring-[#e5d5a0]",
    icon: <Ticket className="h-5 w-5" />,
    connect: async () => {},
  },
  {
    id: "slack",
    name: "Slack",
    description: "Design discussion, mentoring, unblock messages, and team support.",
    accent: "bg-[#dce4ef] text-[#3a566e] ring-[#b5c5d6]",
    icon: <MessageSquare className="h-5 w-5" />,
    connect: async () => {},
  },
];

export function DemoConnectors() {
  const router = useRouter();
  const [connected, setConnected] = useState<Set<ConnectorId>>(new Set());
  const connectedCount = connected.size;
  const canContinue = connectedCount > 0;
  const buttonLabel = canContinue
    ? "Continue"
    : "Connect at least 1 tool to continue";

  const connectedNames = useMemo(
    () =>
      CONNECTORS.filter((connector) => connected.has(connector.id)).map(
        (connector) => connector.name
      ),
    [connected]
  );

  async function toggleConnector(connector: Connector) {
    if (connected.has(connector.id)) {
      setConnected((current) => {
        const next = new Set(current);
        next.delete(connector.id);
        return next;
      });
      return;
    }

    await connector.connect();
    setConnected((current) => new Set(current).add(connector.id));
  }

  return (
    <div className="flex flex-col gap-10 py-4">
      <header className="flex flex-col gap-3">
        <Eyebrow>Profile generation demo</Eyebrow>
        <CaveatHeading as="h1">Connect your work graph.</CaveatHeading>
        <p className="max-w-2xl text-[14px] leading-[1.65] text-[#666]">
          Choose the tools OrgGraph should scan for evidence. These buttons are
          demo stubs today; each connector has a single `connect` hook where
          real OAuth can be wired later.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        {CONNECTORS.map((connector) => {
          const isConnected = connected.has(connector.id);
          return (
            <button
              key={connector.id}
              type="button"
              onClick={() => toggleConnector(connector)}
              className={cn(
                "group flex min-h-64 flex-col items-start justify-between rounded-2xl p-6 text-left ring-1 transition-all hover:-rotate-1 hover:shadow-md",
                connector.accent
              )}
            >
              <div className="flex w-full items-start justify-between gap-4">
                <span className="rounded-full bg-white/60 p-3">
                  {connector.icon}
                </span>
                {isConnected ? (
                  <Badge variant="evidence">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">Not connected</Badge>
                )}
              </div>
              <div>
                <h2
                  className="text-3xl font-bold leading-tight text-[#0a0a0a]"
                  style={{ fontFamily: "var(--font-caveat), cursive" }}
                >
                  {connector.name}
                </h2>
                <p className="mt-2 text-[13px] leading-[1.55] text-[#444]">
                  {connector.description}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#eee] bg-[#fafafa] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Eyebrow>Selected sources</Eyebrow>
          <p className="mt-1 text-[13px] text-[#666]">
            {connectedNames.length > 0
              ? connectedNames.join(", ")
              : "No tools connected yet."}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          disabled={!canContinue}
          onClick={() => router.push("/app/loading")}
        >
          {buttonLabel}
          {canContinue && <ArrowRight className="h-4 w-4" />}
        </Button>
      </section>
    </div>
  );
}
