import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TrackedSection } from "@/components/tracking/TrackedSection";

function Header({ item, chevron }) {
  return (
    <>
      <LogoTile logo={item.logo} mark={item.mark} />
      <span className="flex min-w-0 flex-1 flex-col leading-snug">
        <span className="font-medium text-scarlet-bright">{item.org.split(" · ")[0]}</span>
        <span className="text-sm text-ink-2">{item.title}</span>
        <span className="mt-0.5 font-mono text-[11px] text-ink-2 sm:hidden">{item.when}</span>
      </span>
      <span className="hidden flex-none font-mono text-xs text-scarlet-bright/80 sm:block">{item.when}</span>
      {chevron && <Icon name="chevron" className="h-4 w-4 flex-none rotate-90 text-ink-2 transition group-open:-rotate-90" />}
    </>
  );
}

function Details({ item }) {
  return (
    <>
      {item.org.includes(" · ") && <p className="text-sm text-ink-2">{item.org}</p>}
      {item.context && <p className="mt-2 text-sm text-ink-2">{item.context}</p>}
      {item.bullets.length > 0 && (
        <ul className="mt-2 list-disc space-y-1.5 pl-4 marker:text-scarlet-bright">
          {item.bullets.map((b) => (
            <li key={b.slice(0, 24)}>{b}</li>
          ))}
        </ul>
      )}
      {item.badge && (
        <span className="mt-3 inline-block rounded-full bg-scarlet-tint px-2.5 py-1 font-mono text-[11px] uppercase tracking-[.06em] text-scarlet-bright">
          {item.badge}
        </span>
      )}
    </>
  );
}

/** Summarized role: the two-sentence line and any numbers are always visible; the resume bullets sit behind "Details". */
function SummaryRow({ item }) {
  return (
    <div className="rounded-2xl border border-line bg-card">
      <div className="flex items-center gap-4 p-4">
        <Header item={item} chevron={false} />
      </div>
      <div className="px-4 pb-4 text-[14.5px] text-ink/85 sm:pl-[80px]">
        <ul className="m-0 list-disc pl-4 marker:text-scarlet-bright">
          <li>{item.summary}</li>
        </ul>
        {item.metrics && item.metrics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-6">
            {item.metrics.map((m) => (
              <div key={m.label}>
                <b className="block font-sora text-2xl font-semibold text-scarlet-bright">{m.value}</b>
                <span className="text-xs text-ink-2">{m.label}</span>
              </div>
            ))}
          </div>
        )}
        {item.badge && (
          <span className="mt-3 inline-block rounded-full bg-scarlet-tint px-2.5 py-1 font-mono text-[11px] uppercase tracking-[.06em] text-scarlet-bright">
            {item.badge}
          </span>
        )}
        {item.bullets.length > 0 && (
          <details className="group mt-3">
            <summary
              data-track={`experience:${item.title}`}
              data-label={`Expanded experience: ${item.title}`}
              className="flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-ink-2 [&::-webkit-details-marker]:hidden"
            >
              Details <Icon name="chevron" className="h-3.5 w-3.5 rotate-90 transition group-open:-rotate-90" />
            </summary>
            <div className="mt-2 border-t border-line-soft pt-3">
              <Details item={{ ...item, badge: undefined }} />
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/** Cards built before summaries existed: the whole role expands on tap. */
function BulletRow({ item }) {
  const hasDetail = Boolean(item.context || item.bullets.length || item.badge);
  return (
    <details className="group rounded-2xl border border-line bg-card open:border-white/15">
      <summary
        data-track={`experience:${item.title}`}
        data-label={`Expanded experience: ${item.title}`}
        className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden"
      >
        <Header item={item} chevron={hasDetail} />
      </summary>
      {hasDetail && (
        <div className="border-t border-line-soft px-4 pb-4 pt-3 text-[14.5px] text-ink/85 sm:pl-[80px]">
          <Details item={item} />
        </div>
      )}
    </details>
  );
}

export function ExperienceSection({ experience }) {
  const items = [...experience.work, ...experience.leadership];
  return (
    <TrackedSection id="experience" label="Experience">
      <SectionTitle title="Experience" sub={items.some((i) => i.summary) ? "The short version of each role." : "Tap a role for details."} />
      <div className="flex flex-col gap-3">
        {items.map((it) => (it.summary ? <SummaryRow key={it.title} item={it} /> : <BulletRow key={it.title} item={it} />))}
      </div>
    </TrackedSection>
  );
}
