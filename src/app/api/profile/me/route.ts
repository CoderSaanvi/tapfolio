import { NextResponse } from "next/server";
import { getOwnerProfile } from "@/lib/profiles";

/** Owner-only. The requester's own card (the app's Share and Demos screens read this). */
export async function GET() {
  try {
    const profile = await getOwnerProfile();
    if (!profile) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json({ success: false, error: "Could not load your card" }, { status: 500 });
  }
}
