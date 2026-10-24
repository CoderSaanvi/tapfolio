import "server-only";
import { createReadStream, promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";

/**
 * Uploaded photos, resumes, and demo videos, stored on disk and served by /api/files/[name].
 * Like the JSON store, this is local-only; move to Supabase Storage before deploying.
 */
const DIR = path.join(process.cwd(), ".data", "uploads");

export const UPLOAD_TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mov: "video/quicktime",
} as const;

export type UploadExt = keyof typeof UPLOAD_TYPES;

const NAME = /^[a-f0-9-]{36}\.(jpg|png|pdf|mp4|mov)$/;

export function isUploadName(name: string): boolean {
  return NAME.test(name);
}

export function extForMime(mime: string): UploadExt | null {
  const hit = (Object.entries(UPLOAD_TYPES) as [UploadExt, string][]).find(([, m]) => m === mime);
  return hit ? hit[0] : null;
}

export async function uploadSize(name: string): Promise<number | null> {
  if (!isUploadName(name)) return null;
  try {
    return (await fs.stat(path.join(DIR, name))).size;
  } catch {
    return null;
  }
}

/** Streams bytes [start, end] of an upload; used for video range requests. */
export function streamUpload(name: string, start: number, end: number): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(path.join(DIR, name), { start, end })) as ReadableStream<Uint8Array>;
}

/** A fresh random file name for an upload. */
export function newUploadName(ext: UploadExt): string {
  return `${crypto.randomUUID()}.${ext}`;
}

/** Saves a local upload under a name issued by newUploadName (local mode's signed-upload target). */
export async function saveUploadAs(name: string, data: ArrayBuffer): Promise<void> {
  if (!isUploadName(name)) throw new Error("Bad upload name");
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, name), Buffer.from(data));
}

export async function readLocalUpload(name: string): Promise<ArrayBuffer | null> {
  if (!isUploadName(name)) return null;
  try {
    const buf = await fs.readFile(path.join(DIR, name));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}
