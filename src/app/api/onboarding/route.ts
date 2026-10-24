import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { buildProfileDraft } from "@/lib/ai";
import { profileFromDraft } from "@/lib/profile-from-draft";
import { OWNER_COOKIE, saveProfile, uniqueSlug } from "@/lib/profiles";
import { saveUpload } from "@/lib/uploads";

export const maxDuration = 120;

const MAX_PDF = 8 * 1024 * 1024;
const MAX_PHOTO = 8 * 1024 * 1024;

const AnswersSchema = z.object({
  email: z.string().max(200).default(""),
  phone: z.string().max(40).default(""),
  linkedin: z.string().max(200).default(""),
  github: z.string().max(200).default(""),
  targetRoles: z.string().max(300).default(""),
  building: z.string().max(500).default(""),
  tagline: z.string().max(140).default(""),
});

/**
 * Onboarding: takes a resume PDF, a photo, and a few answers, has Claude build
 * the portfolio, saves it, and makes this phone its owner (cookie). Open to
 * anyone, like any sign-up; it only ever creates a new profile.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const resume = form.get("resume");
    const photo = form.get("photo");
    const answers = AnswersSchema.safeParse(JSON.parse(String(form.get("answers") ?? "{}")));

    if (!(resume instanceof File) || resume.type !== "application/pdf" || resume.size > MAX_PDF) {
      return NextResponse.json({ success: false, error: "Upload your resume as a PDF under 8 MB." }, { status: 400 });
    }
    if (!(photo instanceof File) || !/^image\/(jpeg|png)$/.test(photo.type) || photo.size > MAX_PHOTO) {
      return NextResponse.json({ success: false, error: "Upload a JPEG or PNG photo under 8 MB." }, { status: 400 });
    }
    if (!answers.success) return NextResponse.json({ success: false, error: "Some answers are too long." }, { status: 400 });

    const resumeBytes = await resume.arrayBuffer();
    let draft;
    try {
      draft = await buildProfileDraft(Buffer.from(resumeBytes).toString("base64"), answers.data);
    } catch {
      return NextResponse.json({ success: false, error: "Couldn't read that resume right now. Try again in a moment." }, { status: 502 });
    }

    const [resumeName, photoName] = await Promise.all([
      saveUpload(resumeBytes, "pdf"),
      saveUpload(await photo.arrayBuffer(), photo.type === "image/png" ? "png" : "jpg"),
    ]);
    const slug = await uniqueSlug(`${draft.firstName} ${draft.lastName}`);
    const profile = profileFromDraft(draft, answers.data, { slug, photo: `/api/files/${photoName}`, resumePdf: `/api/files/${resumeName}` });
    await saveProfile(profile);

    const res = NextResponse.json({ success: true, data: { slug } });
    res.cookies.set(OWNER_COOKIE, slug, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Something went wrong building your card." }, { status: 500 });
  }
}
