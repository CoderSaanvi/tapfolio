/** One key per person: their email when we have it, else name + company. */
function keyFor(p, fallback) {
  if (p.email.trim()) return `email:${p.email.trim().toLowerCase()}`;
  if (p.name.trim()) return `name:${p.name.trim().toLowerCase()}|${p.company.trim().toLowerCase()}`;
  if (p.company.trim()) return `company:${p.company.trim().toLowerCase()}|${fallback}`;
  return undefined;
}

function blank(id, at, source) {
  return { id, name: "", company: "", role: "", email: "", events: [], firstMetAt: at, lastMetAt: at, conversationIds: [], source, notes: "" };
}

/**
 * The owner's network: every person they've talked to or who left their info
 * on the card, folded so someone met twice shows once with both events.
 * Conversations where nothing about the person was captured are left out.
 */
export function buildContacts(conversations, visitors = []) {
  const byKey = new Map();

  for (const c of [...conversations].sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
    const key = keyFor(c.recruiter, c.id);
    if (!key) continue;
    const r = c.recruiter;
    const contact = byKey.get(key) ?? blank(key, c.startedAt, "conversation");
    // Later conversations win for details, but never blank out a value we already had.
    contact.name = r.name.trim() || contact.name;
    contact.company = r.company.trim() || contact.company;
    contact.role = r.role.trim() || contact.role;
    contact.email = r.email.trim() || contact.email;
    if (c.eventName && !contact.events.includes(c.eventName)) contact.events.push(c.eventName);
    contact.lastMetAt = c.startedAt > contact.lastMetAt ? c.startedAt : contact.lastMetAt;
    contact.conversationIds.push(c.id);
    contact.latestConversationId = c.id;
    contact.notes = c.notes.trim() || contact.notes;
    contact.followUp = c.followUp ? { status: c.followUp.status, sendOn: c.followUp.sendOn } : contact.followUp;
    if (contact.source === "visitor") contact.source = "both";
    byKey.set(key, contact);
  }

  for (const v of [...visitors].sort((a, b) => a.at.localeCompare(b.at))) {
    const key = keyFor(v, v.id);
    if (!key) continue;
    const contact = byKey.get(key) ?? blank(key, v.at, "visitor");
    contact.name = contact.name || v.name;
    contact.company = contact.company || v.company;
    contact.role = contact.role || v.role;
    contact.email = contact.email || v.email;
    if (v.eventName && !contact.events.includes(v.eventName)) contact.events.push(v.eventName);
    if (v.at < contact.firstMetAt) contact.firstMetAt = v.at;
    if (v.at > contact.lastMetAt) contact.lastMetAt = v.at;
    if (v.conversationId && !contact.conversationIds.includes(v.conversationId)) {
      contact.conversationIds.push(v.conversationId);
      contact.latestConversationId ??= v.conversationId;
    }
    if (v.note && !contact.notes) contact.notes = `They wrote: ${v.note}`;
    if (contact.source === "conversation") contact.source = "both";
    byKey.set(key, contact);
  }

  return Array.from(byKey.values()).sort((a, b) => b.lastMetAt.localeCompare(a.lastMetAt));
}
