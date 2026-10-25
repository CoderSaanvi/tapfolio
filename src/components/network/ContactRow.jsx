import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { timeAgo } from "@/lib/time";

function initials(c) {
  const source = c.name || c.company || c.email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ContactRow({ contact: c }) {
  const where = [c.company, c.role].filter(Boolean).join(" · ");
  const status = c.followUp?.status === "sent" ? "Followed up" : c.followUp ? "Follow-up drafted" : "Needs follow-up";
  const body = (
    <>
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-scarlet-tint font-display text-sm font-bold text-scarlet-bright">
        {initials(c)}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-ink">{c.name || c.email || c.company}</span>
        {where && <span className="block truncate text-xs text-ink-2">{where}</span>}
        <span className="block truncate text-xs text-ink-2">
          {c.source !== "conversation" && "Left their info · "}
          {c.events[0] ? `${c.events[0]} · ` : ""}
          {timeAgo(c.lastMetAt)}
          {c.conversationIds.length > 1 && ` · met ${c.conversationIds.length}×`}
        </span>
        {c.notes && <span className="mt-1 block truncate text-xs italic text-ink-2">{c.notes}</span>}
      </span>
    </>
  );

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4 font-sys">
      {c.latestConversationId ? (
        <Link href={`/conversations/${c.latestConversationId}`} className="flex min-w-0 flex-1 items-center gap-3 no-underline">
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      <div className="flex flex-none items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.followUp?.status === "sent" ? "bg-wash text-ink-2" : "bg-scarlet-tint text-scarlet-bright"}`}
        >
          {status}
        </span>
        {c.email && (
          <a href={`mailto:${c.email}`} aria-label={`Email ${c.name || c.email}`} className="rounded-full border border-line bg-wash p-2 text-ink no-underline">
            <Icon name="mail" className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
