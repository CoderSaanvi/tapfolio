import "server-only";
import { createJsonStore } from "./json-store";
import { sbInsertVisitor, sbListVisitors, supabaseEnabled } from "./supabase";
import type { Visitor } from "./types";

const local = createJsonStore<Visitor>("visitors");

export async function appendVisitor(visitor: Visitor): Promise<void> {
  if (supabaseEnabled()) return sbInsertVisitor(visitor);
  await local.mutate((items) => {
    items.push(visitor);
  });
}

/** Everyone who left their info on one card, oldest first. */
export async function listVisitors(slug: string): Promise<Visitor[]> {
  if (supabaseEnabled()) return sbListVisitors(slug);
  return (await local.list()).filter((v) => v.slug === slug);
}
