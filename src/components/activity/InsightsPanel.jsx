import { formatDuration, timeAgo } from "@/lib/time";

function Bars({ title, items, empty }) {
  const max = items[0]?.ms ?? 1;
  return (
    <div>
      <p className="mb-1.5 text-[11px] uppercase tracking-[.2em] text-ink-2">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-ink-2">{empty}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map((it, i) => (
            <li key={it.target} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate">
                  <span className="mr-2 font-mono text-xs text-scarlet-bright">{String(i + 1).padStart(2, "0")}</span>
                  {it.label}
                </span>
                <span className="flex-none font-mono text-xs text-ink-2">
                  {formatDuration(it.ms)} · {it.sessions} {it.sessions === 1 ? "viewer" : "viewers"}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-wash">
                <div className="h-full rounded-full bg-scarlet" style={{ width: `${Math.max(4, (it.ms / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** What recruiters looked at most: views, time, top projects and sections, taps. */
export function InsightsPanel({ insights: i }) {
  const stats = [
    { value: String(i.views), label: "card opens" },
    { value: String(i.viewers), label: "viewers" },
    { value: formatDuration(i.avgMs), label: "avg. time" },
  ];
  const audienceKnown = i.audience.recruiter + i.audience.student;

  return (
    <section className="rounded-2xl border border-line border-t-4 border-t-scarlet bg-card p-5 font-sys">
      <header className="flex items-baseline justify-between gap-2">
        <p className="font-semibold">What they looked at</p>
        {i.lastViewedAt && <p className="text-xs text-ink-2">last view {timeAgo(i.lastViewedAt)}</p>}
      </header>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-wash px-3 py-3 text-center">
            <p className="font-display text-2xl font-extrabold leading-none text-scarlet-bright tabular-nums">{s.value}</p>
            <p className="mt-1 text-[11px] text-ink-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <Bars title="Most looked-at projects" items={i.topProjects} empty="No one has scrolled to a project yet." />
        <Bars title="Most looked-at sections" items={i.topSections} empty="No section views yet." />
        {(i.topClicks.length > 0 || i.openedVia.length > 0 || (i.leftInfo ?? 0) > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {i.openedVia.map((v) => (
              <span key={v.label} className="rounded-full bg-wash px-2.5 py-1 text-xs text-ink-2">
                {v.count}× {v.label}
              </span>
            ))}
            {(i.leftInfo ?? 0) > 0 && <span className="rounded-full bg-wash px-2.5 py-1 text-xs text-ink-2">{i.leftInfo} left their info</span>}
            {audienceKnown > 0 && (
              <span className="rounded-full bg-wash px-2.5 py-1 text-xs text-ink-2">
                {i.audience.recruiter} recruiters · {i.audience.student} students
              </span>
            )}
            {i.topClicks.map((c) => (
              <span key={c.target} className="rounded-full bg-scarlet-tint px-2.5 py-1 text-xs text-scarlet-bright">
                {c.count}× {c.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
