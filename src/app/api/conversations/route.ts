import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getProfile } from "@/lib/profiles";
import { createConversation } from "@/lib/conversations-store";

const CreateSchema = z.object({
  slug: z.string().min(1).max(64),
  eventName: z.string().max(120).default(""),
});

/** Owner-only (middleware). Starts a conversation the recruiter's card views get linked to. */
export async function POST(req: NextRequest) {
  try {
    const parsed = CreateSchema.safeParse(await req.json());
    if (!parsed.success || !(await getProfile(parsed.data.slug))) {
      return NextResponse.json({ success: false, error: "Invalid conversation" }, { status: 400 });
    }
    const convo = await createConversation(parsed.data.slug, parsed.data.eventName.trim());
    return NextResponse.json({ success: true, data: { id: convo.id } });
  } catch {
    return NextResponse.json({ success: false, error: "Could not start conversation" }, { status: 500 });
  }
}
