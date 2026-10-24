import { Icon } from "@/components/ui/Icon";
import type { Place } from "@/lib/types";

interface PlaceLinksProps {
  places: Place[];
}

export function PlaceLinks({ places }: PlaceLinksProps) {
  return (
    <nav aria-label="Places" className="flex flex-col gap-2">
      {places.map((p) => (
        <a
          key={p.href}
          href={p.href}
          target="_blank"
          rel="noopener"
          data-track={`place:${p.name}`}
          data-label={`Opened ${p.name}`}
          className="flex items-center gap-3.5 rounded-[13px] border border-line-soft bg-white px-4 py-3 text-ink no-underline hover:bg-scarlet/[.04]"
        >
          <Icon name={p.icon} className="h-[18px] w-[18px] text-scarlet" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-sm font-semibold">{p.name}</span>
            <span className="text-xs text-ink-2">{p.sub}</span>
          </span>
          <Icon name="arrow" className="ml-auto h-[18px] w-[18px] text-scarlet opacity-55" />
        </a>
      ))}
    </nav>
  );
}
