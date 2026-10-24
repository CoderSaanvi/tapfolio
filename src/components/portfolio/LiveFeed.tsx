import { getLiveRepos } from "@/lib/github";
import { timeAgo } from "@/lib/time";
import { TrackedSection } from "@/components/tracking/TrackedSection";

interface LiveFeedProps {
  githubUser: string;
}

/** "What I'm building right now": latest pushes from public GitHub repos. Hidden if GitHub is unreachable. */
export async function LiveFeed({ githubUser }: LiveFeedProps) {
  const repos = await getLiveRepos(githubUser);
  if (repos.length === 0) return null;

  return (
    <TrackedSection id="live" label="Live: building right now">
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[.08em] text-scarlet before:h-2 before:w-2 before:animate-pulse before:rounded-full before:bg-scarlet">
          Building right now
        </p>
        <ul className="m-0 flex list-none flex-col divide-y divide-line-soft p-0">
          {repos.map((r) => (
            <li key={r.name} className="py-3 first:pt-0 last:pb-0">
              <a
                href={r.lastCommit?.url ?? r.url}
                target="_blank"
                rel="noopener"
                data-track={`live:${r.name}`}
                data-label={`Opened live repo ${r.name}`}
                className="flex items-baseline justify-between gap-3 text-ink no-underline"
              >
                <span className="min-w-0">
                  <b className="font-display text-xl font-bold">{r.name}</b>
                  {r.language && <span className="ml-2 font-mono text-xs text-ink-2">{r.language}</span>}
                  <span className="block truncate text-sm text-ink-2">{r.lastCommit?.message ?? r.description ?? "Recent push"}</span>
                </span>
                <span className="flex-none font-mono text-xs text-ink-2">{timeAgo(r.lastCommit?.at || r.pushedAt)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </TrackedSection>
  );
}
