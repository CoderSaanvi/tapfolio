import "server-only";

export interface LiveRepo {
  name: string;
  description: string | null;
  url: string;
  pushedAt: string;
  language: string | null;
  lastCommit?: { message: string; url: string; at: string };
}

interface RepoResponse {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  pushed_at: string;
  language: string | null;
  fork: boolean;
}

interface CommitResponse {
  html_url: string;
  commit: { message: string; author: { date: string } | null };
}

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function lastCommit(fullName: string): Promise<LiveRepo["lastCommit"]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=1`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return undefined;
    const [c] = (await res.json()) as CommitResponse[];
    if (!c) return undefined;
    return { message: c.commit.message.split("\n")[0], url: c.html_url, at: c.commit.author?.date ?? "" };
  } catch {
    return undefined;
  }
}

/** The user's most recently pushed public repos, refreshed every 5 minutes. Empty on any failure. */
export async function getLiveRepos(user: string, limit = 3): Promise<LiveRepo[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=10`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const repos = ((await res.json()) as RepoResponse[]).filter((r) => !r.fork).slice(0, limit);
    return Promise.all(
      repos.map(async (r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        pushedAt: r.pushed_at,
        language: r.language,
        lastCommit: await lastCommit(r.full_name),
      })),
    );
  } catch {
    return [];
  }
}
