import Link from "next/link";
import { notFound } from "next/navigation";
import { SessionCard } from "@/components/activity/SessionCard";
import { ConversationEditor } from "@/components/conversation/ConversationEditor";
import { getConversation } from "@/lib/conversations-store";
import { listEvents } from "@/lib/events-store";
import { summarizeSessions } from "@/lib/sessions";
import { formatDuration } from "@/lib/time";

export const dynamic = "force-dynamic";

interface ConversationPageProps {
  params: { id: string };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const convo = await getConversation(params.id).catch(() => undefined);
  if (!convo) notFound();
  const events = await listEvents().catch(() => []);
  const sessions = summarizeSessions(events.filter((e) => e.conversationId === convo.id));
  const length = convo.endedAt ? formatDuration(new Date(convo.endedAt).getTime() - new Date(convo.startedAt).getTime()) : "In progress";

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 bg-wash px-4 pb-12 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase leading-none">{convo.recruiter.name || "New contact"}</h1>
          <p className="mt-1 text-sm text-ink-2">
            {convo.eventName || "No event set"} · {new Date(convo.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {length}
          </p>
        </div>
        <Link href="/activity" className="flex-none rounded-full border border-line bg-white px-3 py-1.5 font-sys text-xs font-semibold text-ink no-underline">
          ← All
        </Link>
      </header>

      <ConversationEditor initial={convo} />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold uppercase">What they looked at</h2>
        {sessions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-white p-5 text-center text-sm text-ink-2">
            They haven&apos;t opened your card from this conversation yet. If they do later, it shows up here, and a redraft will use it.
          </p>
        ) : (
          sessions.map((s) => <SessionCard key={s.sessionId} session={s} />)
        )}
      </section>
    </main>
  );
}
