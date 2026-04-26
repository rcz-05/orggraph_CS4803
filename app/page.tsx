import Link from "next/link";

import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";

export default function MarketingRoot() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Eyebrow>Engineering Intelligence</Eyebrow>
      <CaveatHeading as="h1">
        Make Invisible Work
        <br />
        Visible.
      </CaveatHeading>
      <p className="max-w-xl text-[15px] leading-[1.65] text-[#666]">
        OrgGraph turns the work engineers already do — GitHub commits, Jira
        tickets, Slack threads — into evidence-based expertise profiles, a
        skill-based search for managers, and a team discovery portal for
        engineers.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/app"
          className="rounded-full bg-[#0a0a0a] px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Open the app
        </Link>
        <a
          href="https://orggraphteam6landing.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[#e5e5e5] px-5 py-2.5 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
        >
          See the marketing site →
        </a>
      </div>
      <p className="mt-6 text-[11px] text-[#bbb]">
        CS 4803 capstone · Group 6 · Demo build
      </p>
    </main>
  );
}
