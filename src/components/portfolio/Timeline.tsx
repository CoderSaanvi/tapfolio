import type { ExperienceItem } from "@/lib/types";

interface TimelineProps {
  label: string;
  items: ExperienceItem[];
}

export function Timeline({ label, items }: TimelineProps) {
  return (
    <div>
      <p className="mb-4 font-display text-[22px] font-bold uppercase text-scarlet">{label}</p>
      <div className="relative pl-7 before:absolute before:bottom-1.5 before:left-[7px] before:top-1.5 before:w-[3px] before:bg-line-soft">
        {items.map((it) => (
          <div
            key={it.title}
            className="relative pb-[30px] before:absolute before:-left-7 before:top-1.5 before:h-[17px] before:w-[17px] before:rounded-full before:border-4 before:border-scarlet before:bg-white last:pb-0"
          >
            <p className="font-mono text-[13px] text-ink-2 tabular-nums">{it.when}</p>
            <h3 className="mt-0.5 font-display text-[26px] font-bold leading-tight">{it.title}</h3>
            <p className="text-ink-2">{it.org}</p>
            {it.context && <p className="mt-2 text-[15.5px] text-ink-2">{it.context}</p>}
            {it.bullets.length > 0 && (
              <ul className="mt-2 list-disc pl-[18px]">
                {it.bullets.map((b) => (
                  <li key={b.slice(0, 24)} className="mb-1">
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {it.badge && (
              <span className="mt-1.5 inline-block rounded-full bg-scarlet px-2.5 py-1 font-mono text-xs uppercase tracking-[.06em] text-white">
                {it.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
