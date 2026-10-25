"use client";

let ctx = null;

/** crypto.randomUUID only exists on secure origins (https / localhost); phones opening the card over plain http need a fallback. */
function uuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function newSessionId(slug) {
  const key = `tapfolio:session:${slug}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = uuid();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return uuid();
  }
}

/** The current viewing session, so the "leave your info" form can link itself to it. */
export function trackingContext() {
  return ctx;
}

/** Starts (or resumes, within this tab) a viewing session for one card. */
export function initTracking(slug, eventName, conversationId, audience) {
  ctx = { sessionId: newSessionId(slug), slug, eventName, conversationId, audience };
}

export function track(type, target, label, ms) {
  if (!ctx) return;
  const body = JSON.stringify({ ...ctx, type, target, label, ms });
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon("/api/events", blob)) return;
    void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => undefined);
  } catch {
    // Tracking must never break the card.
  }
}
