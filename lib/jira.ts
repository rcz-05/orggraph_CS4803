/**
 * Lightweight Jira (Atlassian) API client for the OAuth-connected user.
 *
 * Atlassian 3LO OAuth tokens hit `api.atlassian.com`, not the customer's
 * Jira instance directly. Two-step request pattern:
 *  1. GET /oauth/token/accessible-resources → list of cloud sites with `id`.
 *  2. GET /ex/jira/{cloudId}/rest/api/3/{path}
 *
 * For the demo we pick the first accessible site.
 */

const ATL = "https://api.atlassian.com";

const HEADERS = (token: string) => ({
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
});

export type JiraSite = {
  id: string;
  name: string;
  url: string;
  scopes: string[];
};

export type JiraUser = {
  accountId: string;
  emailAddress?: string;
  displayName: string;
  avatarUrls?: Record<string, string>;
};

export type JiraIssue = {
  key: string;
  summary: string;
  status: string;
  project: string;
  url: string;
  updated: string;
};

async function jiraFetch<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, {
    headers: HEADERS(token),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Jira API ${res.status} on ${url}`);
  }
  return (await res.json()) as T;
}

export async function fetchAccessibleSites(token: string): Promise<JiraSite[]> {
  return jiraFetch<JiraSite[]>(token, `${ATL}/oauth/token/accessible-resources`);
}

export async function fetchUser(
  token: string,
  cloudId: string
): Promise<JiraUser> {
  return jiraFetch<JiraUser>(
    token,
    `${ATL}/ex/jira/${cloudId}/rest/api/3/myself`
  );
}

type RawSearchResponse = {
  issues: Array<{
    key: string;
    fields: {
      summary: string;
      status?: { name: string };
      project?: { key: string; name: string };
      updated?: string;
    };
  }>;
};

export async function fetchRecentIssues(
  token: string,
  cloudId: string,
  siteUrl: string,
  limit = 10
): Promise<JiraIssue[]> {
  const params = new URLSearchParams({
    jql: "assignee = currentUser() ORDER BY updated DESC",
    fields: "summary,status,project,updated",
    maxResults: String(limit),
  });
  const data = await jiraFetch<RawSearchResponse>(
    token,
    `${ATL}/ex/jira/${cloudId}/rest/api/3/search?${params.toString()}`
  );
  const base = siteUrl.replace(/\/$/, "");
  return data.issues.map((i) => ({
    key: i.key,
    summary: i.fields.summary,
    status: i.fields.status?.name ?? "Unknown",
    project: i.fields.project?.name ?? i.fields.project?.key ?? "Unknown",
    url: `${base}/browse/${i.key}`,
    updated: i.fields.updated ?? "",
  }));
}

export type JiraProfile = {
  site: JiraSite;
  user: JiraUser;
  issues: JiraIssue[];
};

export async function fetchJiraProfile(
  token: string
): Promise<JiraProfile | null> {
  const sites = await fetchAccessibleSites(token);
  const site = sites[0];
  if (!site) return null;
  const [user, issues] = await Promise.all([
    fetchUser(token, site.id),
    fetchRecentIssues(token, site.id, site.url, 8),
  ]);
  return { site, user, issues };
}
