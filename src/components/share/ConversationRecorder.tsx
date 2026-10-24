"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { patchConversation, startConversation } from "@/lib/conversation-client";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { formatDuration } from "@/lib/time";

interface ConversationRecorderProps {
  slug: string;
  eventName: string;
  onConversation: (id: string | null) => void;
}

const AUTOSAVE_MS = 15_000;

export function ConversationRecorder({ slug, eventName, onConversation }: ConversationRecorderProps) {
  const router = useRouter();
  const speech = useSpeechRecognition();
  const [id, setId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef({ transcript: "", notes: "" });
  latest.current = { transcript: speech.finalText, notes };

  useEffect(() => {
    if (!id) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const save = setInterval(() => void patchConversation(id, latest.current).catch(() => undefined), AUTOSAVE_MS);
    return () => {
      clearInterval(tick);
      clearInterval(save);
    };
  }, [id]);

  async function begin() {
    setBusy(true);
    setError(null);
    try {
      const convo = await startConversation(slug, eventName);
      speech.reset();
      setNotes("");
      setId(convo.id);
      setStartedAt(Date.now());
      setNow(Date.now());
      onConversation(convo.id);
      if (speech.supported) speech.start();
    } catch {
      setError("Couldn't start. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function end() {
    if (!id) return;
    setBusy(true);
    speech.stop();
    try {
      await patchConversation(id, { ...latest.current, end: true });
      onConversation(null);
      router.push(`/conversations/${id}`);
    } catch {
      setError("Couldn't save. Try again.");
      setBusy(false);
    }
  }

  if (!id) {
    return (
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={begin} disabled={busy} className="flex items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-scarlet bg-card px-5 py-4 text-[15px] font-semibold text-scarlet-bright disabled:opacity-60">
          <span className="h-3 w-3 rounded-full bg-scarlet" /> Start conversation
        </button>
        <p className="text-center text-xs text-ink-2">
          {speech.supported ? "Records a transcript so Claude can draft your follow-up. Ask before recording." : "Live transcript isn't supported in this browser. You can type notes instead."}
        </p>
        {error && <p className="text-center text-xs text-scarlet-bright">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-scarlet/40 bg-card p-4">
      <div className="flex items-center gap-2.5 text-sm font-semibold">
        <span className={`h-2.5 w-2.5 rounded-full bg-scarlet ${speech.listening ? "animate-pulse" : "opacity-40"}`} />
        {speech.listening ? "Listening" : "Not recording"} · <span className="font-mono tabular-nums">{formatDuration(Math.max(0, now - startedAt))}</span>
        <button type="button" onClick={end} disabled={busy} className="ml-auto rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-night disabled:opacity-60">
          End &amp; review
        </button>
      </div>
      <p className="max-h-28 overflow-y-auto text-sm leading-relaxed text-ink-2">
        {speech.finalText || speech.interim ? (
          <>
            {speech.finalText.split(" ").slice(-60).join(" ")} <span className="text-osugray">{speech.interim}</span>
          </>
        ) : (
          "Transcript will appear here as you talk."
        )}
      </p>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Quick notes: their name, team, what to follow up on…" className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-scarlet" />
      {(speech.error || error) && <p className="text-xs text-scarlet-bright">{speech.error ?? error}</p>}
    </div>
  );
}
