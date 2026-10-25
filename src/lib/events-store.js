import "server-only";
import { createJsonStore } from "./json-store";
import { sbInsertEvent, sbListEvents, supabaseEnabled } from "./supabase";

const local = createJsonStore("events");

export async function appendEvent(event) {
  if (supabaseEnabled()) return sbInsertEvent(event);
  await local.mutate((items) => {
    items.push(event);
  });
}

/** All view events for one card, oldest first. */
export async function listEvents(slug) {
  if (supabaseEnabled()) return sbListEvents(slug);
  return (await local.list()).filter((e) => e.slug === slug);
}
