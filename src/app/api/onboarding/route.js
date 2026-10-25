import { NextResponse } from "next/server";
import { z } from "zod";
import { buildProfileDraft } from "@/lib/ai";
import { profileFromDraft } from "@/lib/profile-from-draft";
import { createProfile, newOwnerToken, OWNER_COOKIE, uniqueSlug } from "@/lib/profiles";
import { readStored, storedKind } from "@/lib/storage";

export const maxDuration = 120;

const MAX_PDF = 8 * 1024 * 1024;

const BodySchema = z.object({
  resumeUrl: z.string().min(1),
  photoUrl: z.string().min(1),
  answers: z.object({
    displayName: z.string().max(80).default(""),
    pronouns: z.string().max(30).default(""),
    email: z.string().max(200).default(""),
    phone: z.string().max(40).default(""),
    linkedin: z.string().max(200).default(""),
    github: z.string().max(200).default(""),
    targetRoles: z.string().max(300).default(""),
    building: z.string().max(500).default(""),
    tagline: z.string().max(140).default(""),
  }),
});

const fail = (error, status) => NextResponse.json({ success: false, error }, { status });

/**
 * Onboarding: the photo and resume are already uploaded (see /api/uploads).
 * Claude builds the portfolio, it's saved, and the caller becomes its owner:
 * the secret token goes back in the body (for the app) and in a cookie (for web).
 * Open to anyone, like any sign-up; it only ever creates a new profile.
 */
export async function POST(req) {
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return fail("Some answers are too long.", 400);
    const { resumeUrl, photoUrl, answers } = parsed.data;
    if (storedKind(resumeUrl) !== "pdf") return fail("Upload your resume as a PDF.", 400);
    if (storedKind(photoUrl) !== "image") return fail("Upload a JPEG or PNG photo.", 400);

    const resume = await readStored(resumeUrl);
    if (!resume || resume.byteLength > MAX_PDF) return fail("Couldn't find that resume, or it's over 8 MB. Upload it again.", 400);

    let draft;
    try {
      draft = await buildProfileDraft(Buffer.from(resume).toString("base64"), answers);
    } catch {
      return fail("Couldn't read that resume right now. Try again in a moment.", 502);
    }

    const slug = await uniqueSlug(answers.displayName || `${draft.firstName} ${draft.lastName}`);
    const profile = profileFromDraft(draft, answers, { slug, photo: photoUrl, resumePdf: resumeUrl });
    const { token, hash } = newOwnerToken();
    await createProfile(profile, hash);

    const res = NextResponse.json({ success: true, data: { slug, ownerToken: token } });
    res.cookies.set(OWNER_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: req.nextUrl.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  } catch {
    return fail("Something went wrong building your card.", 500);
  }
}
