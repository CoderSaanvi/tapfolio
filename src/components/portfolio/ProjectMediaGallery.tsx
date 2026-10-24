"use client";

import { track } from "@/lib/track";
import type { Project } from "@/lib/types";

interface ProjectMediaGalleryProps {
  project: Project;
}

/** Demo videos and photos inside an opened project tile. Video plays inline on iPhone. */
export function ProjectMediaGallery({ project: p }: ProjectMediaGalleryProps) {
  if (!p.media?.length) return null;
  const single = p.media.length === 1;

  return (
    <div className={single ? "" : "-mx-5 flex snap-x snap-mandatory items-start gap-2 overflow-x-auto px-5"}>
      {p.media.map((m) => (
        <div key={m.id} className={`overflow-hidden rounded-xl border border-line bg-black ${single ? "" : "w-[85%] flex-none snap-center"}`}>
          {m.kind === "video" ? (
            <video
              src={m.src}
              controls
              playsInline
              preload="metadata"
              onPlay={() => track("click", `demo:${p.id}`, `Played demo video: ${p.title}`)}
              className="aspect-video w-full bg-black object-contain"
            />
          ) : (
            // Owner-uploaded photo of unknown size; a plain img avoids layout guesses.
            <img src={m.src} alt={`${p.title} screenshot`} className="max-h-[420px] w-full object-contain" />
          )}
        </div>
      ))}
    </div>
  );
}
