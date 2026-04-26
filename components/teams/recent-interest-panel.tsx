import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import { getSignalsForTeam } from "@/lib/signals";
import type { Engineer } from "@/lib/schemas";

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = then - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  if (Math.abs(diffMin) < 1) return "just now";
  if (Math.abs(diffMin) < 60) return RTF.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return RTF.format(diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  return RTF.format(diffDay, "day");
}

type Props = {
  teamSlug: string;
  engineerLookup: Map<string, Engineer>;
};

export async function RecentInterestPanel({ teamSlug, engineerLookup }: Props) {
  const signals = await getSignalsForTeam(teamSlug);

  return (
    <section className="rounded-2xl bg-[#dce4ef] p-5">
      <div className="flex items-center justify-between">
        <Eyebrow className="text-[#3a566e]/80">
          Recent interest · manager view
        </Eyebrow>
        {signals.length > 0 && (
          <span className="text-[10px] font-bold tracking-[0.12em] text-[#3a566e]/60">
            {signals.length} signal{signals.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {signals.length === 0 ? (
        <p
          className="mt-4 text-[15px] italic text-[#3a566e]/70"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          no one&apos;s signaled yet — they&apos;ll show up here when they do.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-[#b5c5d6]/40">
          {signals.map((s, i) => {
            const eng = engineerLookup.get(s.engineerId);
            const name = eng?.name ?? s.engineerId;
            const subtitle = eng ? `${eng.title} · ${eng.team}` : "";
            return (
              <li key={`${s.engineerId}-${s.at}-${i}`} className="py-2.5">
                <Link
                  href={`/app/profile/${s.engineerId}`}
                  className="group flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">
                      {name}
                    </span>
                    {subtitle && (
                      <span className="text-[11px] text-[#3a566e]/80">
                        {subtitle}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tabular-nums text-[#3a566e]/70">
                      {formatRelative(s.at)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-[#3a566e]/50 transition-transform group-hover:translate-x-0.5 group-hover:text-[#3a566e]" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
