interface SiteNavProps {
  initials: string;
}

const LINKS = [
  { label: "Work", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Resume", href: "#resume" },
];

export function SiteNav({ initials }: SiteNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-night/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4 lg:px-6">
        <a href="#card" data-track="nav:home" data-label="Nav: card" className="font-sora text-[22px] font-light tracking-tight text-scarlet-bright no-underline">
          {initials}
        </a>
        <nav aria-label="Sections" className="flex gap-5 text-[13px] text-ink-2">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} data-track={`nav:${l.label.toLowerCase()}`} data-label={`Nav: ${l.label}`} className="no-underline hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="osu-stripe" aria-hidden="true" />
    </header>
  );
}
