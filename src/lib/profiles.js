import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { kaushik } from "@/data/profile";
import { createJsonStore } from "./json-store";
import { sbGetProfile, sbGetProfileByTokenHash, sbInsertProfile, sbSlugsLike, sbUpdateProfile, supabaseEnabled } from "./supabase";

/**
 * Profiles built through onboarding (Supabase, or .data/ locally). The
 * hand-written sample is always available too. Each profile has an owner: the
 * phone holding its secret token (cookie on web, Bearer header in the app).
 */
const SAMPLES = [kaushik];
const local = createJsonStore("profiles");
const localOwners = createJsonStore("owners");

export const OWNER_COOKIE = "tapfolio_owner";

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function newOwnerToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export async function getProfile(slug) {
  const built = supabaseEnabled() ? await sbGetProfile(slug) : (await local.list()).find((p) => p.slug === slug);
  return built ?? SAMPLES.find((p) => p.slug === slug);
}

/** The token from the app's Authorization header, else the web cookie. */
function ownerToken() {
  const auth = headers().get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim() || undefined;
  return cookies().get(OWNER_COOKIE)?.value;
}

/** The profile owned by whoever is making this request, if any. */
export async function getOwnerProfile() {
  const token = ownerToken();
  if (!token) return undefined;
  const hash = hashToken(token);
  if (supabaseEnabled()) return sbGetProfileByTokenHash(hash);
  const owner = (await localOwners.list()).find((o) => o.tokenHash === hash);
  // Cards built before owner tokens stored the slug in the cookie; still honored locally.
  const slug = owner?.slug ?? token;
  return (await local.list()).find((p) => p.slug === slug);
}

/** "Jane Doe" -> "jane-doe", then "jane-doe-2" etc. if taken. */
export async function uniqueSlug(name) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "card";
  const existing = supabaseEnabled() ? await sbSlugsLike(base) : (await local.list()).map((p) => p.slug);
  const taken = new Set([...SAMPLES.map((p) => p.slug), ...existing]);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function createProfile(profile, ownerTokenHash) {
  if (supabaseEnabled()) return sbInsertProfile(profile, ownerTokenHash);
  await local.mutate((items) => {
    items.push(profile);
  });
  await localOwners.mutate((items) => {
    items.push({ slug: profile.slug, tokenHash: ownerTokenHash });
  });
}

/** Applies `patch` to a built profile. Returns undefined if it doesn't exist (samples can't be edited). */
export async function updateProfile(slug, patch) {
  if (supabaseEnabled()) {
    const current = await sbGetProfile(slug);
    if (!current) return undefined;
    const next = patch(current);
    await sbUpdateProfile(next);
    return next;
  }
  return local.mutate((items) => {
    const i = items.findIndex((p) => p.slug === slug);
    if (i === -1) return undefined;
    items[i] = patch(items[i]);
    return items[i];
  });
}
