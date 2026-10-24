import "server-only";
import { sbDownload, sbPublicUrlPrefix, sbSignedUpload, supabaseEnabled } from "./supabase";
import { extForMime, isUploadName, newUploadName, readLocalUpload, type UploadExt } from "./uploads";

/**
 * One upload flow for web and the app: the server issues a one-time upload URL,
 * the client PUTs the file straight there, then sends back the file's URL.
 * Supabase Storage when configured, else .data/uploads on this machine.
 */
export interface UploadTicket {
  uploadUrl: string;
  url: string;
}

const LOCAL_PREFIX = "/api/files/";

export async function createUploadTicket(mime: string): Promise<UploadTicket | null> {
  const ext = extForMime(mime);
  if (!ext) return null;
  const name = newUploadName(ext as UploadExt);
  if (supabaseEnabled()) {
    const { uploadUrl, publicUrl } = await sbSignedUpload(name);
    return { uploadUrl, url: publicUrl };
  }
  return { uploadUrl: `/api/uploads/local/${name}`, url: `${LOCAL_PREFIX}${name}` };
}

/** The stored file name if `url` is one of our uploads, else null (rejects arbitrary URLs). */
export function storedName(url: string): string | null {
  const name = url.startsWith(LOCAL_PREFIX)
    ? url.slice(LOCAL_PREFIX.length)
    : supabaseEnabled() && url.startsWith(sbPublicUrlPrefix())
      ? url.slice(sbPublicUrlPrefix().length)
      : null;
  return name && isUploadName(name) ? name : null;
}

export function storedKind(url: string): "video" | "image" | "pdf" | null {
  const ext = storedName(url)?.split(".").pop();
  if (ext === "mp4" || ext === "mov") return "video";
  if (ext === "jpg" || ext === "png") return "image";
  if (ext === "pdf") return "pdf";
  return null;
}

export async function readStored(url: string): Promise<ArrayBuffer | null> {
  const name = storedName(url);
  if (!name) return null;
  if (url.startsWith(LOCAL_PREFIX)) return readLocalUpload(name);
  try {
    return await sbDownload(name);
  } catch {
    return null;
  }
}
