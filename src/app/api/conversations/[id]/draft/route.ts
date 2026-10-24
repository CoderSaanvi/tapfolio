import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/data/profile";
import { draftFollowUp } from "@/lib/ai";
import { getConversation, updateConversation } from "@/lib/conversations-store";
import { listEvents } from "@/lib/events-store";
import { eventsForConversation, summarizeSessions } from "@/lib/sessions";

interface RouteContext {
  params: { id: string };
}

/** Owner-only (middleware). Drafts (or redrafts) the follow-up email from the transcript and card activity. */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const convo = await getConversation(params.id);
    const profile = convo && getProfile(convo.slug);
    if (!convo || !profile) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });

    const events = eventsForConversation(await listEvents(), convo);
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
