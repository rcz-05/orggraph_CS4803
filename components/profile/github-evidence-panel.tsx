import Image from "next/image";
import { ExternalLink, GitBranch, GitCommit, Star } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import type { GhProfile } from "@/lib/github";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.max(1, Math.round((now - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

export function GithubEvidencePanel({ data }: { data: GhProfile }) {
  const { user, repos, commits } = data;

  return (
    <section className="rounded-2xl border border-[#eee] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Image
            src={user.avatar_url}
            alt={user.login}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full ring-1 ring-[#eee]"
            unoptimized
          />
          <div className="flex flex-col gap-1">
            <Eyebrow>Live evidence · GitHub</Eyebrow>
            <p className="text-[15px] font-semibold text-[#0a0a0a]">
              {user.name ?? user.login}{" "}
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="ml-1 text-[12px] font-normal text-[#666] hover:text-[#0a0a0a]"
              >
                @{user.login} <ExternalLink className="ml-0.5 inline h-3 w-3" />
              </a>
            </p>
            {user.bio && (
              <p className="max-w-xl text-[12px] leading-[1.55] text-[#666]">
                {user.bio}
              </p>
            )}
            <p className="text-[11px] text-[#999]">
              {user.public_repos} public repos · {user.followers} followers ·{" "}
              {user.following} following
            </p>
          </div>
        </div>
        <form action="/api/github/disconnect" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#eee] px-3 py-1.5 text-[11px] font-medium text-[#666] transition-colors hover:border-[#ddd] hover:text-[#0a0a0a]"
          >
            <GitBranch className="h-3.5 w-3.5" />
            Disconnect
          </button>
        </form>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <Eyebrow>Recent repos</Eyebrow>
          <ul className="mt-3 flex flex-col gap-2">
            {repos.length === 0 && (
              <li className="text-[12px] text-[#999]">
                No public repos to show.
              </li>
            )}
            {repos.map((r) => (
              <li
                key={r.html_url}
                className="rounded-xl border border-[#f0f0f0] p-3 transition-colors hover:border-[#ddd]"
              >
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] font-medium text-[#0a0a0a] hover:underline"
                >
                  {r.name}
                </a>
                {r.description && (
                  <p className="mt-1 text-[12px] leading-[1.5] text-[#666]">
                    {r.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#999]">
                  {r.language && (
                    <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 font-mono">
                      {r.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3" />
                    {r.stargazers_count}
                  </span>
                  <span>· pushed {relativeTime(r.pushed_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Eyebrow>Recent commits</Eyebrow>
          <ul className="mt-3 flex flex-col gap-2">
            {commits.length === 0 && (
              <li className="text-[12px] text-[#999]">
                No public push events in the last batch — try authoring a commit
                or browse a repo above.
              </li>
            )}
            {commits.map((c) => (
              <li
                key={c.url}
                className="flex items-start gap-2 rounded-xl border border-[#f0f0f0] p-3 transition-colors hover:border-[#ddd]"
              >
                <GitCommit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#999]" />
                <div className="flex flex-col gap-1">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] leading-[1.4] text-[#0a0a0a] hover:underline"
                  >
                    {c.message}
                  </a>
                  <p className="text-[11px] text-[#999]">
                    {c.repo} · {relativeTime(c.pushedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[#bbb]">
        Live from GitHub · refreshed just now
      </p>
    </section>
  );
}
