import { GitBranch } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";

type Props = {
  state?: "idle" | "cancelled" | "error";
};

const ERROR_COPY: Record<NonNullable<Props["state"]>, string | null> = {
  idle: null,
  cancelled: "GitHub authorization was cancelled. Try again any time.",
  error:
    "Something went wrong with the GitHub handshake. Try once more — this is real OAuth, not a stub.",
};

export function GithubConnectBanner({ state = "idle" }: Props) {
  const errorCopy = ERROR_COPY[state];

  return (
    <section
      className="rounded-2xl bg-[#fce8e1] p-6 transition-all"
      style={{ transform: "rotate(-1deg)" }}
    >
      <div className="-rotate-1 transform-gpu">
        <span className="inline-block rounded-full bg-[#f5c4b8] px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[#9e4433]">
          LIVE EVIDENCE · OPTIONAL
        </span>
        <h3
          className="mt-3 text-2xl font-bold leading-tight text-[#0a0a0a]"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          Connect your real GitHub
        </h3>
        <p className="mt-2 max-w-xl text-[13px] leading-[1.55] text-[#555]">
          Click below and OrgGraph will read your public profile and recent
          commits — no writes, no private repos. The seeded profile above stays
          intact; we just append a live evidence panel pulled straight from
          GitHub.
        </p>
        {errorCopy && (
          <p className="mt-3 max-w-xl text-[12px] leading-[1.55] text-[#9e4433]">
            {errorCopy}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href="/api/github/connect"
            className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            <GitBranch className="h-4 w-4" />
            Connect GitHub
          </a>
          <Eyebrow className="text-[#9e4433]/70">
            Scope: read:user · public_repo
          </Eyebrow>
        </div>
      </div>
    </section>
  );
}
