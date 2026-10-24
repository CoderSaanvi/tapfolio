import type { ViewEvent } from "./types";

export interface SectionTime {
  target: string;
  label: string;
  ms: number;
}

export interface ViewSession {
  sessionId: string;
  slug: string;
  eventName?: string;
  device: string;
  openedVia: string;
  startedAt: string;
  lastAt: string;
  totalMs: number;
  sections: SectionTime[];
  clicks: { label: string; at: string }[];
}

function deviceFrom(ua = ""): string {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android phone";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Unknown device";
}

/** Folds the raw event log into one summary per recruiter viewing session, newest first. */
export function summarizeSessions(events: ViewEvent[]): ViewSession[] {
  const bySession = new Map<string, ViewEvent[]>();
  for (const e of events) {
    const list = bySession.get(e.sessionId) ?? [];
    list.push(e);
    bySession.set(e.sessionId, list);
  }

  return Array.from(bySession.values())
    .map((list) => {
      list.sort((a, b) => a.at.localeCompare(b.at));
      const first = list[0];
      const open = list.find((e) => e.type === "open");
      const times = new Map<string, SectionTime>();
      for (const e of list) {
        if (e.type !== "dwell" || !e.ms) continue;
        const t = times.get(e.target) ?? { target: e.target, label: e.label, ms: 0 };
        t.ms += e.ms;
        times.set(e.target, t);
      }
      const sections = Array.from(times.values()).sort((a, b) => b.ms - a.ms);
      return {
        sessionId: first.sessionId,
        slug: first.slug,
        eventName: list.find((e) => e.eventName)?.eventName,
        device: deviceFrom(first.userAgent),
        openedVia: open?.label ?? "Opened card",
        startedAt: first.at,
        lastAt: list[list.length - 1].at,
        totalMs: sections.reduce((sum, s) => sum + s.ms, 0),
        sections,
        clicks: list.filter((e) => e.type === "click").map((e) => ({ label: e.label, at: e.at })),
      };
    })
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
