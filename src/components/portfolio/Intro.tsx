import { LogoTile } from "@/components/ui/LogoTile";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import { LiveFeed } from "./LiveFeed";
import type { Profile } from "@/lib/types";

interface IntroProps {
  profile: Profile;
}

/** Name, one-liner, text links, and the "Currently" card. The big name is desktop-only; on phones the card already shows it. */
export function Intro({ profile: p }: IntroProps) {
  const current = p.projects.find((pr) => pr.status);
  const links = [
    { label: "LinkedIn", href: p.contact.linkedin },
    { label: "GitHub", href: p.contact.github },
    { label: "Email", href: `mailto:${p.contact.email}` },
  ];

  return (
    <TrackedSection id="about" label="About">
      <div className="hidden lg:block">
        <h1 className="font-sora text-[clamp(44px,5vw,60px)] font-semibold leading-none tracking-tight">{p.firstName} {p.lastName}</h1>
        <p className="mt-4 text-lg text-ink-2">{p.headline}</p>
        <div className="mt-6 flex gap-7 text-[15px] text-ink-2">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener" data-track={`intro:${l.label.toLowerCase()}`} data-label={`Intro: ${l.label}`} className="no-underline hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <p className="max-w-[40em] text-[15.5px] leading-relaxed text-ink/85 lg:mt-7">{p.bio}</p>

      {current && (
        <a
          href={`#project-${current.id}`}
          data-track="currently"
          data-label={`Currently card: ${current.title}`}
          className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-card p-4 text-ink no-underline hover:border-white/20"
        >
          <span className="hidden flex-none items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-ink-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Currently
          </span>
          <LogoTile mark={current.title.slice(0, 2).toUpperCase()} size="sm" />
          <span className="flex min-w-0 flex-1 flex-col leading-snug">
            <span className="font-medium">Building {current.title}</span>
            <span className="text-sm text-ink-2">{current.blurb}</span>
          </span>
          <span className="flex-none text-sm text-scarlet-bright">View</span>
        </a>
      )}

      <div className="mt-4">
        <LiveFeed githubUser={p.contact.githubUser} />
      </div>
    </TrackedSection>
  );
}
