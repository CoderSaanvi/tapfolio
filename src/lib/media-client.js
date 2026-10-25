"use client";

import { resizeImage } from "./resize-image";
import { uploadFile } from "./upload-client";

export async function mediaAction(body) {
  const res = await fetch("/api/profile/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!json.success || !json.data) throw new Error(json.error ?? "Couldn't save that.");
  return json.data;
}

/** Uploads a demo video or photo (photos are shrunk first) and attaches it to a project. */
export async function uploadDemo(projectId, file, onProgress) {
  const ready = file.type.startsWith("image/") ? await resizeImage(file, 1600) : file;
  const url = await uploadFile(ready, onProgress);
  return mediaAction({ action: "add", projectId, url });
}
