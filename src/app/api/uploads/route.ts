import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createUploadTicket } from "@/lib/storage";

const TicketSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "application/pdf", "video/mp4", "video/quicktime"]),
});

/**
 * Issues a one-time upload URL for a photo, resume, or demo video. Open, like
 * sign-up, because onboarding uploads happen before an owner exists; files are
 * only referenced by a profile once an owner-checked route attaches them.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = TicketSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Use a JPEG/PNG photo, PDF, or MP4/MOV video." }, { status: 400 });
    const ticket = await createUploadTicket(parsed.data.contentType);
    if (!ticket) return NextResponse.json({ success: false, error: "Unsupported file type." }, { status: 400 });
    return NextResponse.json({ success: true, data: ticket });
  } catch (e) {
    // The message is ours or Supabase's (e.g. a bad service key); it names the cause without leaking secrets.
    const reason = e instanceof Error && e.message ? e.message : "unknown error";
    return NextResponse.json({ success: false, error: `Could not start the upload: ${reason}` }, { status: 500 });
  }
}
