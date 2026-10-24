import Link from "next/link";
import { ConversationRow } from "@/components/activity/ConversationRow";
import { SessionCard } from "@/components/activity/SessionCard";
import { listConversations } from "@/lib/conversations-store";
import { listEvents } from "@/lib/events-store";
import { isDue } from "@/lib/followup-status";
import { summarizeSessions } from "@/lib/sessions";
import type { Conversation, ViewEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

async function load(): Promise<{ conversations: Conversation[]; events: ViewEvent[]; error: boolean }> {
  try {
    const [conversations, events] = await Promise.all([listConversations(), listEvents()]);
    return { conversations, events, error: false };
  } catch {
    return { conversations: [], events: [], error: true };
  }
}

export default async function ActivityPage() {
  const { conversations, events, error } = await load();
  // Due follow-ups first, then newest.
  const ordered = [...conversations].sort((a, b) => Number(Boolean(b.followUp && isDue(b.followUp))) - Number(Boolean(a.followUp && isDue(a.followUp))));
  const viewsFor = (id: string) => new Set(events.filter((e) => e.conversationId === id).map((e) => e.sessionId)).size;
  const looseSessions = summarizeSessions(events.filter((e) => !e.conversationId));

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 bg-wash px-4 pb-12 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase">Activity</h1>
          <p className="text-sm text-ink-2">Your conversations, follow-ups, and who opened your card.</p>
        </div>
        <Link href="/" className="rounded-full border border-line bg-white px-3 py-1.5 font-sys text-xs font-semibold text-ink no-underline">
          ← Share
        </Link>
      </header>

      {error && <p className="rounded-xl bg-scarlet-tint p-4 text-sm text-scarlet-deep">Couldn&apos;t read your activity.</p>}

      <h2 className="mt-2 font-display text-2xl font-extrabold uppercase">Conversations</h2>
      {ordered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink-2">
          Tap <b>Start conversation</b> on the share screen when you walk up to a recruiter.
        </p>
      ) : (
        ordered.map((c) => <ConversationRow key={c.id} conversation={c} views={viewsFor(c.id)} />)
      )}

      {looseSessions.length > 0 && (
        <>
          <h2 className="mt-4 font-display text-2xl font-extrabold uppercase">Other card views</h2>
          {looseSessions.map((s) => (
            <SessionCard key={s.sessionId} session={s} />
          ))}
        </>
      )}
    </main>
  );
}
