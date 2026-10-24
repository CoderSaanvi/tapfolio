"use client";

import type { Conversation } from "./types";

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function call<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!json.success || json.data === undefined) throw new Error(json.error ?? "Request failed");
  return json.data;
}

export function startConversation(slug: string, eventName: string): Promise<{ id: string }> {
  return call("/api/conversations", "POST", { slug, eventName });
}

export function patchConversation(id: string, patch: Record<string, unknown>): Promise<Conversation> {
  return call(`/api/conversations/${id}`, "PATCH", patch);
}

export function requestDraft(id: string): Promise<Conversation> {
  return call(`/api/conversations/${id}/draft`, "POST");
}
