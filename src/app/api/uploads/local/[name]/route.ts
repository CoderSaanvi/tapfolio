import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isUploadName, saveUploadAs } from "@/lib/uploads";

const MAX_BYTES = 200 * 1024 * 1024;

interface RouteContext {
  params: { name: string };
}

/**
 * Local-mode stand-in for Supabase's signed upload URL: accepts one PUT per
 * issued name and refuses to overwrite. Only used when Supabase isn't configured.
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    if (!isUploadName(params.name)) return NextResponse.json({ success: false, error: "Bad upload name" }, { status: 400 });
    const exists = await fs
      .stat(path.join(process.cwd(), ".data", "uploads", params.name))
      .then(() => true)
      .catch(() => false);
    if (exists) return NextResponse.json({ success: false, error: "Already uploaded" }, { status: 409 });
    const body = await req.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_BYTES) return NextResponse.json({ success: false, error: "File is empty or too large" }, { status: 413 });
    await saveUploadAs(params.name, body);
    return NextResponse.json({ success: true, data: {} });
  } catch {
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
