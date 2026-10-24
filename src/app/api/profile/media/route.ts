import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { OWNER_COOKIE, updateProfile } from "@/lib/profiles";
import { extForMime, saveUpload } from "@/lib/uploads";
import type { Profile, ProjectMedia } from "@/lib/types";

export const maxDuration = 120;

const MAX_VIDEO = 200 * 1024 * 1024;
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_MEDIA_PER_PROJECT = 6;
const DEMO_LABEL = "Watch demo";

const JsonSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("link"), projectId: z.string().min(1), url: z.string().url().regex(/^https?:\/\//) }),
  z.object({ action: z.literal("removeLink"), projectId: z.string().min(1) }),
  z.object({ action: z.literal("removeMedia"), projectId: z.string().min(1), mediaId: z.string().min(1) }),
]);

function ownerSlug(): string | undefined {
  return cookies().get(OWNER_COOKIE)?.value;
}

function patchProject(p: Profile, projectId: string, fn: (proj: Profile["projects"][number]) => Profile["projects"][number]): Profile {
  return { ...p, projects: p.projects.map((proj) => (proj.id === projectId ? fn(proj) : proj)) };
}

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/**
 * Owner-only (the phone that built the card). Multipart {projectId, file} adds a demo
 * video or photo; JSON adds/removes a demo link or removes a media item.
 */
export async function POST(req: NextRequest) {
  try {
    const slug = ownerSlug();
    if (!slug) return fail("Build your card first.", 401);

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      const projectId = String(form.get("projectId") ?? "");
      const file = form.get("file");
      if (!projectId || !(file instanceof File)) return fail("Pick a project and a file.", 400);
      const ext = extForMime(file.type);
      const kind: ProjectMedia["kind"] | null = ext === "mp4" || ext === "mov" ? "video" : ext === "jpg" || ext === "png" ? "image" : null;
      if (!ext || !kind) return fail("Use a video (MP4/MOV) or a photo (JPEG/PNG).", 400);
      if (file.size > (kind === "video" ? MAX_VIDEO : MAX_IMAGE)) return fail(kind === "video" ? "Videos must be under 200 MB." : "Photos must be under 10 MB.", 400);

      const name = await saveUpload(await file.arrayBuffer(), ext);
      const item: ProjectMedia = { id: crypto.randomUUID(), kind, src: `/api/files/${name}` };
      const updated = await updateProfile(slug, (p) =>
        patchProject(p, projectId, (proj) => ({ ...proj, media: [...(proj.media ?? []), item].slice(-MAX_MEDIA_PER_PROJECT) })),
      );
      return updated ? NextResponse.json({ success: true, data: updated }) : fail("Card not found.", 404);
    }

    const parsed = JsonSchema.safeParse(await req.json());
    if (!parsed.success) return fail("Invalid request.", 400);
    const body = parsed.data;
    const updated = await updateProfile(slug, (p) =>
      patchProject(p, body.projectId, (proj) => {
        const otherLinks = (proj.links ?? []).filter((l) => l.label !== DEMO_LABEL);
        if (body.action === "link") return { ...proj, links: [{ label: DEMO_LABEL, href: body.url }, ...otherLinks] };
        if (body.action === "removeLink") return { ...proj, links: otherLinks };
        return { ...proj, media: (proj.media ?? []).filter((m) => m.id !== body.mediaId) };
      }),
    );
    return updated ? NextResponse.json({ success: true, data: updated }) : fail("Card not found.", 404);
  } catch {
    return fail("Couldn't save that. Try again.", 500);
  }
}
