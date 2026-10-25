import type { Contact, Conversation } from "./types";

/** One key per person: their email when we have it, else name + company. */
function keyFor(c: Conversation): string | undefined {
  const r = c.recruiter;
  if (r.email.trim()) return `email:${r.email.trim().toLowerCase()}`;
  if (r.name.trim()) return `name:${r.name.trim().toLowerCase()}|${r.company.trim().toLowerCase()}`;
  if (r.company.trim()) return `company:${r.company.trim().toLowerCase()}|${c.id}`;
  return undefined;
}

/**
 * The owner's network: every person they've talked to, folded across
 * conversations so someone met twice shows once with both events.
 * Conversations where nothing about the person was captured are left out.
 */
export function buildContacts(conversations: Conversation[]): Contact[] {
  const byKey = new Map<string, Contact>();
  const ordered = [...conversations].sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  for (const c of ordered) {
    const key = keyFor(c);
    if (!key) continue;
    const r = c.recruiter;
    const existing = byKey.get(key);
    const contact: Contact = existing ?? {
      id: key,
      name: "",
      company: "",
      role: "",
      email: "",
      events: [],
      firstMetAt: c.startedAt,
      lastMetAt: c.startedAt,
      conversationIds: [],
      latestConversationId: c.id,
      notes: "",
    };
    // Later conversations win for details, but never blank out a value we already had.
    contact.name = r.name.trim() || contact.name;
    contact.company = r.company.trim() || contact.company;
    contact.role = r.role.trim() || contact.role;
    contact.email = r.email.trim() || contact.email;
    if (c.eventName && !contact.events.includes(c.eventName)) contact.events.push(c.eventName);
    contact.lastMetAt = c.startedAt;
    contact.conversationIds.push(c.id);
    contact.latestConversationId = c.id;
    contact.notes = c.notes.trim() || contact.notes;
    contact.followUp = c.followUp ? { status: c.followUp.status, sendOn: c.followUp.sendOn } : contact.followUp;
    byKey.set(key, contact);
  }

  return Array.from(byKey.values()).sort((a, b) => b.lastMetAt.localeCompare(a.lastMetAt));
}
