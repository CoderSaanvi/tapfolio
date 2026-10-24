import "server-only";
import { createJsonStore } from "./json-store";
import type { ViewEvent } from "./types";

const store = createJsonStore<ViewEvent>("events");

export async function appendEvent(event: ViewEvent): Promise<void> {
  await store.mutate((items) => {
    items.push(event);
  });
}

export async function listEvents(): Promise<ViewEvent[]> {
  return store.list();
}
