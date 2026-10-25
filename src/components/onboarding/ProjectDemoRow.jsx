"use client";

import { useState } from "react";
import { mediaAction, uploadDemo } from "@/lib/media-client";

const DEMO_LABEL = "Watch demo";
const pill = "flex-1 cursor-pointer rounded-xl border border-line bg-wash py-2.5 text-center text-sm font-medium active:bg-white/5";

export function ProjectDemoRow({ project: p, index, onUpdated }) {
  const existingLink = p.links?.find((l) => l.label === DEMO_LABEL)?.href ?? "";
  const [link, setLink] = useState(existingLink);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  async function add(file) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      onUpdated(await uploadDemo(p.id, file, setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  async function act(body) {
    setError(null);
    try {
      onUpdated(await mediaAction(body));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    }
  }

  function saveLink() {
    const url = link.trim();
    if (url === existingLink) return;
    if (!url) return void act({ action: "removeLink", projectId: p.id });
    void act({ action: "link", projectId: p.id, url: /^https?:\/\//.test(url) ? url : `https://${url}` });
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-4">
      <div>
        <p className="font-mono text-xs text-scarlet-bright">{String(index + 1).padStart(2, "0")}</p>
        <p className="font-medium">{p.title}</p>
        {p.blurb && <p className="text-xs text-ink-2">{p.blurb}</p>}
      </div>

      {(p.media?.length ?? 0) > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {p.media?.map((m) => (
            <div key={m.id} className="relative h-20 w-28 flex-none overflow-hidden rounded-xl bg-wash">
              {m.kind === "video" ? (
                <video src={`${m.src}#t=0.5`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : (
                // Uploaded file preview; sizes vary, so a plain img keeps it simple.
                <img src={m.src} alt="" className="h-full w-full object-cover" />
              )}
              {m.kind === "video" && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">▶ video</span>}
              <button
                type="button"
                aria-label="Remove"
                onClick={() => act({ action: "removeMedia", projectId: p.id, mediaId: m.id })}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {progress !== null ? (
        <div className="h-10 overflow-hidden rounded-xl bg-wash">
          <div className="flex h-full items-center bg-scarlet/40 px-3 text-sm transition-all" style={{ width: `${Math.max(progress, 8)}%` }}>
            {progress}%
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <label className={pill}>
            ＋ Video
            <input type="file" accept="video/*" className="sr-only" onChange={(e) => add(e.target.files?.[0])} />
          </label>
          <label className={pill}>
            ＋ Photo
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => add(e.target.files?.[0])} />
          </label>
        </div>
      )}

      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        onBlur={saveLink}
        placeholder="Demo link (YouTube, Loom, live site)"
        autoCapitalize="none"
        className="rounded-xl border border-line bg-wash px-3.5 py-2.5 text-[16px] outline-none placeholder:text-ink-2/60 focus:border-scarlet-bright"
      />

      {error && <p className="text-xs text-scarlet-bright">{error}</p>}
    </div>
  );
}
