import { NextResponse } from "next/server";
import { readUpload, UPLOAD_TYPES } from "@/lib/uploads";

interface RouteContext {
  params: { name: string };
}

/**
 * Public on purpose: card photos and resumes are what recruiters open.
 * Names are random UUIDs, so files can't be listed or guessed.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const data = await readUpload(params.name);
    if (!data) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const ext = params.name.split(".").pop() ?? "";
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": UPLOAD_TYPES[ext] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Could not read file" }, { status: 500 });
  }
}
