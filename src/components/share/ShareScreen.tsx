"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConversationRecorder } from "./ConversationRecorder";
import { EventField } from "./EventField";
import { QrCode } from "./QrCode";
import { TapShareButton } from "./TapShareButton";
import type { Profile } from "@/lib/types";

interface ShareScreenProps {
  profile: Profile;
}

export function ShareScreen({ profile: p }: ShareScreenProps) {
  const [origin, setOrigin] = useState("");
  const [eventName, setEventName] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => setOrigin(window.location.origin), []);

  // The shared link carries the conversation id, so the recruiter's views attach to this conversation.
  const cardUrl = useMemo(() => {
    if (!origin) return "";
    const u = new URL(`/c/${p.slug}`, origin);
    if (eventName.trim()) u.searchParams.set("ev", eventName.trim());
    if (conversationId) u.searchParams.set("c", conversationId);
    return u.toString();
  }, [origin, eventName, conversationId, p.slug]);
  const withSrc = (src: string) => (cardUrl ? `${cardUrl}${cardUrl.includes("?") ? "&" : "?"}src=${src}` : "");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 bg-wash px-4 pb-10 pt-[max(20px,env(safe-area-inset-top))] font-sys">
      <header className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-scarlet">
          <Image src={p.photo} alt="" fill sizes="48px" className="object-cover object-top" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold">{p.firstName} {p.lastName}</p>
          <p className="text-xs text-ink-2">{conversationId ? "In a conversation" : "Ready to share"}</p>
        </div>
        <Link href="/activity" className="ml-auto rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink no-underline">
          Activity
        </Link>
      </header>

      <EventField value={eventName} onChange={setEventName} />
      <ConversationRecorder slug={p.slug} eventName={eventName} onConversation={setConversationId} />

      <TapShareButton url={withSrc("tap")} title={`${p.firstName} ${p.lastName}`} />
      <p className="-mt-2 text-center text-xs leading-relaxed text-ink-2">
        iPhone: tap, choose <b>AirDrop</b>, and hold the tops of your phones together. Android: choose <b>Quick Share</b>.
      </p>

      <div className="flex items-center gap-3 text-[10.5px] uppercase tracking-[.26em] text-ink-2 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        or scan
      </div>

      <div className="rounded-3xl border border-line border-t-4 border-t-scarlet bg-white p-6 shadow-card">
        <div className="mx-auto w-full max-w-[280px]">{cardUrl && <QrCode value={withSrc("qr")} />}</div>
        <p className="mt-4 break-all text-center font-mono text-[11px] text-ink-2">{cardUrl}</p>
      </div>

      <Link href={`/c/${p.slug}`} className="text-center text-sm font-semibold text-scarlet">
        Preview what they&apos;ll see →
      </Link>
    </main>
  );
}
