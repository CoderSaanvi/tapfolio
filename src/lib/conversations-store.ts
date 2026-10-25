import "server-only";
import { createJsonStore } from "./json-store";
import { getOwnerProfile } from "./profiles";
import { sbGetConversation, sbListConversations, sbSaveConversation, supabaseEnabled } from "./supabase";
import type { Conversation, Profile } from "./types";

const local = createJsonStore<Conversation>("conversations");

/** One card's conversations, newest first, soft-deleted ones hidden. */
export async function listConversations(slug: string): Promise<Conversation[]> {
  if (supabaseEnabled()) return sbListConversations(slug);
  const all = await local.list();
  return all.filter((c) => c.slug === slug && !c.deletedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  if (supabaseEnabled()) return sbGetConversation(id);
  return (await local.list()).find((c) => c.id === id && !c.deletedAt);
}

export async function createConversation(slug: string, eventName: string): Promise<Conversation> {
  const convo: Conversation = {
    id: crypto.randomUUID(),
    slug,
    eventName,
    startedAt: new Date().toISOString(),
    transcript: "",
    notes: "",
    recruiter: { name: "", email: "", company: "", role: "" },
  };
  if (supabaseEnabled()) await sbSaveConversation(convo);
  else
    await local.mutate((items) => {
      items.push(convo);
    });
  return convo;
}

export async function updateConversation(
  id: string,
  patch: (c: Conversation) => Conversation,
): Promise<Conversation | undefined> {
  if (supabaseEnabled()) {
    const current = await sbGetConversation(id);
    if (!current) return undefined;
    const next = patch(current);
    await sbSaveConversation(next);
    return next;
  }
  return local.mutate((items) => {
    const i = items.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) return undefined;
    items[i] = patch(items[i]);
    return items[i];
  });
}

/** The conversation, only if it belongs to the card owned by whoever is making this request. */
export async function getOwnedConversation(id: string): Promise<{ convo: Conversation; owner: Profile } | undefined> {
  const [owner, convo] = await Promise.all([getOwnerProfile(), getConversation(id)]);
  if (!owner || !convo || convo.slug !== owner.slug) return undefined;
  return { convo, owner };
}
