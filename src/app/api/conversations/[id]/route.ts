import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getOwnedConversation, updateConversation } from "@/lib/conversations-store";

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

interface RouteContext {
  params: { id: string };
}

/** Owner-only. Saves transcript/notes, ends the conversation, edits the draft, or soft-deletes. */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
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
