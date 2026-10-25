"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Tags } from "@/components/ui/Tags";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import { ProjectMediaGallery } from "./ProjectMediaGallery";

/** Numbered bento tile; tapping expands it in place to the full write-up. */
export function ProjectTile({ project: p, index }) {
  const [open, setOpen] = useState(false);
  const wide = p.feature || open;

  return (
    <TrackedSection id={`project-${p.id}`} label={`Project: ${p.title}`} className={wide ? "sm:col-span-2" : ""}>
      <article className="relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-2xl border border-line bg-card">
        {p.image && (
          <div className={`relative overflow-hidden ${open ? "aspect-[16/9]" : "absolute inset-0"}`}>
            <Image
              src={p.image.src}
              alt={open ? p.image.alt : ""}
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              className={`object-cover ${open ? "" : "opacity-30"}`}
              style={{ objectPosition: p.image.position }}
            />
            {!open && <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-card/20" />}
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          data-track={`project-open:${p.id}`}
          data-label={`${open ? "Collapsed" : "Opened"} project: ${p.title}`}
          className="relative flex flex-1 flex-col gap-2 p-5 text-left"
        >
          <span className="flex items-center justify-between font-mono text-xs text-scarlet-bright">
            {String(index + 1).padStart(2, "0")}
            <Icon name={open ? "up" : "arrow"} className="h-4 w-4 text-ink-2" />
          </span>
          <span className="mt-auto pt-6">
            {(p.media?.some((m) => m.kind === "video") || p.links?.some((l) => l.label === "Watch demo")) && (
              <span className="mb-1.5 mr-2 inline-flex items-center gap-1 rounded-full bg-scarlet px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[.1em] text-white">
                ▶ Demo
              </span>
            )}
            {p.status && (
              <span className="mb-1.5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[.14em] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {p.status}
              </span>
            )}
            <span className="block font-sora text-xl font-semibold tracking-tight">{p.title}</span>
            <span className="mt-1 block text-sm text-ink-2">{open ? p.where : (p.blurb ?? p.where)}</span>
          </span>
          {!open && <Tags items={p.tags.slice(0, 3)} />}
        </button>

        {open && (
          <div className="relative flex flex-col gap-3 px-5 pb-5 text-[14.5px] leading-relaxed text-ink/85">
            <ProjectMediaGallery project={p} />
            {p.summary.map((s) => (
              <p key={s.slice(0, 24)}>{s}</p>
            ))}
            {p.metrics && (
              <div className="flex flex-wrap gap-6 py-1">
                {p.metrics.map((m) => (
                  <div key={m.label}>
                    <b className="block font-sora text-2xl font-semibold text-scarlet-bright">{m.value}</b>
                    <span className="text-xs text-ink-2">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
            <Tags items={p.tags} />
            {p.note && <p className="text-sm italic text-ink-2">{p.note}</p>}
            {p.links?.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener"
                data-track={`link:${p.id}`}
                data-label={`${l.label} (${p.title})`}
                className="self-start rounded-xl bg-scarlet px-4 py-2 text-sm font-semibold text-white no-underline"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </article>
    </TrackedSection>
  );
}
