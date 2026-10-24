import { formatDuration, timeAgo } from "@/lib/time";
import type { ViewSession } from "@/lib/sessions";

interface SessionCardProps {
  session: ViewSession;
}

export function SessionCard({ session: s }: SessionCardProps) {
  const max = s.sections[0]?.ms ?? 1;

  return (
    <article className="rounded-2xl border border-line border-t-4 border-t-scarlet bg-card p-5 font-sys">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-semibold">{s.eventName || "No event set"}</p>
          <p className="text-xs text-ink-2">
            {s.device} · {s.openedVia}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold leading-none text-scarlet-bright tabular-nums">{formatDuration(s.totalMs)}</p>
          <p className="text-xs text-ink-2">{timeAgo(s.startedAt)}</p>
        </div>
      </header>

      {s.sections.length > 0 ? (
        <ul className="mt-4 flex list-none flex-col gap-2 p-0">
          {s.sections.map((sec) => (
            <li key={sec.target} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate">{sec.label}</span>
                <span className="flex-none font-mono text-xs text-ink-2">{formatDuration(sec.ms)}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-wash">
                <div className="h-full rounded-full bg-scarlet" style={{ width: `${Math.max(4, (sec.ms / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ink-2">Opened the card but didn&apos;t scroll into any section yet.</p>
      )}

      {s.clicks.length > 0 && (
        <div className="mt-4 border-t border-line-soft pt-3">
          <p className="mb-1.5 text-[11px] uppercase tracking-[.2em] text-ink-2">Actions</p>
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {s.clicks.map((c) => (
              <li key={c.at + c.label} className="rounded-full bg-scarlet-tint px-2.5 py-1 text-xs text-scarlet-bright">
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
