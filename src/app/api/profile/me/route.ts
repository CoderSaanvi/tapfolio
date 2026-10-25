import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { summarizeExperience } from "@/lib/ai";
import { getOwnerProfile, updateProfile } from "@/lib/profiles";
import type { ExperienceItem, Profile } from "@/lib/types";

const PatchSchema = z.object({
  banner: z
    .object({
      text: z.string().trim().max(80),
      logo: z.string().trim().max(300).optional(),
    })
    .optional(),
});

/** One in-flight backfill per card, so the app's parallel requests don't each call Claude. */
const backfills = new Map<string, Promise<Profile>>();

/**
 * Cards built before experience summaries existed get them on the owner's next
 * app launch: one Claude call, saved to the profile. If Claude fails the card
 * still works, just with bullets.
 */
async function withExperienceSummaries(profile: Profile): Promise<Profile> {
  const all = [...profile.experience.work, ...profile.experience.leadership];
  if (all.length === 0 || all.every((e) => e.summary)) return profile;
  const running = backfills.get(profile.slug);
  if (running) return running;
  const task = (async () => {
    try {
      const summaries = await summarizeExperience(all.filter((e) => !e.summary));
      if (summaries.size === 0) return profile;
      const apply = (e: ExperienceItem): ExperienceItem => {
        const s = summaries.get(e.title);
        return s ? { ...e, summary: s.summary, metrics: s.metrics.length ? s.metrics : undefined } : e;
      };
      const updated = await updateProfile(profile.slug, (p) => ({
        ...p,
        experience: { work: p.experience.work.map(apply), leadership: p.experience.leadership.map(apply) },
      }));
      return updated ?? profile;
    } catch {
      return profile;
    } finally {
      backfills.delete(profile.slug);
    }
  })();
  backfills.set(profile.slug, task);
  return task;
}

/** Owner-only. The requester's own card (the app's Share and Demos screens read this). */
export async function GET() {
  try {
    const profile = await getOwnerProfile();
    if (!profile) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    return NextResponse.json({ success: true, data: await withExperienceSummaries(profile) });
  } catch {
    return NextResponse.json({ success: false, error: "Could not load your card" }, { status: 500 });
  }
}

/** Owner-only. Small edits to the card the app exposes (today: the banner strip). */
export async function PATCH(req: NextRequest) {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    const parsed = PatchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid update" }, { status: 400 });
    const { banner } = parsed.data;
    const updated = await updateProfile(owner.slug, (p) => ({ ...p, ...(banner ? { banner } : {}) }));
    if (!updated) return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Could not save your card" }, { status: 500 });
  }
}
