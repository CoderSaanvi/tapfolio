import "server-only";
import { createJsonStore } from "./json-store";
import { sbInsertVisitor, sbListVisitors, supabaseEnabled } from "./supabase";

const local = createJsonStore("visitors");

export async function appendVisitor(visitor) {
  if (supabaseEnabled()) return sbInsertVisitor(visitor);
  await local.mutate((items) => {
    items.push(visitor);
  });
}

/** Everyone who left their info on one card, oldest first. */
export async function listVisitors(slug) {
  if (supabaseEnabled()) return sbListVisitors(slug);
  return (await local.list()).filter((v) => v.slug === slug);
}
