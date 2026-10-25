"use client";

import { resizeImage } from "./resize-image";
import { uploadFile } from "./upload-client";
import type { Profile } from "./types";

type MediaAction =
  | { action: "add"; projectId: string; url: string }
  | { action: "link"; projectId: string; url: string }
  | { action: "removeLink"; projectId: string }
  | { action: "removeMedia"; projectId: string; mediaId: string };

export async function mediaAction(body: MediaAction): Promise<Profile> {
  const res = await fetch("/api/profile/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json()) as { success: boolean; data?: Profile; error?: string };
  if (!json.success || !json.data) throw new Error(json.error ?? "Couldn't save that.");
  return json.data;
}

/** Uploads a demo video or photo (photos are shrunk first) and attaches it to a project. */
export async function uploadDemo(projectId: string, file: File, onProgress: (pct: number) => void): Promise<Profile> {
  const ready = file.type.startsWith("image/") ? await resizeImage(file, 1600) : file;
  const url = await uploadFile(ready, onProgress);
  return mediaAction({ action: "add", projectId, url });
}
