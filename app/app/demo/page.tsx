import { DemoEngineerView } from "@/components/demo/demo-engineer-view";
import { DemoConnectors } from "@/components/demo/demo-connectors";
import { readTokenCookie as readGithubToken } from "@/lib/github-oauth";
import { readTokenCookie as readJiraToken } from "@/lib/jira-oauth";
import { fetchUser as fetchGithubUser } from "@/lib/github";
import { fetchAccessibleSites, fetchUser as fetchJiraUser } from "@/lib/jira";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  gh?: string;
  jira?: string;
  reason?: string;
}>;

type ConnectorStatus =
  | { connected: false }
  | { connected: true; label: string };

async function loadGithub(): Promise<ConnectorStatus> {
  const token = await readGithubToken();
  if (!token) return { connected: false };
  try {
    const user = await fetchGithubUser(token);
    return { connected: true, label: `@${user.login}` };
  } catch (err) {
    console.error("GitHub user fetch failed on /app/demo:", err);
    return { connected: false };
  }
}

async function loadJira(): Promise<ConnectorStatus> {
  const token = await readJiraToken();
  if (!token) return { connected: false };
  try {
    const sites = await fetchAccessibleSites(token);
    const site = sites[0];
    if (!site) return { connected: true, label: "Connected" };
    const user = await fetchJiraUser(token, site.id);
    return {
      connected: true,
      label: user.displayName || site.name,
    };
  } catch (err) {
    console.error("Jira fetch failed on /app/demo:", err);
    return { connected: false };
  }
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [github, jira] = await Promise.all([loadGithub(), loadJira()]);

  return (
    <>
      <DemoEngineerView />
      <DemoConnectors
        github={github}
        jira={jira}
        flashGh={params.gh ?? null}
        flashJira={params.jira ?? null}
        flashReason={params.reason ?? null}
      />
    </>
  );
}
