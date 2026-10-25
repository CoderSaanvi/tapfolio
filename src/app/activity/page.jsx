import Link from "next/link";
import { OwnerTabBar } from "@/components/ui/OwnerTabBar";
import { ConversationRow } from "@/components/activity/ConversationRow";
import { InsightsPanel } from "@/components/activity/InsightsPanel";
import { SessionCard } from "@/components/activity/SessionCard";
import { computeInsights } from "@/lib/insights";
import { redirect } from "next/navigation";
import { listConversations } from "@/lib/conversations-store";
import { listEvents } from "@/lib/events-store";
import { isDue } from "@/lib/followup-status";
import { getOwnerProfile } from "@/lib/profiles";
import { eventsForConversation, summarizeSessions } from "@/lib/sessions";

export const dynamic = "force-dynamic";

async function load(slug) {
  try {
    const [conversations, events] = await Promise.all([listConversations(slug), listEvents(slug)]);
    return { conversations, events, error: false };
  } catch {
    return { conversations: [], events: [], error: true };
  }
}

export default async function ActivityPage() {
  const owner = await getOwnerProfile().catch(() => undefined);
  if (!owner) redirect("/onboarding");
  const { conversations, events, error } = await load(owner.slug);
  // Due follow-ups first, then newest.
  const ordered = [...conversations].sort((a, b) => Number(Boolean(b.followUp && isDue(b.followUp))) - Number(Boolean(a.followUp && isDue(a.followUp))));
  const linked = new Map(conversations.map((c) => [c.id, eventsForConversation(events, c)]));
  const claimed = new Set(
    Array.from(linked.values())
      .flat()
      .map((e) => e.sessionId),
  );
  const viewsFor = (id) => new Set((linked.get(id) ?? []).map((e) => e.sessionId)).size;
  const looseSessions = summarizeSessions(events.filter((e) => !claimed.has(e.sessionId)));

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 pb-32 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-ink-2">Your conversations, follow-ups, and who opened your card.</p>
        </div>
        <Link href="/" className="rounded-full border border-line bg-card px-3 py-1.5 font-sys text-xs font-semibold text-ink no-underline">
          ← Share
        </Link>
      </header>

      {error && <p className="rounded-xl bg-scarlet-tint p-4 text-sm text-scarlet-bright">Couldn&apos;t read your activity.</p>}

      {events.length > 0 && <InsightsPanel insights={computeInsights(events)} />}

      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">Conversations</h2>
      {ordered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-card p-6 text-center text-sm text-ink-2">
          Tap <b>Start conversation</b> on the share screen when you walk up to a recruiter.
        </p>
      ) : (
        ordered.map((c) => <ConversationRow key={c.id} conversation={c} views={viewsFor(c.id)} />)
      )}

      {looseSessions.length > 0 && (
        <>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">Other card views</h2>
          {looseSessions.map((s) => (
            <SessionCard key={s.sessionId} session={s} />
          ))}
        </>
      )}
      <OwnerTabBar />
    </main>
  );
}
