import { NextResponse, type NextRequest } from "next/server";
import { draftFollowUp } from "@/lib/ai";
import { getOwnedConversation, updateConversation } from "@/lib/conversations-store";
import { listEvents } from "@/lib/events-store";
import { eventsForConversation, summarizeSessions } from "@/lib/sessions";

interface RouteContext {
  params: { id: string };
}

/** Owner-only. Drafts (or redrafts) the follow-up email from the transcript and card activity. */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const owned = await getOwnedConversation(params.id);
    if (!owned) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    const { convo, owner: profile } = owned;

    const events = eventsForConversation(await listEvents(convo.slug), convo);
    const cardUrl = `${req.nextUrl.origin}/c/${profile.slug}`;
    const { followUp, recruiter } = await draftFollowUp({ profile, conversation: convo, sessions: summarizeSessions(events), cardUrl });

    // Never overwrite details the student typed in themselves.
    const updated = await updateConversation(convo.id, (c) => ({
      ...c,
      followUp,
      recruiter: {
        name: c.recruiter.name || recruiter.name || "",
        email: c.recruiter.email || recruiter.email || "",
        company: c.recruiter.company || recruiter.company || "",
        role: c.recruiter.role || recruiter.role || "",
      },
    }));
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Could not draft follow-up" }, { status: 500 });
  }
}
