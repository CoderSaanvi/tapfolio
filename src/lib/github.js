import "server-only";

function headers() {
  const h = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function lastCommit(fullName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=1`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return undefined;
    const [c] = await res.json();
    if (!c) return undefined;
    return { message: c.commit.message.split("\n")[0], url: c.html_url, at: c.commit.author?.date ?? "" };
  } catch {
    return undefined;
  }
}

/** The user's most recently pushed public repos, refreshed every 5 minutes. Empty on any failure. */
export async function getLiveRepos(user, limit = 3) {
  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=10`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const repos = (await res.json()).filter((r) => !r.fork).slice(0, limit);
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
