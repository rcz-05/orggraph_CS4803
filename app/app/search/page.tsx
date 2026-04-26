import { redirect } from "next/navigation";

import { SearchPageClient } from "@/components/search/search-page-client";
import { getRole } from "@/lib/session-server";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const role = await getRole();

  if (role === "engineer") {
    redirect("/app/teams");
  }

  return <SearchPageClient />;
}
