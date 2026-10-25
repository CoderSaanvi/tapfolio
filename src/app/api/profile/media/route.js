import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnerProfile, updateProfile } from "@/lib/profiles";
import { storedKind } from "@/lib/storage";

const MAX_MEDIA_PER_PROJECT = 6;
const DEMO_LABEL = "Watch demo";

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add"), projectId: z.string().min(1), url: z.string().min(1) }),
  z.object({
    action: z.literal("link"),
    projectId: z.string().min(1),
    url: z
      .string()
      .url()
      .regex(/^https?:\/\//),
  }),
  z.object({ action: z.literal("removeLink"), projectId: z.string().min(1) }),
  z.object({ action: z.literal("removeMedia"), projectId: z.string().min(1), mediaId: z.string().min(1) }),
]);

function patchProject(p, projectId, fn) {
  return { ...p, projects: p.projects.map((proj) => (proj.id === projectId ? fn(proj) : proj)) };
}

const fail = (error, status) => NextResponse.json({ success: false, error }, { status });

/**
 * Owner-only. Attaches an uploaded demo video/photo (see /api/uploads) to one of the
 * owner's projects, sets or clears its demo link, or removes a media item.
 */
export async function POST(req) {
  try {
    const owner = await getOwnerProfile();
    if (!owner) return fail("Build your card first.", 401);
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return fail("Invalid request.", 400);
    const body = parsed.data;
    if (!owner.projects.some((p) => p.id === body.projectId)) return fail("Project not found.", 404);

    let item = null;
    if (body.action === "add") {
      const kind = storedKind(body.url);
      if (kind !== "video" && kind !== "image") return fail("Upload a video (MP4/MOV) or photo (JPEG/PNG) first.", 400);
      item = { id: crypto.randomUUID(), kind, src: body.url };
    }

    const updated = await updateProfile(owner.slug, (p) =>
      patchProject(p, body.projectId, (proj) => {
        const otherLinks = (proj.links ?? []).filter((l) => l.label !== DEMO_LABEL);
        switch (body.action) {
          case "add":
            return { ...proj, media: [...(proj.media ?? []), item].slice(-MAX_MEDIA_PER_PROJECT) };
          case "link":
            return { ...proj, links: [{ label: DEMO_LABEL, href: body.url }, ...otherLinks] };
          case "removeLink":
            return { ...proj, links: otherLinks };
          case "removeMedia":
            return { ...proj, media: (proj.media ?? []).filter((m) => m.id !== body.mediaId) };
        }
      }),
    );
    return updated ? NextResponse.json({ success: true, data: updated }) : fail("Card not found.", 404);
  } catch {
    return fail("Couldn't save that. Try again.", 500);
  }
}
