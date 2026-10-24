import "server-only";
import { createJsonStore } from "./json-store";
import type { Conversation } from "./types";

const store = createJsonStore<Conversation>("conversations");

/** Newest first, soft-deleted ones hidden. */
export async function listConversations(): Promise<Conversation[]> {
  const all = await store.list();
  return all.filter((c) => !c.deletedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  const all = await store.list();
  return all.find((c) => c.id === id && !c.deletedAt);
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
  await store.mutate((items) => {
    items.push(convo);
  });
  return convo;
}

export async function updateConversation(
  id: string,
  patch: (c: Conversation) => Conversation,
): Promise<Conversation | undefined> {
  return store.mutate((items) => {
    const i = items.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) return undefined;
    items[i] = patch(items[i]);
    return items[i];
  });
}
