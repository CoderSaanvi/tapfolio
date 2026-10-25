import { NextResponse } from "next/server";
import { listEvents } from "@/lib/events-store";
import { computeInsights } from "@/lib/insights";
import { getOwnerProfile } from "@/lib/profiles";
import { listVisitors } from "@/lib/visitors-store";

/** Owner-only. What recruiters looked at most on the requester's card (the app's Activity screen). */
export async function GET() {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    const [events, visitors] = await Promise.all([listEvents(owner.slug), listVisitors(owner.slug)]);
    return NextResponse.json({ success: true, data: { ...computeInsights(events), leftInfo: visitors.length } });
  } catch {
    return NextResponse.json({ success: false, error: "Could not read insights" }, { status: 500 });
  }
}
