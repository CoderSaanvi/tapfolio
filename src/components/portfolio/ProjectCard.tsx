import Image from "next/image";
import { Tags } from "@/components/ui/Tags";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

function ProjectVisual({ project: p }: ProjectCardProps) {
  if (p.image) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line-soft bg-scarlet-tint">
        <Image src={p.image.src} alt={p.image.alt} fill sizes="(max-width: 860px) 100vw, 520px" className="object-cover" style={{ objectPosition: p.image.position }} />
      </div>
    );
  }
  if (!p.org) return null;
  return (
    <div className="grid aspect-video place-items-center border-b border-line-soft bg-white p-6 text-center">
      <div className="flex flex-col items-center gap-1.5">
        <b className="font-display text-[clamp(34px,5vw,46px)] font-extrabold uppercase leading-none tracking-[.01em]">
          {p.org.name}
          {p.org.accent && <em className="not-italic text-scarlet">{p.org.accent}</em>}
        </b>
        <span className="font-mono text-xs uppercase tracking-[.12em] text-ink-2">{p.org.place}</span>
        <i className="mt-1.5 block h-1 w-12 bg-scarlet" />
      </div>
    </div>
  );
}

export function ProjectCard({ project: p }: ProjectCardProps) {
  return (
    <TrackedSection id={`project:${p.id}`} label={`Project: ${p.title}`} className={p.feature ? "md:col-span-2" : ""}>
      <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white">
        <ProjectVisual project={p} />
        <div className="flex flex-1 flex-col gap-2.5 p-[22px]">
          {p.status ? (
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[.08em] text-scarlet before:h-2 before:w-2 before:animate-pulse before:rounded-full before:bg-scarlet">
              {p.status}
            </span>
          ) : (
            <p className="eyebrow">{p.label}</p>
          )}
          <h3 className="font-display text-[28px] font-extrabold leading-none">{p.title}</h3>
          <p className="text-[15px] text-ink-2">{p.where}</p>
          {p.summary.map((s) => (
            <p key={s.slice(0, 24)}>{s}</p>
          ))}
          {p.metrics && (
            <div className="flex flex-wrap gap-5">
              {p.metrics.map((m) => (
                <div key={m.label}>
                  <b className="block font-display text-3xl font-extrabold leading-none text-scarlet tabular-nums">{m.value}</b>
                  <span className="text-[13px] text-ink-2">{m.label}</span>
                </div>
              ))}
            </div>
          )}
          <Tags items={p.tags} />
          {p.note && <p className="text-sm italic text-ink-2">{p.note}</p>}
          {p.links && (
            <div className="mt-auto flex flex-wrap gap-2 pt-1.5">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener"
                  data-track={`link:${p.id}`}
                  data-label={`${l.label} (${p.title})`}
                  className="rounded-[10px] bg-gradient-to-b from-scarlet to-scarlet-deep px-3 py-1.5 text-sm font-semibold text-white no-underline"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </article>
    </TrackedSection>
  );
}
