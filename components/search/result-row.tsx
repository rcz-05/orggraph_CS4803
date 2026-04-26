import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MatchScoreBadge } from "./match-score-badge";
import type { SearchResult, Engineer } from "@/lib/schemas";

type Props = { result: SearchResult; engineer: Engineer | null };

export function ResultRow({ result, engineer }: Props) {
  const name = engineer?.name ?? result.engineerId;
  const subtitle = engineer ? `${engineer.title} · ${engineer.team}` : "";

  return (
    <Link
      href={`/app/profile/${result.engineerId}`}
      className="group flex items-start gap-4 rounded-2xl border border-[#eee] bg-white p-5 pl-6 transition-all hover:border-[#e5d5a0] hover:shadow-md"
      style={{ borderLeft: "4px solid #e5d5a0" }}
    >
      <MatchScoreBadge score={result.matchScore} className="mt-0.5" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold text-[#0a0a0a]">{name}</span>
          {subtitle && (
            <span className="text-[12px] text-[#666]">{subtitle}</span>
          )}
          {result.openToTransfer && (
            <Badge variant="evidence">Open to transfer</Badge>
          )}
        </div>
        <p className="text-[13px] leading-[1.55] text-[#444]">{result.reason}</p>
        {result.matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {result.matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-[#f5edd0] px-2 py-0.5 text-[11px] font-medium text-[#7a6520]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#bbb] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0a0a0a]" />
    </Link>
  );
}
