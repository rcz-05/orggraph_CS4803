"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { Eyebrow } from "@/components/shared/eyebrow";

type Props = { engineerId: string; engineerName: string };

export function GenerateEmptyState({ engineerId, engineerName }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ engineerId }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Generation failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-6 rounded-2xl bg-[#fce8e1] p-10">
      <Eyebrow className="text-[#9e4433]/80">No profile yet</Eyebrow>
      <CaveatHeading as="h2">{engineerName}, let&apos;s sketch your profile.</CaveatHeading>
      <p className="max-w-xl text-[14px] leading-[1.65] text-[#5e3128]">
        We&apos;ll read your seeded GitHub PRs, Jira tickets, and Slack
        snippets and turn them into evidence-based skills, project themes, and
        contribution highlights. You review the draft before publishing.
      </p>
      <Button onClick={generate} disabled={pending} size="lg">
        <Sparkles className="h-4 w-4" />
        {pending ? "sketching your profile…" : "Generate my profile"}
      </Button>
      {pending && (
        <p
          className="text-[14px] italic text-[#9e4433]/80"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          sketching your profile…
        </p>
      )}
      {error && (
        <p className="text-[12px] text-[#9e4433]">{error}</p>
      )}
    </div>
  );
}
