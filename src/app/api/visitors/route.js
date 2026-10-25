import { NextResponse } from "next/server";
import { z } from "zod";
import { getConversation, updateConversation } from "@/lib/conversations-store";
import { getOwnerProfile, getProfile } from "@/lib/profiles";
import { appendVisitor, listVisitors } from "@/lib/visitors-store";

const VisitorSchema = z.object({
  slug: z.string().min(1).max(64),
  name: z.string().trim().max(120).default(""),
  email: z.string().trim().max(200).default(""),
  company: z.string().trim().max(120).default(""),
  role: z.string().trim().max(120).default(""),
  note: z.string().trim().max(1000).default(""),
  sessionId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  eventName: z.string().max(120).optional(),
  audience: z.enum(["recruiter", "student"]).optional(),
});

/**
 * Public on purpose: the viewer is anonymous until they fill this in. Input is
 * validated and bounded, only known card slugs are accepted, and a name or
 * email is required so empty submissions don't clutter the owner's network.
 */
export async function POST(req) {
  try {
    const parsed = VisitorSchema.safeParse(await req.json());
    if (!parsed.success || !(await getProfile(parsed.data.slug))) {
      return NextResponse.json({ success: false, error: "Invalid submission" }, { status: 400 });
    }
    const d = parsed.data;
    if (!d.name && !d.email) return NextResponse.json({ success: false, error: "Add your name or email" }, { status: 400 });
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      return NextResponse.json({ success: false, error: "That email doesn't look right" }, { status: 400 });

    const visitor = {
      ...d,
      id: crypto.randomUUID(),
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? undefined,
      at: new Date().toISOString(),
    };
    await appendVisitor(visitor);

    // Opened from a live conversation link: fill in whatever the owner hasn't typed yet.
    if (d.conversationId) {
      const convo = await getConversation(d.conversationId);
      if (convo && convo.slug === d.slug) {
        await updateConversation(convo.id, (c) => ({
          ...c,
          recruiter: {
            name: c.recruiter.name || d.name,
            email: c.recruiter.email || d.email,
            company: c.recruiter.company || d.company,
            role: c.recruiter.role || d.role,
          },
        }));
      }
    }
    return NextResponse.json({ success: true, data: { id: visitor.id } });
  } catch {
    return NextResponse.json({ success: false, error: "Could not save your info" }, { status: 500 });
  }
}

/** Owner-only: everyone who left their info on the requester's card. */
export async function GET() {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    return NextResponse.json({ success: true, data: await listVisitors(owner.slug) });
  } catch {
    return NextResponse.json({ success: false, error: "Could not read visitors" }, { status: 500 });
  }
}
