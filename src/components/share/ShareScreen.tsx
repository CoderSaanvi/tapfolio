"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OwnerTabBar } from "@/components/ui/OwnerTabBar";
import { ConversationRecorder } from "./ConversationRecorder";
import { EventField } from "./EventField";
import { QrCode } from "./QrCode";
import { TapShareButton } from "./TapShareButton";
import type { Profile } from "@/lib/types";

interface ShareScreenProps {
  profile: Profile;
  justBuilt?: boolean;
}

/** Home screen of the owner app: the QR and tap-to-share come first, everything else is below. */
export function ShareScreen({ profile: p, justBuilt }: ShareScreenProps) {
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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-32 pt-[max(16px,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3 py-1">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-scarlet">
          <Image src={p.photo} alt="" fill sizes="40px" className="object-cover object-top" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold">{p.firstName} {p.lastName}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-2">
            <span className={`h-1.5 w-1.5 rounded-full ${conversationId ? "animate-pulse bg-scarlet-bright" : "bg-emerald-400"}`} />
            {conversationId ? "In a conversation" : "Ready to share"}
          </p>
        </div>
        <Link href={`/c/${p.slug}`} className="ml-auto rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink no-underline">
          Preview card
        </Link>
      </header>

      {justBuilt && (
        <Link href={`/c/${p.slug}`} className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-ink no-underline">
          <span className="text-lg">✓</span>
          <span className="flex-1"><b className="font-semibold">Your Tapfolio is ready.</b> Take a look before you share it.</span>
          <span className="text-emerald-400">Open ›</span>
        </Link>
      )}

      <div className="rounded-[28px] border border-line border-t-[3px] border-t-scarlet bg-card p-5 shadow-card">
        <div className="mx-auto w-full max-w-[260px] rounded-2xl bg-white p-4">{cardUrl && <QrCode value={withSrc("qr")} />}</div>
        <p className="mt-3 text-center text-xs text-ink-2">Have them point their camera here</p>
        <div className="mt-4">
          <TapShareButton url={withSrc("tap")} title={`${p.firstName} ${p.lastName}`} />
        </div>
        <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-ink-2">
          iPhone: choose <b className="font-medium text-ink">AirDrop</b> and hold your phones together. Android: <b className="font-medium text-ink">Quick Share</b>.
        </p>
      </div>

      <p className="mt-2 px-1 font-mono text-[11px] uppercase tracking-[.14em] text-ink-2">At the booth</p>
      <EventField value={eventName} onChange={setEventName} />
      <ConversationRecorder slug={p.slug} eventName={eventName} onConversation={setConversationId} />

      <Link href="/onboarding" className="mt-4 text-center text-xs text-ink-2 no-underline">
        New resume? <span className="text-scarlet-bright">Rebuild my card</span>
      </Link>

      <OwnerTabBar />
    </main>
  );
}
