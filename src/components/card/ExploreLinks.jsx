import { Icon } from "@/components/ui/Icon";

/** The card is the hub: every part of the portfolio is one tap away from here. */
export function ExploreLinks({ profile: p }) {
  const current = p.projects.find((pr) => pr.status);
  const jobs = p.experience.work.length + p.experience.leadership.length;
  const rows = [
    ...(current ? [{ label: `Building ${current.title}`, sub: current.blurb ?? current.where, href: `#project-${current.id}`, icon: "code", live: true }] : []),
    { label: "Projects", sub: `${p.projects.length} things I've built`, href: "#projects", icon: "grid" },
    { label: "Experience", sub: `${jobs} roles in research, industry, and leadership`, href: "#experience", icon: "briefcase" },
    { label: "Resume", sub: "One page · view or download", href: "#resume", icon: "doc" },
    {
      label: "Education",
      sub: `${p.school.name} · ${p.facts
        .map((f) => `${f.label} ${f.value}`)
        .slice(0, 1)
        .join("")}`,
      href: "#education",
      icon: "cap",
    },
    { label: "Skills", sub: p.skills.map((s) => s.name).join(" · "), href: "#skills", icon: "spark" },
    { label: "GitHub", sub: p.contact.github.replace("https://", ""), href: p.contact.github, icon: "code", external: true },
    ...p.places.filter((pl) => pl.icon !== "code").map((pl) => ({ label: pl.name, sub: pl.sub, href: pl.href, icon: pl.icon, external: true })),
  ];

  return (
    <nav aria-label="Explore" className="flex flex-col overflow-hidden rounded-2xl border border-line bg-wash/60">
      {rows.map((r) => (
        <a
          key={r.label}
          href={r.href}
          {...(r.external ? { target: "_blank", rel: "noopener" } : {})}
          data-track={`explore:${r.label.toLowerCase()}`}
          data-label={`Card link: ${r.label}`}
          className="flex items-center gap-3.5 border-b border-line-soft px-4 py-3.5 text-ink no-underline last:border-b-0 active:bg-white/5"
        >
          <span className="relative grid h-8 w-8 flex-none place-items-center rounded-lg bg-scarlet-tint text-scarlet-bright">
            <Icon name={r.icon} className="h-4 w-4" />
            {r.live && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-card bg-emerald-400" />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-[14.5px] font-medium">{r.label}</span>
            <span className="truncate text-xs text-ink-2">{r.sub}</span>
          </span>
          <Icon name={r.external ? "arrow" : "chevron"} className="h-4 w-4 flex-none text-ink-2" />
        </a>
      ))}
    </nav>
  );
}
