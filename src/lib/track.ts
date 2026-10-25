"use client";

import type { EventType } from "./types";

interface TrackContext {
  sessionId: string;
  slug: string;
  eventName?: string;
  conversationId?: string;
}

let ctx: TrackContext | null = null;

/** crypto.randomUUID only exists on secure origins (https / localhost); phones opening the card over plain http need a fallback. */
function uuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function newSessionId(slug: string): string {
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

/** Starts (or resumes, within this tab) a viewing session for one card. */
export function initTracking(slug: string, eventName?: string, conversationId?: string): void {
  ctx = { sessionId: newSessionId(slug), slug, eventName, conversationId };
}

export function track(type: EventType, target: string, label: string, ms?: number): void {
  if (!ctx) return;
  const body = JSON.stringify({ ...ctx, type, target, label, ms });
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon("/api/events", blob)) return;
    void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
      () => undefined,
    );
  } catch {
    // Tracking must never break the card.
  }
}
