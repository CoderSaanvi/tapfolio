import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import type { ExperienceItem, Profile } from "@/lib/types";

interface ExperienceSectionProps {
  experience: Profile["experience"];
}

function Row({ item }: { item: ExperienceItem }) {
  const hasDetail = Boolean(item.context || item.bullets.length || item.badge);
  return (
    <details className="group rounded-2xl border border-line bg-card open:border-white/15">
      <summary
        data-track={`experience:${item.title}`}
        data-label={`Expanded experience: ${item.title}`}
        className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden"
      >
        <LogoTile logo={item.logo} mark={item.mark} />
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          <span className="font-medium text-scarlet-bright">{item.org.split(" · ")[0]}</span>
          <span className="text-sm text-ink-2">{item.title}</span>
          <span className="mt-0.5 font-mono text-[11px] text-ink-2 sm:hidden">{item.when}</span>
        </span>
        <span className="hidden flex-none font-mono text-xs text-scarlet-bright/80 sm:block">{item.when}</span>
        {hasDetail && <Icon name="chevron" className="h-4 w-4 flex-none rotate-90 text-ink-2 transition group-open:-rotate-90" />}
      </summary>
      {hasDetail && (
        <div className="border-t border-line-soft px-4 pb-4 pt-3 text-[14.5px] text-ink/85 sm:pl-[80px]">
          {item.org.includes(" · ") && <p className="text-sm text-ink-2">{item.org}</p>}
          {item.context && <p className="mt-2 text-sm text-ink-2">{item.context}</p>}
          {item.bullets.length > 0 && (
            <ul className="mt-2 list-disc space-y-1.5 pl-4 marker:text-scarlet-bright">
              {item.bullets.map((b) => <li key={b.slice(0, 24)}>{b}</li>)}
            </ul>
          )}
          {item.badge && <span className="mt-3 inline-block rounded-full bg-scarlet-tint px-2.5 py-1 font-mono text-[11px] uppercase tracking-[.06em] text-scarlet-bright">{item.badge}</span>}
        </div>
      )}
    </details>
  );
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <TrackedSection id="experience" label="Experience">
      <SectionTitle title="Experience" sub="Tap a role for details." />
      <div className="flex flex-col gap-3">
        {[...experience.work, ...experience.leadership].map((it) => (
          <Row key={it.title} item={it} />
        ))}
      </div>
    </TrackedSection>
  );
}
