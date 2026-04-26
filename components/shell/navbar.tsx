import Link from "next/link";

import { getRole } from "@/lib/session-server";
import { RoleSwitcher } from "./role-switcher";

export async function Navbar() {
  const role = await getRole();
  const nav =
    role === "manager"
      ? [
          { href: "/app", label: "Dashboard" },
          { href: "/app/teams/payments-architecture", label: "My team" },
          { href: "/app/search", label: "Talent search" },
          { href: "/app/teams", label: "Teams" },
          { href: "/app/interests", label: "Interests" },
        ]
      : [
          { href: "/app", label: "Dashboard" },
          { href: "/app/profile", label: "My profile" },
          { href: "/app/teams", label: "Teams" },
          { href: "/app/interests", label: "Interests" },
        ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#eee] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/app"
            className="text-base font-semibold tracking-tight text-[#0a0a0a]"
          >
            OrgGraph.
          </Link>
          <nav className="hidden gap-6 text-[13px] font-medium text-[#666] md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="transition-colors hover:text-[#0a0a0a]"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <RoleSwitcher current={role} />
      </div>
    </header>
  );
}
