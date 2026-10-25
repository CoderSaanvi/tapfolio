import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Every Supabase call goes through this file. Server-only, using the service
 * role key; tables have RLS on with no policies, so nothing else can read them.
 * When the env vars are missing, `supabaseEnabled()` is false and callers fall
 * back to the local JSON files in .data/.
 */
export const BUCKET = "uploads";

let client;

function sb() {
  if (client === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  }
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

export function supabaseEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function check(res) {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// Profiles

export async function sbGetProfile(slug) {
  const row = check(await sb().from("profiles").select("data").eq("slug", slug).is("deleted_at", null).maybeSingle());
  return row?.data ?? undefined;
}

export async function sbGetProfileByTokenHash(hash) {
  const row = check(await sb().from("profiles").select("data").eq("owner_token_hash", hash).is("deleted_at", null).maybeSingle());
  return row?.data ?? undefined;
}

export async function sbSlugsLike(base) {
  const rows = check(await sb().from("profiles").select("slug").like("slug", `${base}%`));
  return (rows ?? []).map((r) => r.slug);
}

export async function sbInsertProfile(profile, ownerTokenHash) {
  check(await sb().from("profiles").insert({ slug: profile.slug, owner_token_hash: ownerTokenHash, data: profile }));
}

export async function sbUpdateProfile(profile) {
  check(await sb().from("profiles").update({ data: profile, updated_at: new Date().toISOString() }).eq("slug", profile.slug));
}

// Conversations

export async function sbListConversations(slug) {
  const rows = check(await sb().from("conversations").select("data").eq("profile_slug", slug).is("deleted_at", null).order("started_at", { ascending: false }));
  return (rows ?? []).map((r) => r.data);
}

export async function sbGetConversation(id) {
  const row = check(await sb().from("conversations").select("data").eq("id", id).is("deleted_at", null).maybeSingle());
  return row?.data ?? undefined;
}

export async function sbSaveConversation(c) {
  check(
    await sb()
      .from("conversations")
      .upsert({ id: c.id, profile_slug: c.slug, data: c, started_at: c.startedAt, deleted_at: c.deletedAt ?? null }),
  );
}

// Visitors (people who left their info on the card)

export async function sbInsertVisitor(v) {
  check(await sb().from("visitors").insert({ id: v.id, profile_slug: v.slug, data: v, created_at: v.at }));
}

export async function sbListVisitors(slug) {
  const rows = check(await sb().from("visitors").select("data").eq("profile_slug", slug).order("created_at", { ascending: true }));
  return (rows ?? []).map((r) => r.data);
}

// View events

export async function sbInsertEvent(e) {
  check(
    await sb()
      .from("view_events")
      .insert({
        id: e.id,
        session_id: e.sessionId,
        slug: e.slug,
        conversation_id: e.conversationId ?? null,
        type: e.type,
        target: e.target,
        label: e.label,
        ms: e.ms ?? null,
        event_name: e.eventName ?? null,
        audience: e.audience ?? null,
        user_agent: e.userAgent ?? null,
        at: e.at,
      }),
  );
}

export async function sbListEvents(slug) {
  const rows = check(await sb().from("view_events").select("*").eq("slug", slug).order("at", { ascending: true }).limit(5000));
  return (rows ?? []).map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    slug: r.slug,
    conversationId: r.conversation_id ?? undefined,
    type: r.type,
    target: r.target,
    label: r.label,
    ms: r.ms ?? undefined,
    eventName: r.event_name ?? undefined,
    audience: r.audience ?? undefined,
    userAgent: r.user_agent ?? undefined,
    at: r.at,
  }));
}

// Storage

export async function sbSignedUpload(path) {
  const data = check(await sb().storage.from(BUCKET).createSignedUploadUrl(path));
  if (!data) throw new Error("Could not create upload URL");
  return { uploadUrl: data.signedUrl, publicUrl: sb().storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

export function sbPublicUrlPrefix() {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
}

export async function sbDownload(path) {
  const blob = check(await sb().storage.from(BUCKET).download(path));
  if (!blob) throw new Error("File not found");
  return blob.arrayBuffer();
}
