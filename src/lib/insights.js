const PROJECT_PREFIXES = ["project", "demo:"];
/** A tab left open on a section keeps reporting dwell; past this it's idle, not reading. */
const MAX_DWELL_MS = 3 * 60 * 1000;

function isProject(target) {
  return PROJECT_PREFIXES.some((p) => target.startsWith(p));
}

/** "Project: ADAPT" → "ADAPT"; other labels unchanged. */
function cleanLabel(label) {
  return label.replace(/^Project:\s*/i, "");
}

function rank(map, limit) {
  return Array.from(map.entries())
    .map(([key, v]) => ({ target: key, label: v.label, ms: v.ms, sessions: v.sessions.size }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, limit);
}

/**
 * Folds the raw event log for one card into what the owner wants to know:
 * who looked, what they lingered on, and what they tapped. Grouped by label
 * (not target id) so a rebuilt card's renamed ids still count as one project.
 */
export function computeInsights(events, limit = 5) {
  const projects = new Map();
  const sections = new Map();
  const clicks = new Map();
  const via = new Map();
  const perSession = new Map();
  const audience = { recruiter: 0, student: 0, unknown: 0 };
  const viewers = new Set();
  let views = 0;
  let lastViewedAt;

  for (const e of events) {
    viewers.add(e.sessionId);
    if (!lastViewedAt || e.at > lastViewedAt) lastViewedAt = e.at;

    if (e.type === "open") {
      views += 1;
      const how = e.label.replace(/^Opened card( via )?/, "") || "link";
      via.set(how, (via.get(how) ?? 0) + 1);
      if (e.audience === "recruiter") audience.recruiter += 1;
      else if (e.audience === "student") audience.student += 1;
      else audience.unknown += 1;
      continue;
    }

    if (e.type === "dwell" && e.ms) {
      const ms = Math.min(e.ms, MAX_DWELL_MS);
      const bucket = isProject(e.target) ? projects : sections;
      const key = cleanLabel(e.label).toLowerCase();
      const item = bucket.get(key) ?? { label: cleanLabel(e.label), ms: 0, sessions: new Set() };
      item.ms += ms;
      item.sessions.add(e.sessionId);
      bucket.set(key, item);
      perSession.set(e.sessionId, (perSession.get(e.sessionId) ?? 0) + ms);
      continue;
    }

    if (e.type === "click") {
      const key = e.label.toLowerCase();
      const item = clicks.get(key) ?? { label: e.label, count: 0 };
      item.count += 1;
      clicks.set(key, item);
    }
  }

  const totals = Array.from(perSession.values());
  const totalMs = totals.reduce((a, b) => a + b, 0);

  return {
    views,
    viewers: viewers.size,
    totalMs,
    avgMs: totals.length ? Math.round(totalMs / totals.length) : 0,
    topProjects: rank(projects, limit),
    topSections: rank(sections, limit),
    topClicks: Array.from(clicks.entries())
      .map(([key, v]) => ({ target: key, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit),
    openedVia: Array.from(via.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    audience,
    lastViewedAt,
  };
}
