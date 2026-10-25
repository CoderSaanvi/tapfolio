import { NextResponse } from "next/server";
import { z } from "zod";
import { createConversation, listConversations } from "@/lib/conversations-store";
import { getOwnerProfile } from "@/lib/profiles";

const CreateSchema = z.object({
  eventName: z.string().max(120).default(""),
});

const unauthorized = () => NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });

/** Owner-only. Starts a conversation on the requester's card; recruiter views of the shared link attach to it. */
export async function POST(req) {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return unauthorized();
    const parsed = CreateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid conversation" }, { status: 400 });
    const convo = await createConversation(owner.slug, parsed.data.eventName.trim());
    return NextResponse.json({ success: true, data: { id: convo.id } });
  } catch {
    return NextResponse.json({ success: false, error: "Could not start conversation" }, { status: 500 });
  }
}

/** Owner-only. The requester's conversations, newest first (used by the app's Activity tab). */
export async function GET() {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return unauthorized();
    return NextResponse.json({ success: true, data: await listConversations(owner.slug) });
  } catch {
    return NextResponse.json({ success: false, error: "Could not load conversations" }, { status: 500 });
  }
}
