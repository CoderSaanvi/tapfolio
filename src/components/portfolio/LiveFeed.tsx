import { getLiveRepos } from "@/lib/github";
import { timeAgo } from "@/lib/time";

interface LiveFeedProps {
  githubUser: string;
}

/** Latest pushes from public GitHub repos, refreshed every 5 minutes. Hidden if GitHub is unreachable. */
export async function LiveFeed({ githubUser }: LiveFeedProps) {
  if (!githubUser) return null;
  const repos = await getLiveRepos(githubUser);
  if (repos.length === 0) return null;

  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3">
      <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-ink-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Live from GitHub
      </p>
      <ul className="m-0 flex list-none flex-col divide-y divide-line-soft p-0">
        {repos.map((r) => (
          <li key={r.name}>
            <a
              href={r.lastCommit?.url ?? r.url}
              target="_blank"
              rel="noopener"
              data-track={`live:${r.name}`}
              data-label={`Opened live repo ${r.name}`}
              className="flex items-baseline justify-between gap-3 py-2.5 text-ink no-underline"
            >
              <span className="min-w-0">
                <span className="text-[14.5px] font-medium">{r.name}</span>
                {r.language && <span className="ml-2 font-mono text-[11px] text-ink-2">{r.language}</span>}
                <span className="block truncate text-[13px] text-ink-2">{r.lastCommit?.message ?? r.description ?? "Recent push"}</span>
              </span>
              <span className="flex-none font-mono text-[11px] text-scarlet-bright">{timeAgo(r.lastCommit?.at || r.pushedAt)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
