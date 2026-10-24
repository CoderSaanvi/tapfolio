import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Uploaded photos and resumes, stored on disk and served by /api/files/[name].
 * Like the JSON store, this is local-only; move to Supabase Storage before deploying.
 */
const DIR = path.join(process.cwd(), ".data", "uploads");

export const UPLOAD_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

const NAME = /^[a-f0-9-]{36}\.(jpg|png|pdf)$/;

export function isUploadName(name: string): boolean {
  return NAME.test(name);
}

export async function saveUpload(data: ArrayBuffer, ext: keyof typeof UPLOAD_TYPES): Promise<string> {
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, name), Buffer.from(data));
  return name;
}

export async function readUpload(name: string): Promise<Buffer | null> {
  if (!isUploadName(name)) return null;
  try {
    return await fs.readFile(path.join(DIR, name));
  } catch {
    return null;
  }
}
