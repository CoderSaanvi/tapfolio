import { NextResponse } from "next/server";
import { buildContacts } from "@/lib/contacts";
import { listConversations } from "@/lib/conversations-store";
import { getOwnerProfile } from "@/lib/profiles";

/** Owner-only. Everyone the requester has talked to, one row per person (the app's Network screen). */
export async function GET() {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    return NextResponse.json({ success: true, data: buildContacts(await listConversations(owner.slug)) });
  } catch {
    return NextResponse.json({ success: false, error: "Could not read contacts" }, { status: 500 });
  }
}
