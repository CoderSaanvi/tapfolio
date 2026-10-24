"use client";

import type { EventType } from "./types";

interface TrackContext {
  sessionId: string;
  slug: string;
  eventName?: string;
  conversationId?: string;
}

let ctx: TrackContext | null = null;

function newSessionId(slug: string): string {
  const key = `tapfolio:session:${slug}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return crypto.randomUUID();
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
