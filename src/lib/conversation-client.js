"use client";

async function call(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success || json.data === undefined) throw new Error(json.error ?? "Request failed");
  return json.data;
}

export function startConversation(slug, eventName) {
  return call("/api/conversations", "POST", { slug, eventName });
}

export function patchConversation(id, patch) {
  return call(`/api/conversations/${id}`, "PATCH", patch);
}

export function requestDraft(id) {
  return call(`/api/conversations/${id}/draft`, "POST");
}
