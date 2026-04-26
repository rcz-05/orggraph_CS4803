import { cn } from "@/lib/utils";

type Props = { score: number; className?: string };

export function MatchScoreBadge({ score, className }: Props) {
  const tone =
    score >= 75
      ? "bg-[#b8cdb0] text-[#3d6132]"
      : score >= 50
        ? "bg-[#e5d5a0] text-[#7a6520]"
        : "bg-[#eee] text-[#666]";
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-12 shrink-0 items-center justify-center rounded-full px-2 text-[12px] font-semibold tabular-nums",
        tone,
        className
      )}
    >
      {clamped}
    </span>
  );
}
