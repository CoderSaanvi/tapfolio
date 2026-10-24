"use client";

import { resizeImage } from "./resize-image";
import type { Profile } from "./types";

interface ApiResult {
  success: boolean;
  data?: Profile;
  error?: string;
}

function parse(text: string): Profile {
  const json = JSON.parse(text) as ApiResult;
  if (!json.success || !json.data) throw new Error(json.error ?? "Upload failed");
  return json.data;
}

/** Uploads a demo video or photo to a project, reporting progress (0-100). Photos are shrunk first. */
export async function uploadDemo(projectId: string, file: File, onProgress: (pct: number) => void): Promise<Profile> {
  const body = new FormData();
  body.append("projectId", projectId);
  body.append("file", file.type.startsWith("image/") ? await resizeImage(file, 1600) : file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/profile/media");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        resolve(parse(xhr.responseText));
      } catch (err) {
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(body);
  });
}

export async function mediaAction(body: { action: "link"; projectId: string; url: string } | { action: "removeLink"; projectId: string } | { action: "removeMedia"; projectId: string; mediaId: string }): Promise<Profile> {
  const res = await fetch("/api/profile/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return parse(await res.text());
}
