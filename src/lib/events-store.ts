import "server-only";
import { createJsonStore } from "./json-store";
import { sbInsertEvent, sbListEvents, supabaseEnabled } from "./supabase";
import type { ViewEvent } from "./types";

const local = createJsonStore<ViewEvent>("events");

export async function appendEvent(event: ViewEvent): Promise<void> {
  if (supabaseEnabled()) return sbInsertEvent(event);
  await local.mutate((items) => {
    items.push(event);
  });
}

/** All view events for one card, oldest first. */
export async function listEvents(slug: string): Promise<ViewEvent[]> {
  if (supabaseEnabled()) return sbListEvents(slug);
  return (await local.list()).filter((e) => e.slug === slug);
}
