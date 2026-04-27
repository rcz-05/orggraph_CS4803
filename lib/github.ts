/**
 * Lightweight GitHub API client for the OAuth-connected user.
 *
 * Uses plain fetch (no Octokit dep) since we only call a handful of endpoints
 * and don't need full SDK ergonomics for the demo. All fetches are server-side
 * — the access token never reaches the client.
 */

const GH = "https://api.github.com";

type GhUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  company: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
};

type GhRepoLite = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  html_url: string;
};

export type GhCommit = {
  message: string;
  url: string; // human-readable html url
  repo: string; // owner/repo
  pushedAt: string; // ISO
};

const HEADERS = (token: string) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

async function ghFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${GH}${path}`, {
    headers: HEADERS(token),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

export async function fetchUser(token: string): Promise<GhUser> {
  return ghFetch<GhUser>(token, "/user");
}

export async function fetchRecentRepos(
  token: string,
  limit = 5
): Promise<GhRepoLite[]> {
  // Sort by pushed (most recently active first), public-only via affiliation.
  const repos = await ghFetch<GhRepoLite[]>(
    token,
    `/user/repos?sort=pushed&affiliation=owner,collaborator&per_page=${limit}`
  );
  return repos.slice(0, limit);
}

type GhEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    commits?: Array<{
      sha: string;
      message: string;
      url: string; // api url
    }>;
    ref?: string;
  };
};

export async function fetchRecentCommits(
  token: string,
  login: string,
  limit = 8
): Promise<GhCommit[]> {
  // Public events feed has the last ~30 events. Push events contain commits.
  const events = await ghFetch<GhEvent[]>(
    token,
    `/users/${login}/events/public?per_page=30`
  );

  const commits: GhCommit[] = [];
  for (const ev of events) {
    if (ev.type !== "PushEvent") continue;
    if (!ev.payload.commits) continue;
    for (const c of ev.payload.commits) {
      commits.push({
        message: c.message.split("\n")[0], // headline only
        url: `https://github.com/${ev.repo.name}/commit/${c.sha}`,
        repo: ev.repo.name,
        pushedAt: ev.created_at,
      });
      if (commits.length >= limit) return commits;
    }
  }
  return commits;
}

export type GhProfile = {
  user: GhUser;
  repos: GhRepoLite[];
  commits: GhCommit[];
};

export async function fetchGhProfile(token: string): Promise<GhProfile> {
  // Step 1: identity (so we know the login).
  const user = await fetchUser(token);
  // Step 2: parallel fetch repos + commits.
  const [repos, commits] = await Promise.all([
    fetchRecentRepos(token, 5),
    fetchRecentCommits(token, user.login, 8),
  ]);
  return { user, repos, commits };
}
