const LINK_WINDOW_MS = 10 * 60 * 1000;

/**
 * Card views that belong to a conversation: those opened from its link, plus
 * views from a plain link (e.g. the QR was scanned before "Start conversation")
 * that began within 10 minutes of the conversation at the same event.
 */
export function eventsForConversation(events, c) {
  const start = new Date(c.startedAt).getTime() - LINK_WINDOW_MS;
  const end = (c.endedAt ? new Date(c.endedAt).getTime() : Date.now()) + LINK_WINDOW_MS;
  const nearby = new Set(
    events
      .filter((e) => e.type === "open" && !e.conversationId && e.slug === c.slug)
      .filter((e) => (e.eventName ?? "") === c.eventName || !e.eventName || !c.eventName)
      .filter((e) => {
        const t = new Date(e.at).getTime();
        return t >= start && t <= end;
      })
      .map((e) => e.sessionId),
  );
  return events.filter((e) => e.conversationId === c.id || (!e.conversationId && nearby.has(e.sessionId)));
}

function deviceFrom(ua = "") {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android phone";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Unknown device";
}

/** Folds the raw event log into one summary per recruiter viewing session, newest first. */
export function summarizeSessions(events) {
  const bySession = new Map();
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
      const times = new Map();
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
