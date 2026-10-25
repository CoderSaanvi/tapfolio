import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getOwnerProfile, getProfile } from "@/lib/profiles";
import { appendEvent, listEvents } from "@/lib/events-store";
import type { ViewEvent } from "@/lib/types";

const EventSchema = z.object({
  sessionId: z.string().uuid(),
  slug: z.string().min(1).max(64),
  type: z.enum(["open", "dwell", "click"]),
  target: z.string().min(1).max(120),
  label: z.string().max(200),
  ms: z.number().int().nonnegative().max(60 * 60 * 1000).optional(),
  eventName: z.string().max(120).optional(),
  conversationId: z.string().uuid().optional(),
  audience: z.enum(["recruiter", "student"]).optional(),
});

/**
 * Public on purpose: the recruiter viewing the card is anonymous. Input is
 * validated and bounded, and only known card slugs are accepted.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = EventSchema.safeParse(await req.json());
    if (!parsed.success || !(await getProfile(parsed.data.slug))) {
      return NextResponse.json({ success: false, error: "Invalid event" }, { status: 400 });
    }
    const event: ViewEvent = {
      ...parsed.data,
      id: crypto.randomUUID(),
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? undefined,
      at: new Date().toISOString(),
    };
    await appendEvent(event);
    return NextResponse.json({ success: true, data: { id: event.id } });
  } catch {
    return NextResponse.json({ success: false, error: "Could not record event" }, { status: 500 });
  }
}

/** Owner-only: the view events for the requester's own card. */
export async function GET() {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    return NextResponse.json({ success: true, data: await listEvents(owner.slug) });
  } catch {
    return NextResponse.json({ success: false, error: "Could not read events" }, { status: 500 });
  }
}
