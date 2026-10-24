import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, Profile, ViewEvent } from "./types";

/**
 * Every Supabase call goes through this file. Server-only, using the service
 * role key; tables have RLS on with no policies, so nothing else can read them.
 * When the env vars are missing, `supabaseEnabled()` is false and callers fall
 * back to the local JSON files in .data/.
 */
export const BUCKET = "uploads";

let client: SupabaseClient | null | undefined;

function sb(): SupabaseClient {
  if (client === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  }
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

export function supabaseEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// Profiles

export async function sbGetProfile(slug: string): Promise<Profile | undefined> {
  const row = check(await sb().from("profiles").select("data").eq("slug", slug).is("deleted_at", null).maybeSingle());
  return (row?.data as Profile | undefined) ?? undefined;
}

export async function sbGetProfileByTokenHash(hash: string): Promise<Profile | undefined> {
  const row = check(await sb().from("profiles").select("data").eq("owner_token_hash", hash).is("deleted_at", null).maybeSingle());
  return (row?.data as Profile | undefined) ?? undefined;
}

export async function sbSlugsLike(base: string): Promise<string[]> {
  const rows = check(await sb().from("profiles").select("slug").like("slug", `${base}%`));
  return (rows ?? []).map((r: { slug: string }) => r.slug);
}

export async function sbInsertProfile(profile: Profile, ownerTokenHash: string): Promise<void> {
  check(await sb().from("profiles").insert({ slug: profile.slug, owner_token_hash: ownerTokenHash, data: profile }));
}

export async function sbUpdateProfile(profile: Profile): Promise<void> {
  check(await sb().from("profiles").update({ data: profile, updated_at: new Date().toISOString() }).eq("slug", profile.slug));
}

// Conversations

export async function sbListConversations(slug: string): Promise<Conversation[]> {
  const rows = check(await sb().from("conversations").select("data").eq("profile_slug", slug).is("deleted_at", null).order("started_at", { ascending: false }));
  return (rows ?? []).map((r: { data: Conversation }) => r.data);
}

export async function sbGetConversation(id: string): Promise<Conversation | undefined> {
  const row = check(await sb().from("conversations").select("data").eq("id", id).is("deleted_at", null).maybeSingle());
  return (row?.data as Conversation | undefined) ?? undefined;
}

export async function sbSaveConversation(c: Conversation): Promise<void> {
  check(
    await sb()
      .from("conversations")
      .upsert({ id: c.id, profile_slug: c.slug, data: c, started_at: c.startedAt, deleted_at: c.deletedAt ?? null }),
  );
}

// View events

export async function sbInsertEvent(e: ViewEvent): Promise<void> {
  check(
    await sb().from("view_events").insert({
      id: e.id,
      session_id: e.sessionId,
      slug: e.slug,
      conversation_id: e.conversationId ?? null,
      type: e.type,
      target: e.target,
      label: e.label,
      ms: e.ms ?? null,
      event_name: e.eventName ?? null,
      user_agent: e.userAgent ?? null,
      at: e.at,
    }),
  );
}

interface EventRow {
  id: string;
  session_id: string;
  slug: string;
  conversation_id: string | null;
  type: ViewEvent["type"];
  target: string;
  label: string;
  ms: number | null;
  event_name: string | null;
  user_agent: string | null;
  at: string;
}

export async function sbListEvents(slug: string): Promise<ViewEvent[]> {
  const rows = check(await sb().from("view_events").select("*").eq("slug", slug).order("at", { ascending: true }).limit(5000));
  return ((rows ?? []) as EventRow[]).map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    slug: r.slug,
    conversationId: r.conversation_id ?? undefined,
    type: r.type,
    target: r.target,
    label: r.label,
    ms: r.ms ?? undefined,
    eventName: r.event_name ?? undefined,
    userAgent: r.user_agent ?? undefined,
    at: r.at,
  }));
}

// Storage

export async function sbSignedUpload(path: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const data = check(await sb().storage.from(BUCKET).createSignedUploadUrl(path));
  if (!data) throw new Error("Could not create upload URL");
  return { uploadUrl: data.signedUrl, publicUrl: sb().storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

export function sbPublicUrlPrefix(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
}

export async function sbDownload(path: string): Promise<ArrayBuffer> {
  const blob = check(await sb().storage.from(BUCKET).download(path));
  if (!blob) throw new Error("File not found");
  return blob.arrayBuffer();
}
