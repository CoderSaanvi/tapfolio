import { NextResponse } from "next/server";
import { isUploadName, streamUpload, UPLOAD_TYPES, uploadSize } from "@/lib/uploads";

const CACHE = "public, max-age=31536000, immutable";

/**
 * Public on purpose: card photos, resumes, and demo videos are what recruiters open.
 * Names are random UUIDs, so files can't be listed or guessed. Supports Range
 * requests, which iPhone Safari requires before it will play a video.
 */
export async function GET(req, { params }) {
  try {
    const size = isUploadName(params.name) ? await uploadSize(params.name) : null;
    if (size === null) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const type = UPLOAD_TYPES[params.name.split(".").pop()];

    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
    if (!range) {
      return new NextResponse(streamUpload(params.name, 0, size - 1), {
        headers: { "Content-Type": type, "Content-Length": String(size), "Accept-Ranges": "bytes", "Cache-Control": CACHE },
      });
    }

    // "bytes=a-b", "bytes=a-", or "bytes=-n" (last n bytes).
    let start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    end = Math.min(end, size - 1);
    start = Math.min(start, end);
    if (start >= size) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    return new NextResponse(streamUpload(params.name, start, end), {
      status: 206,
      headers: {
        "Content-Type": type,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": CACHE,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Could not read file" }, { status: 500 });
  }
}
