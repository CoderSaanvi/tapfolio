import Link from "next/link";
import { dueLabel, isDue } from "@/lib/followup-status";
import { timeAgo } from "@/lib/time";

export function ConversationRow({ conversation: c, views }) {
  const f = c.followUp;
  const chip = f ? dueLabel(f) : c.endedAt ? "Needs draft" : "In progress";
  const urgent = f ? isDue(f) : Boolean(c.endedAt);
  const who = [c.recruiter.name, c.recruiter.company].filter(Boolean).join(" · ") || "New contact";

  return (
    <Link
      href={`/conversations/${c.id}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4 font-sys text-ink no-underline hover:border-scarlet/50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{who}</p>
        <p className="truncate text-xs text-ink-2">
          {c.eventName || "No event"} · {timeAgo(c.startedAt)} · {views === 0 ? "card not opened" : `opened card ${views}×`}
        </p>
      </div>
      <span
        className={`flex-none rounded-full px-2.5 py-1 text-xs font-semibold ${
          urgent ? "bg-scarlet text-white" : f?.status === "sent" ? "bg-wash text-ink-2" : "bg-scarlet-tint text-scarlet-bright"
        }`}
      >
        {chip}
      </span>
    </Link>
  );
}
