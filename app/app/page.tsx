import { User, Search, Layers, Sparkles } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { PostitCard } from "@/components/shared/postit-card";
import { getRole } from "@/lib/session-server";

export default async function DashboardHub() {
  const role = await getRole();
  const greeting =
    role === "manager" ? "Find your next teammate." : "What's your hidden expertise?";

  return (
    <div className="flex flex-col gap-12 py-4">
      <header className="flex flex-col gap-3">
        <Eyebrow>Dashboard</Eyebrow>
        <CaveatHeading as="h1">{greeting}</CaveatHeading>
        <p className="max-w-2xl text-[14px] leading-[1.65] text-[#666]">
          {role === "manager"
            ? "Search the org by real skills. Browse teams. Surface internal candidates before going external."
            : "Your work — across GitHub, Jira, and Slack — turned into an evidence-based profile, plus a portal for finding teams that fit you."}
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <PostitCard
          accent="profile"
          badge="PROFILES"
          title="My profile"
          description="Auto-generated from your real work signals. Edit, publish, and signal your transfer interest."
          icon={<User className="h-4 w-4" />}
          href="/app/profile"
        />
        <PostitCard
          accent="search"
          badge="SEARCH"
          title="Talent search"
          description='"Who has React experience?" Ranked internal candidates with evidence and transfer interest.'
          icon={<Search className="h-4 w-4" />}
          href="/app/search"
        />
        <PostitCard
          accent="teams"
          badge="TEAMS"
          title="Team portal"
          description="Browse internal teams, their tech, current projects, and skill gaps. Signal interest in seconds."
          icon={<Layers className="h-4 w-4" />}
          href="/app/teams"
        />
      </section>

      <section className="rounded-2xl border border-[#eee] bg-[#fafafa] p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="mt-0.5 h-4 w-4 text-[#aaa]" />
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-[#0a0a0a]">
              You&apos;re viewing the {role === "manager" ? "Manager" : "Engineer"} surface.
            </p>
            <p className="text-[12px] leading-[1.55] text-[#666]">
              Use the role switcher in the navbar to flip between views. The role
              cookie persists across pages — handy when you want to demo both
              flows back-to-back.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
