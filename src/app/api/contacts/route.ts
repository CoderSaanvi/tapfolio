import { NextResponse } from "next/server";
import { buildContacts } from "@/lib/contacts";
import { listConversations } from "@/lib/conversations-store";
import { getOwnerProfile } from "@/lib/profiles";
import { listVisitors } from "@/lib/visitors-store";

/** Owner-only. Everyone the requester has talked to or who left their info, one row per person (the app's Network screen). */
export async function GET() {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    const [conversations, visitors] = await Promise.all([listConversations(owner.slug), listVisitors(owner.slug)]);
    return NextResponse.json({ success: true, data: buildContacts(conversations, visitors) });
  } catch {
    return NextResponse.json({ success: false, error: "Could not read contacts" }, { status: 500 });
  }
}
