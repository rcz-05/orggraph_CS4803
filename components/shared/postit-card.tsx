import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Accent = "profile" | "search" | "teams" | "evidence" | "neutral";

const ACCENT: Record<
  Accent,
  { bg: string; badgeBg: string; badgeFg: string }
> = {
  profile: { bg: "bg-[#fce8e1]", badgeBg: "bg-[#f5c4b8]", badgeFg: "text-[#9e4433]" },
  search: { bg: "bg-[#f5edd0]", badgeBg: "bg-[#e5d5a0]", badgeFg: "text-[#7a6520]" },
  teams: { bg: "bg-[#dce4ef]", badgeBg: "bg-[#b5c5d6]", badgeFg: "text-[#3a566e]" },
  evidence: { bg: "bg-[#e2edd9]", badgeBg: "bg-[#b8cdb0]", badgeFg: "text-[#3d6132]" },
  neutral: { bg: "bg-[#f5f5f5]", badgeBg: "bg-[#e5e5e5]", badgeFg: "text-[#555]" },
};

type Props = {
  accent: Accent;
  badge: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  rotate?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PostitCard({
  accent,
  badge,
  title,
  description,
  icon,
  href,
  rotate,
  className,
  children,
}: Props) {
  const tone = ACCENT[accent];

  const inner = (
    <div
      className={cn(
        tone.bg,
        "rounded-2xl p-6 transition-all hover:shadow-md",
        className
      )}
      style={rotate ? { transform: `rotate(${rotate})` } : undefined}
    >
      <span
        className={cn(
          "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] mb-4",
          tone.badgeBg,
          tone.badgeFg
        )}
      >
        {badge}
      </span>
      <h3
        className="text-2xl font-bold text-[#0a0a0a] leading-tight mb-2"
        style={{ fontFamily: "var(--font-caveat), cursive" }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[13px] leading-[1.55] text-[#555]">{description}</p>
      )}
      {icon && <div className="mt-4 text-[#0a0a0a]/30">{icon}</div>}
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
