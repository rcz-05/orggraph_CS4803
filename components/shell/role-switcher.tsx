"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { COOKIE_NAMES, type Role } from "@/lib/session";

const OPTIONS: { value: Role; label: string }[] = [
  { value: "engineer", label: "Engineer view" },
  { value: "manager", label: "Manager view" },
];

function setCookie(name: string, value: string) {
  const oneWeek = 60 * 60 * 24 * 7;
  document.cookie = `${name}=${value}; path=/; max-age=${oneWeek}; SameSite=Lax`;
}

export function RoleSwitcher({ current }: { current: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function pick(role: Role) {
    if (role === current) return;
    setCookie(COOKIE_NAMES.role, role);
    startTransition(() => {
      if (role === "engineer" && pathname.startsWith("/app/search")) {
        router.push("/app/teams");
      } else if (role === "manager" && pathname.startsWith("/app/profile")) {
        router.push("/app/teams/payments-architecture");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-[#eee] bg-white p-0.5 text-[12px]">
      {OPTIONS.map((opt) => {
        const active = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => pick(opt.value)}
            disabled={pending}
            className={cn(
              "rounded-full px-3 py-1.5 transition-colors",
              active
                ? "bg-[#0a0a0a] text-white"
                : "text-[#666] hover:text-[#0a0a0a]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
