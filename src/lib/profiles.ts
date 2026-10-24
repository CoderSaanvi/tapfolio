import "server-only";
import { cookies } from "next/headers";
import { kaushik } from "@/data/profile";
import { createJsonStore } from "./json-store";
import type { Profile } from "./types";

/** Profiles built through onboarding. The hand-written sample is always available too. */
const store = createJsonStore<Profile>("profiles");
const SAMPLES: Profile[] = [kaushik];

/** Which profile this phone owns. Set when onboarding finishes. */
export const OWNER_COOKIE = "tapfolio_owner";

export async function getProfile(slug: string): Promise<Profile | undefined> {
  const built = (await store.list()).find((p) => p.slug === slug);
  return built ?? SAMPLES.find((p) => p.slug === slug);
}

export async function getOwnerProfile(): Promise<Profile | undefined> {
  const slug = cookies().get(OWNER_COOKIE)?.value;
  return slug ? getProfile(slug) : undefined;
}

/** "Jane Doe" -> "jane-doe", then "jane-doe-2" etc. if taken. */
export async function uniqueSlug(name: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "card";
  const taken = new Set([...SAMPLES, ...(await store.list())].map((p) => p.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await store.mutate((items) => {
    const i = items.findIndex((p) => p.slug === profile.slug);
    if (i === -1) items.push(profile);
    else items[i] = profile;
  });
}
