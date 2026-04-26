import { Target } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";

type Props = {
  teamName: string;
  score: number;
  reasons: string[];
};

export function ManagerMatchCard({ teamName, score, reasons }: Props) {
  return (
    <section className="rounded-2xl bg-[#dce4ef] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-2">
          <Eyebrow className="text-[#3a566e]/80">
            Manager match · {teamName}
          </Eyebrow>
          <p className="text-[14px] leading-[1.65] text-[#3a566e]">
            Local fit estimate based on this engineer&apos;s profile against your
            team&apos;s tech stack, active projects, and skill gaps.
          </p>
        </div>
        <div className="flex min-w-28 flex-col items-center rounded-2xl bg-white/70 px-5 py-4 text-[#3a566e]">
          <Target className="h-4 w-4" />
          <span className="mt-1 text-3xl font-bold tabular-nums">{score}%</span>
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase">
            match
          </span>
        </div>
      </div>
      {reasons.length > 0 && (
        <ul className="mt-4 grid gap-2 md:grid-cols-3">
          {reasons.slice(0, 3).map((reason) => (
            <li
              key={reason}
              className="rounded-xl bg-white/65 px-3 py-2 text-[12px] leading-[1.5] text-[#3a566e]"
            >
              {reason}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
