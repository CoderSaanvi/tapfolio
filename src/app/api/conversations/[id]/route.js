import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnedConversation, updateConversation } from "@/lib/conversations-store";
import { listEvents } from "@/lib/events-store";
import { eventsForConversation, summarizeSessions } from "@/lib/sessions";

const PatchSchema = z.object({
  eventName: z.string().max(120).optional(),
  transcript: z.string().max(100_000).optional(),
  notes: z.string().max(10_000).optional(),
  end: z.boolean().optional(),
  recruiter: z
    .object({
      name: z.string().max(120),
      email: z.string().max(200),
      company: z.string().max(120),
      role: z.string().max(120),
    })
    .partial()
    .optional(),
  followUp: z
    .object({
      subject: z.string().max(300),
      body: z.string().max(5000),
      sendOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(["draft", "sent"]),
    })
    .partial()
    .optional(),
  delete: z.boolean().optional(),
});

/** Owner-only. Saves transcript/notes, ends the conversation, edits the draft, or soft-deletes. */
export async function PATCH(req, { params }) {
  try {
    if (!(await getOwnedConversation(params.id))) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    const parsed = PatchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid update" }, { status: 400 });
    const { end, recruiter, followUp, delete: remove, ...fields } = parsed.data;
    const now = new Date().toISOString();

    const updated = await updateConversation(params.id, (c) => ({
      ...c,
      ...fields,
      endedAt: end && !c.endedAt ? now : c.endedAt,
      recruiter: { ...c.recruiter, ...recruiter },
      followUp:
        c.followUp && followUp
          ? {
              ...c.followUp,
              ...followUp,
              sentAt: followUp.status === "sent" ? now : followUp.status === "draft" ? undefined : c.followUp.sentAt,
            }
          : c.followUp,
      deletedAt: remove ? now : c.deletedAt,
    }));
    if (!updated) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Could not save conversation" }, { status: 500 });
  }
}

/** Owner-only. One conversation plus a summary of the card views linked to it (the app's conversation screen). */
export async function GET(_req, { params }) {
  try {
    const owned = await getOwnedConversation(params.id);
    if (!owned) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    const sessions = summarizeSessions(eventsForConversation(await listEvents(owned.convo.slug), owned.convo));
    return NextResponse.json({ success: true, data: { conversation: owned.convo, sessions } });
  } catch {
    return NextResponse.json({ success: false, error: "Could not load conversation" }, { status: 500 });
  }
}
